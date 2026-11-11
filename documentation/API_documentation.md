# SalesPulse – REST API Specification

The SalesPulse API is built with FastAPI, providing strongly typed endpoints, Pydantic schemas, and interactive OpenAPI Swagger UI at `/docs`.

**Base URL**: `http://127.0.0.1:8000`

---

## 1. System Health & Core

### `GET /health`
Returns system and database connectivity status.
```json
{
  "status": "healthy",
  "service": "SalesPulse Intelligence API",
  "version": "1.0.0",
  "database": "salespulse_db connected"
}
```

---

## 2. Analytical Endpoints

### `GET /api/overview`
Returns high-level business performance metrics with multi-dimensional filtering.

**Query Parameters:**
- `year` *(optional integer)*: e.g. `2017`
- `region` *(optional string)*: e.g. `West`, `East`, `Central`, `South`
- `category` *(optional string)*: `Technology`, `Furniture`, `Office Supplies`
- `segment` *(optional string)*: `Consumer`, `Corporate`, `Home Office`

**Sample Response Structure:**
```json
{
  "kpis": {
    "total_revenue": 2297200.65,
    "total_profit": 286396.54,
    "total_orders": 5009,
    "total_quantity_sold": 37873,
    "average_order_value": 458.61,
    "profit_margin_pct": 12.47,
    "profitable_orders": 4212,
    "loss_orders": 797,
    "loss_amount": 156131.29,
    "revenue_growth_yoy": 20.4,
    "profit_growth_yoy": 14.2
  },
  "monthly_trend": [ ... ],
  "category_distribution": [ ... ],
  "regional_distribution": [ ... ],
  "top_products": [ ... ]
}
```

---

### `GET /api/sales/trends`
Returns monthly, quarterly, annual YoY, day-of-week, and calendar month seasonality trends.

---

### `GET /api/products/performance`
Returns product category summaries, subcategory comparisons, top revenue products, top profit products, loss-making products, and high-revenue low-margin traps.

**Query Parameters:**
- `limit` *(integer, default: 15)*: Maximum number of ranked products to return.

---

### `GET /api/regions/performance`
Returns macro regional rankings, top states by revenue, loss-making states, and city-level performance.

---

### `GET /api/profitability`
Returns discount tier impact analysis, discount bin margins, and top loss subcategories.

---

### `GET /api/customers/analytics`
Returns customer segment breakdowns (Consumer, Corporate, Home Office), top lifetime revenue accounts, top profit contributors, loss-generating accounts, and Pareto 80/20 concentration metrics.

---

### `GET /api/insights`
Returns 7 evidence-based strategic business recommendations with empirical metrics, business implications, recommended actions, and priority rankings.

---

### `GET /api/pipeline/status`
Returns ETL execution health, table row counts, and n8n webhook status.

---

### `POST /api/pipeline/run`
Triggers an immediate end-to-end data pipeline run: data cleaning, 10-point quality validation, and PostgreSQL synchronization.

---

### `GET /api/data/quality`
Returns the automated 10-point data quality report and validation score (100.0%).

---

### `GET /api/data/explorer/tables`
Returns list of active relational tables and current record counts.

---

### `GET /api/data/explorer/preview`
Safely previews paginated data from any of the allowed analytical tables.

**Query Parameters:**
- `table` *(string, default: fact_sales)*
- `page` *(integer, default: 1)*
- `page_size` *(integer, default: 25)*

---

### `GET /api/data/explorer/export`
Streams a downloadable CSV export of the requested table.

