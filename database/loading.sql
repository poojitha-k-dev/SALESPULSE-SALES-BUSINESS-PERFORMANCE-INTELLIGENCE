-- ====================================================================
-- SALESPULSE: DIRECT SQL DATA LOADING & POPULATION SCRIPT
-- Populates dimension, fact, and aggregate tables from staging_superstore
-- ====================================================================

-- 1. POPULATE DIM_PRODUCTS
INSERT INTO dim_products (product_id, product_name, category, sub_category)
SELECT 
    product_id,
    MAX(product_name) AS product_name,
    MAX(category) AS category,
    MAX(sub_category) AS sub_category
FROM staging_superstore
GROUP BY product_id
ON CONFLICT (product_id) DO UPDATE 
SET product_name = EXCLUDED.product_name;

-- 2. POPULATE DIM_CUSTOMERS
INSERT INTO dim_customers (customer_id, customer_name, segment)
SELECT 
    customer_id,
    MAX(customer_name) AS customer_name,
    MAX(segment) AS segment
FROM staging_superstore
GROUP BY customer_id
ON CONFLICT (customer_id) DO UPDATE 
SET customer_name = EXCLUDED.customer_name;

-- 3. POPULATE DIM_GEOGRAPHY
INSERT INTO dim_geography (country, region, state, city, postal_code)
SELECT DISTINCT 
    country,
    region,
    state,
    city,
    COALESCE(postal_code, '00000') AS postal_code
FROM staging_superstore
ON CONFLICT (country, region, state, city, postal_code) DO NOTHING;

-- 4. POPULATE FACT_SALES
INSERT INTO fact_sales (
    row_id, order_id, order_date, ship_date, ship_mode,
    customer_id, product_id, geography_id,
    sales, quantity, discount, profit, cost, profit_margin_pct,
    is_profitable, discount_tier, shipping_days,
    order_year, order_quarter, order_month, order_year_month, order_day_of_week
)
SELECT 
    s.row_id,
    s.order_id,
    s.order_date,
    s.ship_date,
    s.ship_mode,
    s.customer_id,
    s.product_id,
    g.geography_id,
    s.sales,
    s.quantity,
    s.discount,
    s.profit,
    ROUND(s.sales - s.profit, 2) AS cost,
    CASE 
        WHEN s.sales > 0 THEN ROUND((s.profit / s.sales) * 100, 2)
        ELSE 0.00 
    END AS profit_margin_pct,
    (s.profit > 0) AS is_profitable,
    CASE 
        WHEN s.discount = 0 THEN 'No Discount'
        WHEN s.discount <= 0.20 THEN 'Low Discount (1-20%)'
        WHEN s.discount <= 0.40 THEN 'Medium Discount (21-40%)'
        ELSE 'High Discount (>40%)'
    END AS discount_tier,
    (s.ship_date - s.order_date) AS shipping_days,
    EXTRACT(YEAR FROM s.order_date)::INTEGER AS order_year,
    'Q' || EXTRACT(QUARTER FROM s.order_date)::TEXT AS order_quarter,
    EXTRACT(MONTH FROM s.order_date)::INTEGER AS order_month,
    TO_CHAR(s.order_date, 'YYYY-MM') AS order_year_month,
    TO_CHAR(s.order_date, 'Day') AS order_day_of_week
FROM staging_superstore s
JOIN dim_geography g ON 
    s.country = g.country AND 
    s.region = g.region AND 
    s.state = g.state AND 
    s.city = g.city AND 
    COALESCE(s.postal_code, '00000') = g.postal_code
ON CONFLICT (row_id) DO NOTHING;

-- 5. REFRESH AGGREGATE TABLES
TRUNCATE TABLE agg_monthly_sales;
INSERT INTO agg_monthly_sales
SELECT
    order_year_month AS year_month,
    order_year AS year,
    order_month AS month,
    SUM(sales) AS total_revenue,
    SUM(profit) AS total_profit,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(quantity) AS total_units,
    ROUND(SUM(sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS avg_order_value,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct,
    COUNT(DISTINCT CASE WHEN is_profitable THEN order_id END) AS profitable_orders,
    COUNT(DISTINCT CASE WHEN NOT is_profitable THEN order_id END) AS loss_orders
FROM fact_sales
GROUP BY order_year_month, order_year, order_month
ORDER BY order_year_month;

TRUNCATE TABLE agg_category_performance;
INSERT INTO agg_category_performance
SELECT
    p.category,
    p.sub_category,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    SUM(f.quantity) AS total_units,
    COUNT(DISTINCT f.order_id) AS total_orders,
    ROUND(AVG(f.discount), 4) AS avg_discount,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct,
    COUNT(CASE WHEN f.profit < 0 THEN 1 END) AS loss_transactions,
    COALESCE(SUM(CASE WHEN f.profit < 0 THEN ABS(f.profit) ELSE 0 END), 0) AS total_loss_amount
FROM fact_sales f
JOIN dim_products p ON f.product_id = p.product_id
GROUP BY p.category, p.sub_category
ORDER BY total_revenue DESC;

TRUNCATE TABLE agg_regional_performance;
INSERT INTO agg_regional_performance
SELECT
    g.region,
    g.state,
    SUM(f.sales) AS total_revenue,
    SUM(f.profit) AS total_profit,
    COUNT(DISTINCT f.order_id) AS total_orders,
    COUNT(DISTINCT f.customer_id) AS total_customers,
    ROUND((SUM(f.profit) / NULLIF(SUM(f.sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales f
JOIN dim_geography g ON f.geography_id = g.geography_id
GROUP BY g.region, g.state
ORDER BY g.region, total_revenue DESC;
