-- ====================================================================
-- SALESPULSE: SQL REGIONAL & GEOGRAPHIC PERFORMANCE ANALYSIS
-- ====================================================================

-- 1. MACRO REGIONAL PERFORMANCE COMPARISON
SELECT 
    g.region,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS distinct_customers,
    SUM(f.quantity) AS total_units_sold,
    SUM(f.sales) AS total_revenue,
    ROUND((SUM(f.sales) / (SELECT SUM(sales) FROM fact_sales)) * 100, 2) AS revenue_share_pct,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct
FROM fact_sales f
JOIN dim_geography g ON f.geography_id = g.geography_id
GROUP BY g.region
ORDER BY total_revenue DESC;

-- 2. STATE RANKINGS: TOP 10 HIGHEST REVENUE STATES
SELECT 
    g.state,
    g.region,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    COUNT(DISTINCT f.order_id) AS order_count
FROM fact_sales f
JOIN dim_geography g ON f.geography_id = g.geography_id
GROUP BY g.state, g.region
ORDER BY total_revenue DESC
LIMIT 10;

-- 3. STATE ANOMALIES: LOSS-MAKING STATES
SELECT 
    g.state,
    g.region,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_loss,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    COUNT(DISTINCT f.order_id) AS order_count
FROM fact_sales f
JOIN dim_geography g ON f.geography_id = g.geography_id
GROUP BY g.state, g.region
HAVING SUM(f.profit) < 0
ORDER BY total_loss ASC;

-- 4. TOP 10 CITIES BY PROFITABILITY
SELECT 
    g.city,
    g.state,
    g.region,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    COUNT(DISTINCT f.order_id) AS total_orders
FROM fact_sales f
JOIN dim_geography g ON f.geography_id = g.geography_id
GROUP BY g.city, g.state, g.region
ORDER BY total_profit DESC
LIMIT 10;

