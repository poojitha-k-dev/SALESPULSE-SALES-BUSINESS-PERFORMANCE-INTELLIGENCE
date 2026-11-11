# SalesPulse – Sales & Business Performance Intelligence

> **Transform Sales Data Into Smarter Business Decisions.**

[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![n8n](https://img.shields.io/badge/n8n-Automation-EA4B71?style=flat&logo=n8n&logoColor=white)](https://n8n.io/)
[![Power BI](https://img.shields.io/badge/Power_BI-Business_Intelligence-F2C811?style=flat&logo=powerbi&logoColor=black)](https://powerbi.microsoft.com/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-10B981?style=flat&logo=pytest&logoColor=white)](https://docs.pytest.org/)

---

## 1. Executive Summary & Business Problem

In high-volume retail and enterprise commerce, commercial success depends not merely on driving gross revenue, but on protecting operating profit margins, controlling discounting leakage, and identifying high-margin products.

**SalesPulse** is an enterprise-grade Sales & Business Performance Intelligence platform built on the authentic **Sample Superstore Sales Dataset** (9,994 transactions). It integrates data engineering, PostgreSQL relational modeling, REST API architecture, modern interactive frontend visualizations, and background automation to resolve critical executive questions:

- **Revenue Velocity**: Generating **\$2,297,200.65** across 5,009 distinct commercial orders with an Average Order Value (AOV) of **\$458.61**.
- **Realized Margin**: Realizing **\$286,396.54** in net profit at a blended **12.47%** operating margin.
- **The Discount Trap**: Identifying that **1,871 transactions (18.72%) generate negative profit**, causing **-\$156,131.29 in cumulative loss drag**, primarily driven by discounts exceeding 20%.
- **Concentration Risk**: Verifying that **48.7% of customers generate 80% of corporate revenue** (Pareto principle).

---

## 2. End-to-End System Architecture

```
+────────────────────────────────────────────────────────────────────────────────────────────+
|                                    SALESPULSE ARCHITECTURE                                 |
+────────────────────────────────────────────────────────────────────────────────────────────+

 [1. Data Source] ────────> [Sample Superstore Sales Dataset (9,994 Rows)]
                                      │
                                      ▼
 [2. Ingestion & ETL] ────> [Python Pandas & NumPy Engine]
                            - ISO Date standardization
                            - 10-point data quality validation suite (100% score)
                            - Feature engineering (Margin %, Discount tiers, Delivery days)
                                      │
                                      ▼
 [3. Relational Storage] ─> [PostgreSQL 16: salespulse_db]
                            - Staging: staging_superstore
                            - Core Dimensions: dim_products, dim_customers, dim_geography, dim_date
                            - Fact Table: fact_sales (9,994 transactional lines)
                            - Aggregates: agg_monthly_sales, agg_category, agg_regional
                                      │
                                      ▼
 [4. Analytical Layer] ───> [SQL Analytics & Window Functions]
                            - MoM & YoY growth calculations (LAG)
                            - Discount elasticity & profit correlation (r = -0.22)
                            - Category, state, and customer lifetime value rankings
                                      │
                                      ▼
 [5. API Gateway] ────────> [FastAPI High-Performance REST Service (:8000)]
                            - Strongly-typed Pydantic schemas & CORS middleware
                            - Dynamic multi-dimensional filtering (Year, Region, Category)
                            - OpenAPI Interactive Swagger UI at /docs
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

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite | Dark-navy executive SaaS dashboard across 9 responsive analytical pages. |
| **Backend** | Python 3.10, FastAPI, Uvicorn, Pydantic, SQLAlchemy, Psycopg2 | Asynchronous REST API serving aggregated analytical endpoints and ETL triggers. |
| **Database** | PostgreSQL 16.14 | Star-schema dimensional data warehouse with foreign keys and performance indexes. |
| **Data Analytics** | Pandas, NumPy, Matplotlib, SQL Window Functions | Ingestion, 10-point quality audit, and mathematical parity testing. |
| **Automation** | n8n | 3 production workflows for daily ETL, margin compression alerts, and weekly digests. |
| **Business Intelligence** | Power BI Desktop, DAX | 6-page enterprise BI report, dimensional modeling, and interactive slicers. |
| **Testing** | Pytest, HTTPX, TestClient | 20 automated integration and mathematical parity test cases. |

---

## 4. Website Pages & Interactive Dashboards

The SalesPulse web interface features 9 dedicated analytical pages styled in an enterprise dark navy theme (`#0B1120` background, `#172033` cards, `#6366F1` indigo, `#22D3EE` cyan, `#10B981` emerald, `#EF4444` rose):

1. **Executive Overview**: 8 core KPI cards, monthly revenue vs. profit trajectory, category share donuts, regional comparisons, and top 5 product tables.
2. **Sales Analytics**: 4-year annual comparisons, 3-month rolling revenue trends, quarterly velocity charts, and day-of-week demand seasonality.
3. **Product Analytics**: 1,862 SKU catalog breakdown, subcategory margin matrices, top revenue SKUs, loss-making hardware alerts, and high-volume margin traps.
4. **Regional Analytics**: Territorial benchmarking (West, East, Central, South), state-level revenue rankings, and forensic loss-making state alerts.
5. **Profitability Analysis**: Discount tier elasticity reports, granular 10% discount bins, and top 10 loss subcategories.
6. **Customer Analytics**: Consumer vs. Corporate vs. Home Office performance, top customer rankings, and Pareto 80/20 customer distribution metrics.
7. **Business Insights**: 7 verified, evidence-based strategic directives with supporting metrics, business implications, and prioritized management actions.
8. **Data Pipeline & Automation**: Pipeline health telemetry, database row counts, automated quality scores (100%), manual ETL trigger, and n8n topology.
9. **Data Explorer**: Safe PostgreSQL relational table browser, schema inspect, search, pagination, and direct CSV export.

---

## 5. Mathematical Parity Audit (Zero Fabrication Guarantee)

To guarantee that calculations are consistent across Python and PostgreSQL SQL, automated tests verify mathematical parity down to the exact cent:

| Metric | Python Pandas Result | PostgreSQL SQL Result | Variance | Parity Audit |
| :--- | :--- | :--- | :--- | :--- |
| **Gross Sales Revenue** | \$2,297,200.65 | \$2,297,200.65 | \$0.00 | **100% Exact Match** |
| **Net Realized Profit** | \$286,396.54 | \$286,396.54 | \$0.00 | **100% Exact Match** |
| **Total Order Count** | 5,009 | 5,009 | 0 | **100% Exact Match** |
| **Total Quantity Sold** | 37,873 | 37,873 | 0 | **100% Exact Match** |
| **Blended Profit Margin** | 12.47% | 12.47% | 0.00% | **100% Exact Match** |

---

## 6. Strategic Business Insights & Recommendations

1. **Category Disparity (INSIGHT-001)**: Technology generates \$836k at a healthy 17.4% margin, whereas Furniture operates at only 2.5% margin (\$18k profit on \$742k revenue) due to Tables (-$17.7k loss).
   - *Action*: Enforce margin floors on Tables and bundle furniture with high-margin technology peripherals.
2. **Deep Discounting Vulnerability (INSIGHT-003)**: Transactions with discounts exceeding 20% generate net losses of -\$156,131.29.
   - *Action*: Require Regional Director approval gates for discounts above 20% and ban discounts above 40%.
3. **Regional Inefficiencies (INSIGHT-004)**: Central region profit margin lags at 7.9% compared to West's 14.9%, dragged down by Texas (-\$25.7k loss) and Illinois (-\$12.6k loss).
   - *Action*: Audit commercial pricing contracts in Texas and Illinois to terminate loss-leading sales programs.

---

## 7. Installation & Quickstart Guide

### Prerequisites
- Python 3.10+
- PostgreSQL 16 (running on `localhost:5432`)
- Node.js 18+ and pnpm / npm

### Step 1: Clone and Environment Setup
```bash
git clone https://github.com/your-username/salespulse.git
cd Sales-Business-Performance-Intelligence

# Configure Environment Variables
cp .env.example .env
```

### Step 2: Python Environment & Dependencies
```bash
# Create Virtual Environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install Dependencies
pip install -r backend/requirements.txt
```

### Step 3: Run Ingestion, Cleaning & PostgreSQL Loading
```bash
# 1. Download verified Superstore dataset
python python/ingestion/download_dataset.py

# 2. Run data cleaning and feature engineering
python python/cleaning/clean_dataset.py

# 3. Execute 10-point data quality suite
python python/cleaning/validate_dataset.py

# 4. Load Star-Schema into PostgreSQL
python python/ingestion/load_postgres.py

# 5. Generate strategic insights and EDA plots
python python/insights/generate_insights.py
python python/notebooks/sales_intelligence_eda.py
```

### Step 4: Run Automated Tests
```bash
pytest -v
# Output: 20 passed in ~3.5 seconds
```

### Step 5: Start FastAPI Backend
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
# API Docs available at: http://127.0.0.1:8000/docs
```

### Step 6: Start React Frontend
```bash
cd frontend
pnpm install
pnpm run dev
# Dashboard available at: http://localhost:5173
```

---

## 8. Automated n8n Workflows

All workflow definitions are available in `n8n/` for one-click import:
1. `sales_pipeline.json`: Daily automated extraction, validation, and database re-sync with Slack notifications.
2. `sales_monitoring.json`: Continuous audit checking whether profit margin drops below the 10% threshold.
3. `business_reporting.json`: Weekly executive briefing generating an HTML digest dispatched to management.

---

## 9. Power BI Dashboard Integration

Complete DAX measure libraries and design documentation are provided in `powerbi/`:
- `powerbi/dax_measures.md`: Over 20 standardized DAX measures (`Total Sales`, `Profit Margin %`, `AOV`, `YoY Growth`, `Pareto Sales Rank`).
- `powerbi/dashboard_design.md`: Visual wireframes, canvas color schemes, and direct PostgreSQL connection instructions.
- `powerbi/create_date_table.sql`: Calendar dimension generator table in PostgreSQL.

---

## 10. Project Folder Structure

```
Sales-Business-Performance-Intelligence/
├── frontend/
│   ├── src/
│   │   ├── components/       # KPICard, ChartCard, GlobalFilterBar, StatusBadge
│   │   ├── pages/            # 9 React Dashboard Pages
│   │   ├── layouts/          # DashboardLayout with Dark Navy Sidebar
│   │   ├── services/         # API Service Client
│   │   ├── types/            # TypeScript Interfaces
│   │   ├── App.tsx           # Page Router
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── app/
│   │   ├── routes/           # 9 API Route Modules
│   │   ├── services/         # AnalyticsService, PipelineService
│   │   ├── schemas/          # Pydantic Response Schemas
│   │   ├── database/         # Connection Pool & Engine
│   │   └── main.py           # FastAPI Application Entrypoint
│   └── requirements.txt
│
├── python/
│   ├── ingestion/            # download_dataset.py, inspect_dataset.py, load_postgres.py
│   ├── cleaning/             # clean_dataset.py, validate_dataset.py
│   ├── analysis/             # sales, product, regional, profitability, customer analysis
│   ├── insights/             # generate_insights.py
│   └── notebooks/            # sales_intelligence_eda.py
│
├── data/
│   ├── raw/                  # superstore.csv (9,994 rows)
│   └── processed/            # clean_superstore.csv, dataset_profile.json
│
├── database/
│   ├── schema.sql            # PostgreSQL DDL with Indexes
│   ├── loading.sql           # Direct SQL Staging to Star Schema ETL
│   ├── sales_analysis.sql    # Window Functions & YoY Queries
│   ├── product_analysis.sql  # Category & SKU Rankings
│   ├── regional_analysis.sql # State & City Rankings
│   └── profitability_analysis.sql # Discount Impact & Loss Analysis
│
├── n8n/
│   ├── sales_pipeline.json
│   ├── sales_monitoring.json
│   └── business_reporting.json
│
├── powerbi/
│   ├── dax_measures.md       # Complete DAX Library
│   ├── dashboard_design.md   # Report Design & Layout Guide
│   └── create_date_table.sql # dim_date Generator Table
│
├── tests/
│   ├── test_api_endpoints.py # FastAPI Endpoint Tests
│   ├── test_n8n_workflows.py # n8n Workflow Verification
│   └── test_full_suite.py    # Math Parity & Star Schema Tests
│
├── documentation/
│   ├── architecture.md
│   ├── data_dictionary.md
│   ├── methodology.md
│   ├── KPI_definitions.md
│   ├── API_documentation.md
│   ├── workflow_documentation.md
│   └── testing_report.md
│
├── reports/
│   ├── business_insights.md
│   ├── business_insights.json
│   ├── data_quality_report.json
│   └── plots/                # Matplotlib EDA Visuals
│
├── .env.example
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## 11. Fresh Graduate Portfolio Showcase

This project is tailored to demonstrate comprehensive competencies across the modern data stack:
- **Data Analyst Skills**: Business metrics formulation, exploratory data analysis, Pareto distributions, price elasticity analysis, and evidence-based recommendation generation.
- **SQL & Data Engineering**: Relational Star-Schema modeling, dimensional normalization, window functions (`LAG`, `OVER`), Common Table Expressions (CTEs), and transaction ETL pipelines.
- **Python Engineering**: Robust data ingestion, feature engineering, and automated validation suites with 100% quality scores.
- **Full Stack Development**: FastAPI REST service design, Pydantic type safety, and modern React 18 + TypeScript + Tailwind CSS UI development.
- **Workflow Automation & BI**: Production n8n automated cron orchestrations and Power BI Star-Schema modeling with DAX measures.

---
**SalesPulse** – Built with precision for data-driven business decisions.

