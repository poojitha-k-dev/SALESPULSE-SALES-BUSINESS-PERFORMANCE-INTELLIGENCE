"""
Comprehensive End-to-End System Test Suite for SalesPulse.
Verifies data ingestion, calculations parity (Python vs SQL),
API endpoints, filtering, pagination, and workflow integrity.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.connection import get_raw_connection

client = TestClient(app)
BASE_DIR = Path(__file__).resolve().parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def test_data_files_exist():
    assert CLEAN_CSV.exists(), "Cleaned dataset does not exist"
    df = pd.read_csv(CLEAN_CSV)
    assert len(df) == 9994, f"Unexpected row count: {len(df)}"


def test_calculation_parity_python_vs_sql():
    df = pd.read_csv(CLEAN_CSV)
    py_sales = float(df["Sales"].sum())
    py_profit = float(df["Profit"].sum())
    py_orders = int(df["Order ID"].nunique())

    conn = get_raw_connection()
    cur = conn.cursor()
    cur.execute("SELECT SUM(sales) AS total_sales, SUM(profit) AS total_profit, COUNT(DISTINCT order_id) AS total_orders FROM fact_sales;")
    row = cur.fetchone()
    sql_sales = row["total_sales"]
    sql_profit = row["total_profit"]
    sql_orders = row["total_orders"]
    conn.close()

    # Parity checks
    assert abs(float(sql_sales) - py_sales) < 0.05, f"Sales mismatch: SQL={sql_sales}, PY={py_sales}"
    assert abs(float(sql_profit) - py_profit) < 0.05, f"Profit mismatch: SQL={sql_profit}, PY={py_profit}"
    assert int(sql_orders) == py_orders, f"Orders mismatch: SQL={sql_orders}, PY={py_orders}"


def test_database_star_schema_relationships():
    conn = get_raw_connection()
    cur = conn.cursor()

    # Fact sales foreign key orphan check
    cur.execute("""
        SELECT COUNT(*) FROM fact_sales f
        LEFT JOIN dim_products p ON f.product_id = p.product_id
        WHERE p.product_id IS NULL;
    """)
    orphan_products = cur.fetchone()["count"]
    assert orphan_products == 0, f"Found {orphan_products} orphaned product keys!"

    cur.execute("""
        SELECT COUNT(*) FROM fact_sales f
        LEFT JOIN dim_customers c ON f.customer_id = c.customer_id
        WHERE c.customer_id IS NULL;
    """)
    orphan_customers = cur.fetchone()["count"]
    assert orphan_customers == 0, f"Found {orphan_customers} orphaned customer keys!"

    cur.execute("""
        SELECT COUNT(*) FROM fact_sales f
        LEFT JOIN dim_geography g ON f.geography_id = g.geography_id
        WHERE g.geography_id IS NULL;
    """)
    orphan_geo = cur.fetchone()["count"]
    assert orphan_geo == 0, f"Found {orphan_geo} orphaned geography keys!"

    conn.close()


def test_api_filtering_functionality():
    # Filter by 2017 Central
    res = client.get("/api/overview?year=2017&region=Central")
    assert res.status_code == 200
    data = res.json()
    assert data["kpis"]["total_revenue"] > 0
    # Monthly trends must only cover 2017
    for m in data["monthly_trend"]:
        assert m["year"] == 2017


def test_api_explorer_pagination():
    res = client.get("/api/data/explorer/preview?table=fact_sales&page=2&page_size=15")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 2
    assert data["page_size"] == 15
    assert len(data["rows"]) == 15
    assert data["total_records"] == 9994
