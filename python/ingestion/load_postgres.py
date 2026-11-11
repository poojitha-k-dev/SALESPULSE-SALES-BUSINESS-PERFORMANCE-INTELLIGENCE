"""
PostgreSQL Ingestion & ETL Loader for SalesPulse.
Initializes schema, loads staging, populates Star Schema dimensions/facts,
and compiles analytical aggregate tables.
"""

import os
import sys
from pathlib import Path
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import execute_batch, execute_values
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "salespulse_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"
SCHEMA_SQL = BASE_DIR / "database" / "schema.sql"


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


def load_postgres():
    print(f"[PostgreSQL Loader] Connecting to {DB_NAME} on {DB_HOST}:{DB_PORT} as {DB_USER}...")
    conn = get_db_connection()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Step 1: Execute Schema DDL
        print("[PostgreSQL Loader] Executing DDL schema from database/schema.sql...")
        with open(SCHEMA_SQL, "r", encoding="utf-8") as f:
            cur.execute(f.read())
        conn.commit()
        print("[PostgreSQL Loader] Schema created successfully.")

        # Step 2: Read Clean Dataset
        print(f"[PostgreSQL Loader] Reading dataset from {CLEAN_CSV}...")
        df = pd.read_csv(CLEAN_CSV)
        print(f"[PostgreSQL Loader] Loaded {len(df):,} records.")

        # Step 3: Populate Staging Table
        print("[PostgreSQL Loader] Loading staging_superstore...")
        staging_cols = [
            "Row ID", "Order ID", "Order Date", "Ship Date", "Ship Mode",
            "Customer ID", "Customer Name", "Segment", "Country", "City",
            "State", "Postal Code", "Region", "Product ID", "Category",
            "Sub-Category", "Product Name", "Sales", "Quantity", "Discount", "Profit"
        ]
        staging_data = [
            tuple(row[col] for col in staging_cols)
            for _, row in df.iterrows()
        ]
        staging_insert_sql = """
            INSERT INTO staging_superstore (
                row_id, order_id, order_date, ship_date, ship_mode,
                customer_id, customer_name, segment, country, city,
                state, postal_code, region, product_id, category,
                sub_category, product_name, sales, quantity, discount, profit
            ) VALUES %s
        """
        execute_values(cur, staging_insert_sql, staging_data, page_size=2000)
        conn.commit()
        print(f"[PostgreSQL Loader] Staging loaded with {len(staging_data):,} rows.")

        # Step 4: Populate dim_products
        # Deduplicate by product_id taking latest/most frequent name
        print("[PostgreSQL Loader] Populating dim_products...")
        products_df = df.groupby("Product ID").agg({
            "Product Name": "last",
            "Category": "last",
            "Sub-Category": "last"
        }).reset_index()

        product_data = [
            (row["Product ID"], row["Product Name"], row["Category"], row["Sub-Category"])
            for _, row in products_df.iterrows()
        ]
        prod_insert_sql = """
            INSERT INTO dim_products (product_id, product_name, category, sub_category)
            VALUES %s
            ON CONFLICT (product_id) DO NOTHING
        """
        execute_values(cur, prod_insert_sql, product_data)
        conn.commit()
        print(f"[PostgreSQL Loader] dim_products loaded with {len(product_data):,} unique products.")

        # Step 5: Populate dim_customers
        print("[PostgreSQL Loader] Populating dim_customers...")
        cust_df = df.groupby("Customer ID").agg({
            "Customer Name": "last",
            "Segment": "last"
        }).reset_index()

        cust_data = [
            (row["Customer ID"], row["Customer Name"], row["Segment"])
            for _, row in cust_df.iterrows()
        ]
        cust_insert_sql = """
            INSERT INTO dim_customers (customer_id, customer_name, segment)
            VALUES %s
            ON CONFLICT (customer_id) DO NOTHING
        """
        execute_values(cur, cust_insert_sql, cust_data)
        conn.commit()
        print(f"[PostgreSQL Loader] dim_customers loaded with {len(cust_data):,} unique customers.")

        # Step 6: Populate dim_geography
        print("[PostgreSQL Loader] Populating dim_geography...")
        geo_df = df[["Country", "Region", "State", "City", "Postal Code"]].drop_duplicates()
        geo_data = [
            (row["Country"], row["Region"], row["State"], row["City"], str(row["Postal Code"]))
            for _, row in geo_df.iterrows()
        ]
        geo_insert_sql = """
            INSERT INTO dim_geography (country, region, state, city, postal_code)
            VALUES %s
            ON CONFLICT (country, region, state, city, postal_code) DO NOTHING
        """
        execute_values(cur, geo_insert_sql, geo_data)
        conn.commit()

        # Retrieve geography lookup map: (Country, Region, State, City, Postal Code) -> geography_id
        cur.execute("SELECT geography_id, country, region, state, city, postal_code FROM dim_geography")
        geo_map = {
            (r[1], r[2], r[3], r[4], str(r[5])): r[0]
            for r in cur.fetchall()
        }
        print(f"[PostgreSQL Loader] dim_geography loaded with {len(geo_map):,} geographic nodes.")

        # Step 7: Populate fact_sales
        print("[PostgreSQL Loader] Populating fact_sales...")
        fact_rows = []
        for _, row in df.iterrows():
            geo_key = (row["Country"], row["Region"], row["State"], row["City"], str(row["Postal Code"]))
            geo_id = geo_map.get(geo_key)
            if geo_id is None:
                raise ValueError(f"Geography ID not found for key: {geo_key}")

            fact_rows.append((
                int(row["Row ID"]),
                str(row["Order ID"]),
                str(row["Order Date"]),
                str(row["Ship Date"]),
                str(row["Ship Mode"]),
                str(row["Customer ID"]),
                str(row["Product ID"]),
                geo_id,
                float(row["Sales"]),
                int(row["Quantity"]),
                float(row["Discount"]),
                float(row["Profit"]),
                float(row["Cost"]),
                float(row["Profit Margin Pct"]),
                bool(row["Is Profitable"]),
                str(row["Discount Tier"]),
                int(row["Shipping Days"]),
                int(row["Order Year"]),
                str(row["Order Quarter"]),
                int(row["Order Month"]),
                str(row["Order Year Month"]),
                str(row["Order Day of Week"])
            ))

        fact_insert_sql = """
            INSERT INTO fact_sales (
                row_id, order_id, order_date, ship_date, ship_mode,
                customer_id, product_id, geography_id,
                sales, quantity, discount, profit, cost, profit_margin_pct,
                is_profitable, discount_tier, shipping_days,
                order_year, order_quarter, order_month, order_year_month, order_day_of_week
            ) VALUES %s
        """
        execute_values(cur, fact_insert_sql, fact_rows, page_size=2000)
        conn.commit()
        print(f"[PostgreSQL Loader] fact_sales populated with {len(fact_rows):,} transactions.")

        # Step 8: Populate Aggregate Summary Tables
        print("[PostgreSQL Loader] Building agg_monthly_sales...")
        agg_monthly_sql = """
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
        """
        cur.execute(agg_monthly_sql)

        print("[PostgreSQL Loader] Building agg_category_performance...")
        agg_category_sql = """
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
        """
        cur.execute(agg_category_sql)

        print("[PostgreSQL Loader] Building agg_regional_performance...")
        agg_regional_sql = """
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
        """
        cur.execute(agg_regional_sql)
        conn.commit()

        # Step 9: Verification Queries
        cur.execute("SELECT COUNT(*) FROM fact_sales;")
        fact_count = cur.fetchone()[0]

        cur.execute("SELECT SUM(sales), SUM(profit) FROM fact_sales;")
        db_sales, db_profit = cur.fetchone()

        cur.execute("SELECT COUNT(*) FROM dim_products;")
        prod_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM dim_customers;")
        cust_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM agg_monthly_sales;")
        month_count = cur.fetchone()[0]

        print("\n================ DATA VERIFICATION ================")
        print(f"PostgreSQL fact_sales Rows: {fact_count:,} (Expected: 9,994)")
        print(f"PostgreSQL Total Sales:     ${float(db_sales):,.2f} (Clean CSV: ${df['Sales'].sum():,.2f})")
        print(f"PostgreSQL Total Profit:    ${float(db_profit):,.2f} (Clean CSV: ${df['Profit'].sum():,.2f})")
        print(f"dim_products count:         {prod_count:,} (Expected: 1,862)")
        print(f"dim_customers count:        {cust_count:,} (Expected: 793)")
        print(f"agg_monthly_sales periods:  {month_count} (48 Months: 2014-2017)")
        print("===================================================\n")

        assert fact_count == 9994, f"Mismatch in row count: {fact_count}"
        assert abs(float(db_sales) - df["Sales"].sum()) < 0.05, "Sales sum mismatch!"
        assert abs(float(db_profit) - df["Profit"].sum()) < 0.05, "Profit sum mismatch!"

        print("[PostgreSQL Loader] Ingestion & validation completed successfully with 100% parity.")

    except Exception as e:
        conn.rollback()
        print(f"[PostgreSQL Loader Error]: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    load_postgres()
