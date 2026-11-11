"""
Automated Verification Suite for n8n Workflow Integrations.
Validates workflow JSON syntax, node links, and endpoint response contracts.
"""

import json
from pathlib import Path
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)
BASE_DIR = Path(__file__).resolve().parent.parent
N8N_DIR = BASE_DIR / "n8n"


def test_workflow_json_validity():
    workflow_files = [
        "sales_pipeline.json",
        "sales_monitoring.json",
        "business_reporting.json"
    ]
    for wf in workflow_files:
        path = N8N_DIR / wf
        assert path.exists(), f"Workflow file {wf} does not exist"
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert "name" in data
            assert "nodes" in data
            assert len(data["nodes"]) >= 4
            assert "connections" in data


def test_workflow_1_endpoint_contract():
    # Health check
    res_health = client.get("/health")
    assert res_health.status_code == 200

    # Quality check
    res_qual = client.get("/api/data/quality")
    assert res_qual.status_code == 200
    data = res_qual.json()
    assert data["quality_score_pct"] == 100.0


def test_workflow_2_endpoint_contract():
    res_overview = client.get("/api/overview")
    assert res_overview.status_code == 200
    kpis = res_overview.json()["kpis"]
    assert "profit_margin_pct" in kpis
    assert "total_revenue" in kpis


def test_workflow_3_endpoint_contract():
    res_overview = client.get("/api/overview")
    res_insights = client.get("/api/insights")
    assert res_overview.status_code == 200
    assert res_insights.status_code == 200
    assert len(res_insights.json()) >= 7
