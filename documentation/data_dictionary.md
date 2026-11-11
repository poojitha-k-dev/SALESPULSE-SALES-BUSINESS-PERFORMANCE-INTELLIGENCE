# SalesPulse – Comprehensive Data Dictionary

## Dataset: Sample Superstore Sales Dataset
- **Canonical Filename**: `superstore.csv`
- **Total Records**: 9,994 transaction rows
- **Total Fields**: 21
- **Temporal Coverage**: January 3, 2014 – December 30, 2017 (4 Full Calendar Years)
- **Currency**: USD ($)

---

## Field Specifications & Standards

| Column Name | Business Description | Raw Data Type | Target SQL Type | Missing Values | Value Constraints / Domain | Example Values |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Row ID** | Unique serial row identifier for transaction line item | Integer | `INTEGER PRIMARY KEY` | 0 (0%) | $\ge 1$, sequential | `1`, `2`, `9994` |
| **Order ID** | Unique commercial order code | String | `VARCHAR(25) NOT NULL` | 0 (0%) | `CA-YYYY-NNNNNN` or `US-YYYY-NNNNNN` | `CA-2016-152156`, `US-2015-108966` |
| **Order Date** | Date order was finalized by customer | Date/String | `DATE NOT NULL` | 0 (0%) | 2014-01-03 to 2017-12-30 | `2016-11-08`, `2017-12-30` |
| **Ship Date** | Date package left fulfillment center | Date/String | `DATE NOT NULL` | 0 (0%) | $\ge \text{Order Date}$, 2014-01-07 to 2018-01-05 | `2016-11-11`, `2018-01-05` |
| **Ship Mode** | Logistics carrier service level | String | `VARCHAR(25) NOT NULL` | 0 (0%) | `Standard Class`, `Second Class`, `First Class`, `Same Day` | `Standard Class`, `Second Class` |
| **Customer ID** | Unique identifier for purchasing entity | String | `VARCHAR(20) NOT NULL` | 0 (0%) | Format: `AA-NNNNN` (793 distinct) | `CG-12520`, `DV-13045` |
| **Customer Name** | Individual or account representative name | String | `VARCHAR(100) NOT NULL` | 0 (0%) | Text string | `Claire Gute`, `Sean O'Donnell` |
| **Segment** | High-level commercial customer cohort | String | `VARCHAR(25) NOT NULL` | 0 (0%) | `Consumer` (51.9%), `Corporate` (30.2%), `Home Office` (17.8%) | `Consumer`, `Corporate`, `Home Office` |
| **Country** | Nation of billing and fulfillment | String | `VARCHAR(50) NOT NULL` | 0 (0%) | `United States` (100%) | `United States` |
| **City** | Municipality of shipping destination | String | `VARCHAR(100) NOT NULL` | 0 (0%) | 531 unique US cities | `New York City`, `Los Angeles`, `Seattle` |
| **State** | US State or administrative district | String | `VARCHAR(50) NOT NULL` | 0 (0%) | 49 distinct US states (incl. DC) | `California`, `New York`, `Texas` |
| **Postal Code** | US ZIP postal code | Float/Int | `VARCHAR(20)` | 0 (0%) | 5-digit US ZIPs (coerced string with zero-pad) | `90036`, `33311`, `10024` |
| **Region** | Macro geographic sales territory | String | `VARCHAR(20) NOT NULL` | 0 (0%) | `West`, `East`, `Central`, `South` | `West`, `East`, `Central`, `South` |
| **Product ID** | Unique stock-keeping unit (SKU) identifier | String | `VARCHAR(30) NOT NULL` | 0 (0%) | Format: `CAT-SU-NNNNNNNN` (1,862 distinct) | `FUR-BO-10001798`, `TEC-PH-10002275` |
| **Category** | Macro product merchandise category | String | `VARCHAR(50) NOT NULL` | 0 (0%) | `Furniture`, `Office Supplies`, `Technology` | `Technology`, `Furniture` |
| **Sub-Category** | Micro product classification | String | `VARCHAR(50) NOT NULL` | 0 (0%) | 17 classifications (Phones, Chairs, Binders, Tables...) | `Chairs`, `Tables`, `Storage` |
| **Product Name** | Full descriptive product catalog title | String | `VARCHAR(255) NOT NULL` | 0 (0%) | Descriptive text | `Bush Somerset Collection Bookcase` |
| **Sales** | Gross transactional revenue ($ USD) | Float | `NUMERIC(12,2) NOT NULL` | 0 (0%) | $\text{Sales} > 0$, Range: \$0.44 to \$22,638.48 | `261.96`, `731.94`, `14.62` |
| **Quantity** | Number of units purchased in transaction | Integer | `INTEGER NOT NULL` | 0 (0%) | $1 \le \text{Quantity} \le 14$ | `2`, `3`, `5` |
| **Discount** | Ratio discount applied to transaction | Float | `NUMERIC(5,2) NOT NULL` | 0 (0%) | $0.00 \le \text{Discount} \le 0.80$ ($0\% - 80\%$) | `0.00`, `0.20`, `0.70` |
| **Profit** | Realized net earnings / loss ($ USD) | Float | `NUMERIC(12,2) NOT NULL` | 0 (0%) | $-\$6,599.98 \le \text{Profit} \le +\$8,399.98$ | `41.91`, `-383.03`, `219.58` |

---

## Dimensional Integrity & Business Interpretation

### 1. Revenue vs. Profit Relationship
- Transaction price is `Sales`. Cost of Goods Sold is implicitly $\text{COGS} = \text{Sales} - \text{Profit}$.
- When `Discount` exceeds $20\%-40\%$, transactions frequently generate negative profit (`Profit < 0`).
- Out of 9,994 rows, **1,871 transactions (18.72%) are loss-making**, generating a cumulative loss of **-\$156,131.29**.

### 2. Multi-Line Item Orders
- `Order ID` is not unique per row; each row is a line item.
- 5,009 unique orders generate 9,994 line items (average ~2.0 items per order).

### 3. Star Schema Entity Separation
- `dim_products`: Keyed by `product_id`, storing `product_name`, `category`, `sub_category`.
- `dim_customers`: Keyed by `customer_id`, storing `customer_name`, `segment`.
- `dim_geography`: Normalized geographic entity keyed by `geography_id` (`city`, `state`, `postal_code`, `region`, `country`).
- `fact_sales`: Transactional fact table keyed by `row_id` referencing dimension foreign keys.

