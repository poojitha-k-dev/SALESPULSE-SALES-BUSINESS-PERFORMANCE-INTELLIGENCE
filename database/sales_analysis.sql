-- ====================================================================
-- SALESPULSE: SQL SALES & REVENUE ANALYSIS QUERIES
-- Analytical queries implementing window functions, CTEs, and aggregates
-- ====================================================================

-- 1. ANNUAL REVENUE & PROFIT OVERVIEW WITH YOY GROWTH
WITH yearly_metrics AS (
    SELECT 
        order_year,
        SUM(sales) AS total_revenue,
        SUM(profit) AS total_profit,
        COUNT(DISTINCT order_id) AS total_orders,
        SUM(quantity) AS total_units_sold,
        ROUND(SUM(sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS aov,
        ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct
    FROM fact_sales
    GROUP BY order_year
)
SELECT 
    order_year,
    total_revenue,
    LAG(total_revenue) OVER (ORDER BY order_year) AS prev_year_revenue,
    ROUND(((total_revenue - LAG(total_revenue) OVER (ORDER BY order_year)) / NULLIF(LAG(total_revenue) OVER (ORDER BY order_year), 0)) * 100, 2) AS yoy_revenue_growth_pct,
    total_profit,
    LAG(total_profit) OVER (ORDER BY order_year) AS prev_year_profit,
    ROUND(((total_profit - LAG(total_profit) OVER (ORDER BY order_year)) / NULLIF(ABS(LAG(total_profit) OVER (ORDER BY order_year)), 0)) * 100, 2) AS yoy_profit_growth_pct,
    total_orders,
    aov,
    profit_margin_pct
FROM yearly_metrics
ORDER BY order_year;

-- 2. MONTH-OVER-MONTH (MoM) REVENUE & PROFIT TRENDS WITH ROLLING AVERAGES
WITH monthly_summary AS (
    SELECT 
        order_year_month,
        order_year,
        order_month,
        SUM(sales) AS revenue,
        SUM(profit) AS profit,
        COUNT(DISTINCT order_id) AS orders,
        SUM(quantity) AS units
    FROM fact_sales
    GROUP BY order_year_month, order_year, order_month
)
SELECT 
    order_year_month,
    revenue,
    LAG(revenue) OVER (ORDER BY order_year_month) AS prev_month_revenue,
    ROUND(((revenue - LAG(revenue) OVER (ORDER BY order_year_month)) / NULLIF(LAG(revenue) OVER (ORDER BY order_year_month), 0)) * 100, 2) AS mom_growth_pct,
    profit,
    ROUND((profit / NULLIF(revenue, 0)) * 100, 2) AS profit_margin_pct,
    orders,
    ROUND(revenue / NULLIF(orders, 0), 2) AS aov,
    ROUND(AVG(revenue) OVER (ORDER BY order_year_month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS rolling_3mo_avg_revenue
FROM monthly_summary
ORDER BY order_year_month;

-- 3. QUARTERLY PERFORMANCE COMPARISON
SELECT 
    order_year,
    order_quarter,
    SUM(sales) AS quarterly_revenue,
    SUM(profit) AS quarterly_profit,
    COUNT(DISTINCT order_id) AS quarterly_orders,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales
GROUP BY order_year, order_quarter
ORDER BY order_year, order_quarter;

-- 4. DAY OF THE WEEK SALES DISTRIBUTION (SEASONALITY)
SELECT 
    TRIM(order_day_of_week) AS day_of_week,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(sales) AS total_revenue,
    ROUND(SUM(sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS aov,
    ROUND((SUM(sales) / (SELECT SUM(sales) FROM fact_sales)) * 100, 2) AS revenue_share_pct
FROM fact_sales
GROUP BY TRIM(order_day_of_week)
ORDER BY total_revenue DESC;

-- 5. SHIPPING MODE EFFICIENCY & PROFITABILITY
SELECT 
    ship_mode,
    COUNT(DISTINCT order_id) AS order_count,
    ROUND(AVG(shipping_days), 1) AS avg_delivery_days,
    SUM(sales) AS total_sales,
    SUM(profit) AS total_profit,
    ROUND((SUM(profit) / NULLIF(SUM(sales), 0)) * 100, 2) AS profit_margin_pct
FROM fact_sales
GROUP BY ship_mode
ORDER BY total_sales DESC;

