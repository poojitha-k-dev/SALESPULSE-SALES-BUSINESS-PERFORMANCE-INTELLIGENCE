-- ====================================================================
-- SALESPULSE: POWER BI DIM_DATE TABLE GENERATOR
-- Generates a calendar dimension table covering 2014-01-01 to 2018-12-31
-- ====================================================================

DROP TABLE IF EXISTS dim_date CASCADE;

CREATE TABLE dim_date (
    date_id DATE PRIMARY KEY,
    year INTEGER NOT NULL,
    quarter VARCHAR(5) NOT NULL,
    year_quarter VARCHAR(10) NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(15) NOT NULL,
    year_month VARCHAR(7) NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_week VARCHAR(15) NOT NULL,
    day_of_week_num INTEGER NOT NULL,
    is_weekend BOOLEAN NOT NULL
);

INSERT INTO dim_date
SELECT
    d::DATE AS date_id,
    EXTRACT(YEAR FROM d)::INTEGER AS year,
    'Q' || EXTRACT(QUARTER FROM d)::TEXT AS quarter,
    EXTRACT(YEAR FROM d)::TEXT || '-Q' || EXTRACT(QUARTER FROM d)::TEXT AS year_quarter,
    EXTRACT(MONTH FROM d)::INTEGER AS month,
    TO_CHAR(d, 'Mon') AS month_name,
    TO_CHAR(d, 'YYYY-MM') AS year_month,
    EXTRACT(DAY FROM d)::INTEGER AS day_of_month,
    TRIM(TO_CHAR(d, 'Day')) AS day_of_week,
    EXTRACT(ISODOW FROM d)::INTEGER AS day_of_week_num,
    CASE WHEN EXTRACT(ISODOW FROM d) IN (6, 7) THEN TRUE ELSE FALSE END AS is_weekend
FROM GENERATE_SERIES('2014-01-01'::DATE, '2018-12-31'::DATE, '1 day'::INTERVAL) d;

CREATE INDEX idx_dim_date_year_month ON dim_date(year_month);
CREATE INDEX idx_dim_date_year ON dim_date(year);

