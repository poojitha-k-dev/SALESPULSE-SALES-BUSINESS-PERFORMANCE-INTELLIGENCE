# SalesPulse – Analytical & Engineering Methodology

## 1. Guiding Principles
1. **Zero Fabrication**: All metrics, aggregations, charts, and recommendations derive directly from verified transactional data.
2. **Double Calculation Parity**: Analytical algorithms are coded in both PostgreSQL SQL and Python Pandas; automated parity tests guarantee identical totals.
3. **Preservation of Business Realities**: Negative profits (losses), steep discounts (>50%), and return-like variances are not discarded; they represent critical business anomalies to be diagnosed and addressed.
4. **Transparent Margin Math**: Profit margins are computed at transaction, aggregate, and time-series levels with explicit zero-division guards.

## 2. Ingestion & Data Hygiene Protocol
1. **Raw Ingestion**: Load the Superstore transactional data preserving original column names and identifiers into `data/raw/` and PostgreSQL `staging_superstore`.
2. **Type Coercion**: Convert date strings (`MM/DD/YYYY` or `DD-MM-YYYY`) into standard ISO dates (`YYYY-MM-DD`). Enforce float precision on monetary fields (`Sales`, `Profit`, `Discount`) and integers for `Quantity`.
3. **Integrity Validation**:
   - Check primary key uniqueness on `Row ID`.
   - Verify `Discount` lies strictly within $[0.0, 1.0]$.
   - Flag orders where `Ship Date < Order Date` as timeline anomalies.
   - Standardize category, subcategory, state, and region casing and whitespace.
4. **Relational Normalization**:
   - `dim_products`: Unique product catalog (`product_id`, `category`, `sub_category`, `product_name`).
   - `dim_customers`: Unique customer records (`customer_id`, `customer_name`, `segment`).
   - `dim_geography`: Unique geographic nodes (`country`, `region`, `state`, `city`, `postal_code`).
   - `fact_sales`: Transactional line items linking foreign keys to dimensions with metrics (`sales`, `quantity`, `discount`, `profit`, `order_date`, `ship_date`, `ship_mode`).

## 3. Analytical Framework
- **Time-Series Analysis**: Monthly, quarterly, and annual aggregations using SQL window functions (`LAG`, `SUM() OVER ()`) to compute MoM and YoY velocity.
- **Profitability Decomposition**: Category and subcategory level margin benchmarking, isolating high-volume / loss-making segments.
- **Pareto Principle (80/20 Rule)**: Identification of top customers and top product SKUs driving the primary revenue volume.
- **Discount Impact Analysis**: Binning discount rates ($0\%, 10-20\%, 20-40\%, >40\%$) against realized net profit margins to expose discounting leakage.

## 4. API & Application Interface
- **FastAPI**: Asynchronous Python API providing strongly-typed REST endpoints with Pydantic validation, CORS protection, and query parameters (`start_date`, `end_date`, `region`, `category`, `segment`).
- **Interactive Modern Frontend**: Built with React 18, TypeScript, Tailwind CSS, Lucide icons, and Recharts, adhering to commercial SaaS UX paradigms with dark navy backgrounds, responsive layouts, and interactive filtering.

