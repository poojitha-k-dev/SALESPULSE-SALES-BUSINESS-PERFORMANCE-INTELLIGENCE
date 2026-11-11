-- ====================================================================
-- SALESPULSE: POSTGRESQL DATABASE SCHEMA
-- Database: salespulse_db
-- Architecture: Star Schema (Fact + Dimensions) + Summary Aggregations
-- ====================================================================

-- 1. DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS agg_regional_performance CASCADE;
DROP TABLE IF EXISTS agg_category_performance CASCADE;
DROP TABLE IF EXISTS agg_monthly_sales CASCADE;
DROP TABLE IF EXISTS fact_sales CASCADE;
DROP TABLE IF EXISTS dim_geography CASCADE;
DROP TABLE IF EXISTS dim_customers CASCADE;
DROP TABLE IF EXISTS dim_products CASCADE;
DROP TABLE IF EXISTS staging_superstore CASCADE;

-- 2. STAGING TABLE FOR RAW INGESTION
CREATE TABLE staging_superstore (
    row_id INTEGER PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    ship_mode VARCHAR(30) NOT NULL,
    customer_id VARCHAR(30) NOT NULL,
    customer_name VARCHAR(120) NOT NULL,
    segment VARCHAR(30) NOT NULL,
    country VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(60) NOT NULL,
    postal_code VARCHAR(20),
    region VARCHAR(30) NOT NULL,
    product_id VARCHAR(40) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    product_name VARCHAR(300) NOT NULL,
    sales NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    discount NUMERIC(5, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL
);

-- 3. DIMENSION: PRODUCTS
CREATE TABLE dim_products (
    product_id VARCHAR(40) PRIMARY KEY,
    product_name VARCHAR(300) NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_products_cat ON dim_products(category);
CREATE INDEX idx_dim_products_subcat ON dim_products(sub_category);

-- 4. DIMENSION: CUSTOMERS
CREATE TABLE dim_customers (
    customer_id VARCHAR(30) PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    segment VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dim_customers_segment ON dim_customers(segment);

-- 5. DIMENSION: GEOGRAPHY
CREATE TABLE dim_geography (
    geography_id SERIAL PRIMARY KEY,
    country VARCHAR(50) NOT NULL,
    region VARCHAR(30) NOT NULL,
    state VARCHAR(60) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    CONSTRAINT uq_geography UNIQUE (country, region, state, city, postal_code)
);

CREATE INDEX idx_dim_geography_region ON dim_geography(region);
CREATE INDEX idx_dim_geography_state ON dim_geography(state);

-- 6. FACT TABLE: SALES TRANSACTIONS
CREATE TABLE fact_sales (
    row_id INTEGER PRIMARY KEY,
    order_id VARCHAR(30) NOT NULL,
    order_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    ship_mode VARCHAR(30) NOT NULL,
    customer_id VARCHAR(30) NOT NULL REFERENCES dim_customers(customer_id),
    product_id VARCHAR(40) NOT NULL REFERENCES dim_products(product_id),
    geography_id INTEGER NOT NULL REFERENCES dim_geography(geography_id),
    sales NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    discount NUMERIC(5, 2) NOT NULL,
    profit NUMERIC(12, 2) NOT NULL,
    cost NUMERIC(12, 2) NOT NULL,
    profit_margin_pct NUMERIC(8, 2) NOT NULL,
    is_profitable BOOLEAN NOT NULL,
    discount_tier VARCHAR(30) NOT NULL,
    shipping_days INTEGER NOT NULL,
    order_year INTEGER NOT NULL,
    order_quarter VARCHAR(5) NOT NULL,
    order_month INTEGER NOT NULL,
    order_year_month VARCHAR(7) NOT NULL,
    order_day_of_week VARCHAR(15) NOT NULL
);

-- Optimize Analytical Filter & Join Indexes
CREATE INDEX idx_fact_sales_order_date ON fact_sales(order_date);
CREATE INDEX idx_fact_sales_year_month ON fact_sales(order_year_month);
CREATE INDEX idx_fact_sales_customer ON fact_sales(customer_id);
CREATE INDEX idx_fact_sales_product ON fact_sales(product_id);
CREATE INDEX idx_fact_sales_geography ON fact_sales(geography_id);
CREATE INDEX idx_fact_sales_order_id ON fact_sales(order_id);

-- 7. AGGREGATE SUMMARY: MONTHLY PERFORMANCE
CREATE TABLE agg_monthly_sales (
    year_month VARCHAR(7) PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_revenue NUMERIC(14, 2) NOT NULL,
    total_profit NUMERIC(14, 2) NOT NULL,
    total_orders INTEGER NOT NULL,
    total_units INTEGER NOT NULL,
    avg_order_value NUMERIC(10, 2) NOT NULL,
    profit_margin_pct NUMERIC(6, 2) NOT NULL,
    profitable_orders INTEGER NOT NULL,
    loss_orders INTEGER NOT NULL
);

-- 8. AGGREGATE SUMMARY: CATEGORY PERFORMANCE
CREATE TABLE agg_category_performance (
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    total_revenue NUMERIC(14, 2) NOT NULL,
    total_profit NUMERIC(14, 2) NOT NULL,
    total_units INTEGER NOT NULL,
    total_orders INTEGER NOT NULL,
    avg_discount NUMERIC(5, 2) NOT NULL,
    profit_margin_pct NUMERIC(6, 2) NOT NULL,
    loss_transactions INTEGER NOT NULL,
    total_loss_amount NUMERIC(12, 2) NOT NULL,
    PRIMARY KEY (category, sub_category)
);

-- 9. AGGREGATE SUMMARY: REGIONAL PERFORMANCE
CREATE TABLE agg_regional_performance (
    region VARCHAR(30) NOT NULL,
    state VARCHAR(60) NOT NULL,
    total_revenue NUMERIC(14, 2) NOT NULL,
    total_profit NUMERIC(14, 2) NOT NULL,
    total_orders INTEGER NOT NULL,
    total_customers INTEGER NOT NULL,
    profit_margin_pct NUMERIC(6, 2) NOT NULL,
    PRIMARY KEY (region, state)
);

