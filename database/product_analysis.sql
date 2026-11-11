-- ====================================================================
-- SALESPULSE: SQL PRODUCT PERFORMANCE & CATEGORY ANALYSIS
-- ====================================================================

-- 1. CATEGORY & SUBCATEGORY REVENUE & PROFIT MATRIX
SELECT 
    p.category,
    p.sub_category,
    COUNT(DISTINCT f.order_id) AS distinct_orders,
    SUM(f.quantity) AS units_sold,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    COUNT(CASE WHEN f.profit < 0 THEN 1 END) AS loss_line_items,
    COALESCE(SUM(CASE WHEN f.profit < 0 THEN ABS(f.profit) ELSE 0 END), 0) AS total_losses
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category, p.sub_category
ORDER BY total_revenue DESC;

-- 2. TOP 10 HIGHEST REVENUE PRODUCTS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    SUM(f.quantity) AS units_sold
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY total_revenue DESC
LIMIT 10;

-- 3. TOP 10 MOST PROFITABLE PRODUCTS
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    SUM(f.quantity) AS units_sold
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
ORDER BY total_profit DESC
LIMIT 10;

-- 4. TOP 10 WORST LOSS-MAKING PRODUCTS (ACTION REQUIRED)
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    p.sub_category,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_loss,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
    SUM(f.quantity) AS units_sold
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.category, p.sub_category
HAVING SUM(f.profit) < 0
ORDER BY total_loss ASC
LIMIT 10;

-- 5. HIGH-REVENUE BUT LOW/NEGATIVE PROFIT "REVENUE TRAPS"
-- Products with sales in top 20% but margin below 5% or negative
WITH product_stats AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.sub_category,
        SUM(f.sales) AS revenue,
        SUM(f.profit) AS profit,
        ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS margin_pct,
        ROUND(AVG(f.discount) * 100, 2) AS avg_discount_pct,
        NTILE(5) OVER (ORDER BY SUM(f.sales) DESC) as sales_quintile
    FROM fact_sales f
    JOIN dim_products p ON f.product_id = p.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.sub_category
)
SELECT 
    product_id,
    product_name,
    category,
    sub_category,
    revenue,
    profit,
    margin_pct,
    avg_discount_pct
FROM product_stats
WHERE sales_quintile = 1 AND margin_pct < 5.0
ORDER BY profit ASC
LIMIT 15;

