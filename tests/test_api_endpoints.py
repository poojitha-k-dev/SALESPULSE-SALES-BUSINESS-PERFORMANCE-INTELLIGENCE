"""
Comprehensive Integration Tests for SalesPulse FastAPI Backend.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_overview_endpoint():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_revenue"] > 2_000_000
    assert data["kpis"]["total_orders"] > 4_000
    assert "monthly_trend" in data
    assert len(data["monthly_trend"]) == 48


def test_overview_filtering():
    response = client.get("/api/overview?year=2017&region=West")
    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_revenue"] > 0
    assert len(data["monthly_trend"]) <= 12


def test_sales_trends_endpoint():
    response = client.get("/api/sales/trends")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_trends" in data
    assert "quarterly_trends" in data
    assert "yearly_summary" in data
    assert len(data["yearly_summary"]) == 4


def test_products_endpoint():
    response = client.get("/api/products/performance?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["top_revenue_products"]) == 10
    assert len(data["loss_making_products"]) == 10
    assert len(data["category_summary"]) == 3


def test_regions_endpoint():
    response = client.get("/api/regions/performance")
    assert response.status_code == 200
    data = response.json()
    assert len(data["region_summary"]) == 4
    assert len(data["loss_making_states"]) > 0


def test_profitability_endpoint():
    response = client.get("/api/profitability")
    assert response.status_code == 200
    data = response.json()
    assert "discount_tiers" in data
    assert len(data["discount_tiers"]) == 4


def test_customers_endpoint():
    response = client.get("/api/customers/analytics")
    assert response.status_code == 200
    data = response.json()
    assert len(data["segment_summary"]) == 3
    assert "pareto_metrics" in data


def test_insights_endpoint():
    response = client.get("/api/insights")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7
    for item in data:
        assert "title" in item
        assert "metric" in item
        assert "action" in item
        assert item["priority"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]


def test_pipeline_status():
    response = client.get("/api/pipeline/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"
    assert data["records_loaded"] == 9994


def test_explorer_endpoints():
    res_tables = client.get("/api/data/explorer/tables")
    assert res_tables.status_code == 200
    assert len(res_tables.json()) >= 6

    res_prev = client.get("/api/data/explorer/preview?table=fact_sales&page=1&page_size=10")
    assert res_prev.status_code == 200
    data = res_prev.json()
    assert data["total_records"] == 9994
    assert len(data["rows"]) == 10
