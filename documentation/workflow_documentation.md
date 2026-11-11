# SalesPulse – n8n Workflow Automation Architecture & Documentation

SalesPulse features three production-grade n8n automated workflows orchestrating background data synchronization, continuous KPI telemetry, and automated executive digest reporting.

---

## Workflow 1: Automated Sales Data Pipeline
- **File**: `n8n/sales_pipeline.json`
- **Execution Cadence**: Daily at 02:00 UTC (Cron: `0 2 * * *`)
- **Objective**: Execute end-to-end extraction, data cleaning, validation rule auditing, and PostgreSQL loading.

### Node Architecture
```
 [Schedule Trigger] (Daily 02:00 UTC)
         │
         ▼
 [HTTP Request: GET /health] ──> Check FastAPI & PostgreSQL availability
         │
         ▼
 [HTTP Request: POST /api/pipeline/run] ──> Trigger Data Ingestion & Transformation
         │
         ▼
 [HTTP Request: GET /api/data/quality] ──> Fetch 10-point Quality Validation Score
         │
         ▼
 [IF Condition: quality_score == 100.0]
         ├─── [TRUE] ──> [Slack: Send Pipeline Success Notification]
         └─── [FALSE] ──> [Slack: Send Critical Pipeline Failure Alert]
```

---

## Workflow 2: Sales Performance & Margin Telemetry Monitoring
- **File**: `n8n/sales_monitoring.json`
- **Execution Cadence**: Every 6 Hours
- **Objective**: Continuously audit margin deterioration below the corporate 10% floor.

### Node Architecture
```
 [Schedule Trigger] (Every 6 Hours)
         │
         ▼
 [HTTP Request: GET /api/overview] ──> Query Real-time KPIs
         │
         ▼
 [IF Condition: profit_margin_pct < 10.0%]
         ├─── [TRUE] ──> [Slack: Trigger Margin Compression Warning to Executive Channel]
         └─── [FALSE] ──> [Slack: Log Nominal Health Telemetry]
```

---

## Workflow 3: Automated Executive Weekly Digest
- **File**: `n8n/business_reporting.json`
- **Execution Cadence**: Weekly every Monday at 09:00 UTC (Cron: `0 9 * * 1`)
- **Objective**: Automatically extract business performance metrics and active strategic directives, formatting an HTML executive email briefing for leadership.

### Node Architecture
```
 [Schedule Trigger] (Weekly Monday 09:00 UTC)
         │
         ├───────────────────────────────┐
         ▼                               ▼
 [GET /api/overview]             [GET /api/insights]
         │                               │
         └───────────────┬───────────────┘
                         ▼
             [Code Node: Format HTML Briefing]
                         │
                         ▼
             [Email Send: Dispatch to Executive Leadership]
```

---

## Import Instructions in n8n UI
1. Open your n8n workspace at `http://localhost:5678`.
2. Click **Workflows** &rarr; **Add Workflow** &rarr; **Import from File...**
3. Select `sales_pipeline.json`, `sales_monitoring.json`, or `business_reporting.json`.
4. Configure your Slack / SMTP credentials or webhook URLs in the credentials vault.
5. Click **Activate Workflow**.
