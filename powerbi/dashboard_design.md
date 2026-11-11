# SalesPulse – Power BI Enterprise Dashboard Design Guide

This guide details the end-to-end visual architecture, color palette, visual component configuration, and data connection instructions for the 6-page SalesPulse Power BI report.

---

## 1. Database Connection Instructions (PostgreSQL to Power BI Desktop)

1. Open **Power BI Desktop**.
2. Click **Home** &rarr; **Get Data** &rarr; **More...** &rarr; Select **PostgreSQL database** &rarr; Click **Connect**.
3. In the connection dialog:
   - **Server**: `localhost:5432`
   - **Database**: `salespulse_db`
   - **Data Connectivity mode**: `Import` (Recommended for high-speed local DAX analysis)
4. Enter credentials:
   - **User name**: `postgres`
   - **Password**: `postgres` (or as configured in `.env`)
5. In Navigator, select the following tables:
   - `fact_sales`
   - `dim_products`
   - `dim_customers`
   - `dim_geography`
6. Click **Transform Data** (Power Query) or **Load**.
7. In the Model View, verify that the 1-to-many relationships link properly:
   - `fact_sales[product_id]` &rarr; `dim_products[product_id]`
   - `fact_sales[customer_id]` &rarr; `dim_customers[customer_id]`
   - `fact_sales[geography_id]` &rarr; `dim_geography[geography_id]`
8. Create the calculated `DimDate` table using the DAX script in `powerbi/dax_measures.md` and link `fact_sales[order_date]` &rarr; `DimDate[Date]`.

---

## 2. Branding & Theme Configuration
- **Background**: `#0B1120` (Dark Navy)
- **Visual Card Background**: `#172033`
- **Primary Accent**: `#6366F1` (Indigo)
- **Secondary Accent**: `#22D3EE` (Cyan)
- **Positive / Profit**: `#10B981` (Emerald)
- **Warning**: `#F59E0B` (Amber)
- **Danger / Losses**: `#EF4444` (Rose / Red)
- **Font**: Segoe UI / Inter (White `#FFFFFF` and Slate `#94A3B8`)

---

## 3. Page-by-Page Report Structure

### PAGE 1: EXECUTIVE OVERVIEW
- **Top Bar**: SalesPulse Logo + Slicers (Year, Region, Segment).
- **KPI Row (Cards)**:
  - Total Revenue (`[Total Sales]`), YoY Revenue Growth %, Total Profit (`[Total Profit]`), Profit Margin %, Total Orders, Average Order Value.
- **Visual 1 (Area Chart)**:
  - X-Axis: `DimDate[Year-Month]`
  - Values: `[Total Sales]` (Indigo) & `[Total Profit]` (Emerald).
- **Visual 2 (Donut Chart)**:
  - Legend: `dim_products[category]`
  - Values: `[Total Sales]`.
- **Visual 3 (Clustered Column Chart)**:
  - X-Axis: `dim_geography[region]`
  - Values: `[Total Sales]` and `[Total Profit]`.
- **Visual 4 (Table Visual)**:
  - Product Name, Category, Revenue, Profit, Margin %.

### PAGE 2: SALES PERFORMANCE
- **Slicers**: Year, Quarter, Month, Ship Mode.
- **Visual 1 (Line Chart with Rolling Avg)**:
  - Monthly Sales trajectory with YoY comparisons.
- **Visual 2 (Clustered Column Chart)**:
  - Quarterly Revenue & Profit velocity.
- **Visual 3 (Matrix Visual)**:
  - Rows: `DimDate[Year]` & `DimDate[Month Name]`
  - Values: `[Total Sales]`, `[MoM Revenue Growth %]`, `[Total Profit]`, `[Profit Margin %]`.
- **Visual 4 (Bar Chart)**:
  - Sales by `DimDate[Day of Week]`.

### PAGE 3: PRODUCT PERFORMANCE
- **Slicers**: Category, Sub-Category.
- **Visual 1 (Horizontal Bar Chart)**:
  - Top 10 SKUs by Revenue (`[Total Sales]`).
- **Visual 2 (Horizontal Bar Chart)**:
  - Top 10 SKUs by Profit (`[Total Profit]`).
- **Visual 3 (Horizontal Bar Chart - Red Alert)**:
  - Top 10 Loss-Making SKUs (`[Total Loss Amount]`).
- **Visual 4 (Matrix Table Visual)**:
  - Category, Sub-Category, Units Sold, Avg Discount, Revenue, Profit, Margin %.

### PAGE 4: REGIONAL ANALYSIS
- **Visual 1 (Filled Map / Shape Map)**:
  - Location: `dim_geography[state]`
  - Color saturation: `[Total Sales]`.
- **Visual 2 (Bar Chart)**:
  - States ranked by Profit Margin %.
- **Visual 3 (Matrix Visual)**:
  - Region & State breakdown: Revenue, Profit, Order Count, Customer Count.
- **Visual 4 (Table Visual)**:
  - Loss-making states with high discounting rate alerts.

### PAGE 5: PROFITABILITY ANALYSIS
- **Visual 1 (Clustered Column Chart)**:
  - X-Axis: `fact_sales[discount_tier]`
  - Values: `[Profit Margin %]` and `[Total Profit]`.
- **Visual 2 (Scatter Plot)**:
  - X-Axis: `fact_sales[discount]`
  - Y-Axis: `fact_sales[profit]`
  - Details: `fact_sales[order_id]`
  - Play Axis / Legend: Category.
- **Visual 3 (Waterfall Chart)**:
  - Revenue &rarr; COGS &rarr; Discount Impact &rarr; Realized Profit.

### PAGE 6: CUSTOMER ANALYTICS
- **Visual 1 (Donut Chart)**:
  - Customer Segment Revenue Contribution (Consumer, Corporate, Home Office).
- **Visual 2 (Bar Chart)**:
  - Top 15 Enterprise Customers by Lifetime Sales.
- **Visual 3 (Bar Chart)**:
  - Top Customers by Net Profit Contribution.
- **Visual 4 (Histogram / Column Chart)**:
  - Customer Order Frequency Distribution (1 order, 2-3 orders, 4-6 orders, 7+ orders).
