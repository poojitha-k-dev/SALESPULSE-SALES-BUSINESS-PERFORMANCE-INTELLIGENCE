# SalesPulse – Architectural Specification

## System Overview
SalesPulse is an end-to-end Sales & Business Performance Intelligence platform designed to transform raw commercial transactions into actionable, executive-grade business insights.

```
+----------------------------------------------------------------------------------------+
|                                  SALESPULSE ARCHITECTURE                              |
+----------------------------------------------------------------------------------------+

 [1. Raw Data Source] ──> [Sample Superstore Sales Dataset (9,994 transaction records)]
                                     │
                                     ▼
 [2. Data Ingestion & ETL] ──> [Python Ingestion, Cleaning & Validation Engine]
                                - Null / Duplicate checks
                                - Type coercion (Dates, Sales, Profit, Discount)
                                - Business rule verification & Sanity tests
                                     │
                                     ▼
 [3. PostgreSQL Storage] ────> [PostgreSQL Database: salespulse_db]
                                - Raw Staging: staging_superstore
                                - Clean Core: fact_sales
                                - Dimensions: dim_products, dim_customers, dim_geography
                                - Summary Aggregates: agg_monthly_sales, agg_regional_performance
                                     │
                                     ▼
 [4. Analytical Layer] ──────> [SQL Queries & Python Business Analytics]
                                - Window functions, CTEs, YoY & MoM growth
                                - Profitability decomposition & Discount elasticity
                                - Customer contribution & Pareto rankings
                                     │
                                     ▼
 [5. API Gateway / REST] ────> [FastAPI Backend Service (:8000)]
                                - Structured JSON contracts & Pydantic schemas
                                - Multi-dimensional query filters (date, category, region)
                                - Comprehensive logging, health checks & OpenAPI docs
                                     │
        ┌────────────────────────────┴───────────────────────────┐
        ▼                                                        ▼
 [6. Modern Web UI (:5173)]                               [7. Power BI Model & DAX]
  - React 18 + TypeScript                                  - Star-Schema Data Model
  - Tailwind CSS + Vite                                    - Executive KPI Dashboards
  - Recharts & Lucide Icons                                - Automated DAX Measures
  - 9 Executive & Analytical Pages                         - Drill-through Matrix Reports
        │
        ▼
 [8. n8n Workflow Automation (:5678)]
  - Automated Sales Pipeline & Quality Ingestion
  - KPI Threshold Anomaly Monitoring & Alerting
  - Scheduled Executive Summary Generation
```

## Core Modules & Communication
1. **Data Pipeline**: Ingestion script loads raw files into staging, applies cleansing transformations, and generates star-schema dimension and fact tables.
2. **Database Engine**: PostgreSQL 16 relational database with indexes on `order_date`, `customer_id`, `product_id`, and `region`.
3. **Backend Service**: FastAPI with modular route handlers serving aggregated metrics, detailed analytical breakdowns, and pipeline operations.
4. **Interactive Dashboard**: Modern dark-navy themed React + TypeScript single-page application with responsive layouts, customizable filtering, and KPI drilldowns.
5. **Automation Layer**: n8n workflows orchestrating scheduled ETL jobs, anomaly checks, and Slack/email business alerts.

