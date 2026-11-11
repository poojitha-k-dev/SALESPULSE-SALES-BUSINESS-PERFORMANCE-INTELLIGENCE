-- ====================================================================
-- SALESPULSE: SQL PROFITABILITY, DISCOUNT ELASTICITY & SEGMENT ANALYSIS
-- ====================================================================

-- 1. DISCOUNT TIER IMPACT ON PROFIT MARGIN & VOLUME
SELECT 
    discount_tier,
    COUNT(*) AS total_line_items,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM fact_sales)) * 100, 2) AS line_item_share_pct,
    SUM(sales) AS total_revenue,
    SUM(profit) AS total_profit,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS realized_profit_margin_pct,
    COUNT(CASE WHEN profit < 0 THEN 1 END) AS loss_transactions,
    ROUND((COUNT(CASE WHEN profit < 0 THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2) AS loss_rate_pct,
    COALESCE(SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0) AS cumulative_loss_amount
FROM fact_sales
GROUP BY discount_tier
ORDER BY total_revenue DESC;

-- 2. CUSTOMER SEGMENT PROFITABILITY & AVERAGE TICKET
SELECT 
    c.segment,
    COUNT(DISTINCT c.customer_id) AS distinct_customers,
    COUNT(DISTINCT f.order_id) AS distinct_orders,
    ROUND(COUNT(DISTINCT f.order_id)::NUMERIC / COUNT(DISTINCT c.customer_id), 2) AS orders_per_customer,
    SUM(f.quantity) AS total_units_sold,
    SUM(f.sales) AS total_revenue,
    ROUND((SUM(f.sales) / (SELECT SUM(sales) FROM fact_sales)) * 100, 2) AS revenue_contribution_pct,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / (SELECT SUM(profit) FROM fact_sales)) * 100, 2) AS profit_contribution_pct,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(SUM(f.sales) / NULLIF(COUNT(DISTINCT f.order_id), 0), 2) AS average_order_value
FROM fact_sales f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.segment
ORDER BY total_revenue DESC;

-- 3. TOP 15 CUSTOMERS BY TOTAL PROFIT CONTRIBUTION
SELECT 
    c.customer_id,
    c.customer_name,
    c.segment,
    COUNT(DISTINCT f.order_id) AS total_orders,
    SUM(f.sales) AS lifetime_revenue,
    SUM(f.profit) AS lifetime_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name, c.segment
ORDER BY lifetime_profit DESC
LIMIT 15;

-- 4. BOTTOM 10 CUSTOMERS BY NET PROFIT (LOSS GENERATING CUSTOMERS)
SELECT 
    c.customer_id,
    c.customer_name,
    c.segment,
    COUNT(DISTINCT f.order_id) AS total_orders,
    SUM(f.sales) AS lifetime_revenue,
    SUM(f.profit) AS cumulative_loss,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_received
FROM fact_sales f
JOIN dim_customers c ON f.customer_id = c.customer_id
GROUP BY c.customer_id, c.customer_name, c.segment
HAVING SUM(f.profit) < 0
ORDER BY cumulative_loss ASC
LIMIT 10;

