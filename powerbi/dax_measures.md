# SalesPulse – Power BI DAX Measures & Data Model Specification

This document contains the complete production DAX measures library and Star-Schema relationship specifications for building the SalesPulse Power BI Dashboard.

---

## 1. Data Model Relationships (Star Schema)

| From Table (Fact / Source) | From Column (Foreign Key) | To Table (Dimension) | To Column (Primary Key) | Cardinality | Cross-filter Direction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fact_sales` | `product_id` | `dim_products` | `product_id` | Many to One (`*:1`) | Single |
| `fact_sales` | `customer_id` | `dim_customers` | `customer_id` | Many to One (`*:1`) | Single |
| `fact_sales` | `geography_id` | `dim_geography` | `geography_id` | Many to One (`*:1`) | Single |
| `fact_sales` | `order_date` | `DimDate` | `Date` | Many to One (`*:1`) | Single |

---

## 2. Enterprise DAX Measures Library

Organize measures inside a dedicated blank table named `_Measures`.

### 1. Revenue & Sales Measures

```dax
// Gross Revenue ($)
Total Sales = 
SUM(fact_sales[sales])

// Total Orders
Total Orders = 
DISTINCTCOUNT(fact_sales[order_id])

// Total Quantity Sold
Total Units Sold = 
SUM(fact_sales[quantity])

// Average Order Value (AOV)
Average Order Value = 
DIVIDE([Total Sales], [Total Orders], 0)

// Sales Prior Year (YoY Comparison)
Sales Prior Year = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR(DimDate[Date])
)

// YoY Revenue Growth %
YoY Revenue Growth % = 
VAR PreviousYear = [Sales Prior Year]
RETURN
DIVIDE([Total Sales] - PreviousYear, PreviousYear, 0)

// MoM Revenue Growth %
MoM Revenue Growth % = 
VAR CurrentMonthSales = [Total Sales]
VAR PreviousMonthSales = 
    CALCULATE(
        [Total Sales],
        DATEADD(DimDate[Date], -1, MONTH)
    )
RETURN
DIVIDE(CurrentMonthSales - PreviousMonthSales, PreviousMonthSales, 0)

// Cumulative YTD Sales
Sales YTD = 
TOTALYTD([Total Sales], DimDate[Date])
```

---

### 2. Profitability & Loss Measures

```dax
// Net Realized Profit ($)
Total Profit = 
SUM(fact_sales[profit])

// Operating Profit Margin %
Profit Margin % = 
DIVIDE([Total Profit], [Total Sales], 0)

// Profit Prior Year
Profit Prior Year = 
CALCULATE(
    [Total Profit],
    SAMEPERIODLASTYEAR(DimDate[Date])
)

// YoY Profit Growth %
YoY Profit Growth % = 
VAR PreviousProfit = [Profit Prior Year]
RETURN
DIVIDE([Total Profit] - PreviousProfit, ABS(PreviousProfit), 0)

// Cumulative Unprofitable Order Losses ($)
Total Loss Amount = 
CALCULATE(
    ABS(SUM(fact_sales[profit])),
    fact_sales[profit] < 0
)

// Count of Loss-Making Orders
Loss Orders Count = 
CALCULATE(
    DISTINCTCOUNT(fact_sales[order_id]),
    fact_sales[profit] < 0
)

// Loss Order Rate %
Loss Order Rate % = 
DIVIDE([Loss Orders Count], [Total Orders], 0)
```

---

### 3. Customer & Pareto Measures

```dax
// Total Active Customers
Total Customers = 
DISTINCTCOUNT(fact_sales[customer_id])

// Average Sales per Customer
Sales Per Customer = 
DIVIDE([Total Sales], [Total Customers], 0)

// Order Frequency
Order Frequency = 
DIVIDE([Total Orders], [Total Customers], 0)

// Cumulative Pareto Sales Rank
Customer Sales Rank = 
RANKX(
    ALL(dim_customers[customer_name]),
    [Total Sales],
    ,
    DESC,
    Dense
)
```

---

## 3. Dedicated DAX Calendar Table (DimDate)

```dax
DimDate = 
VAR MinDate = DATE(2014, 1, 1)
VAR MaxDate = DATE(2017, 12, 31)
RETURN
ADDCOLUMNS(
    CALENDAR(MinDate, MaxDate),
    "Year", YEAR([Date]),
    "Quarter", "Q" & FORMAT([Date], "Q"),
    "Year-Quarter", YEAR([Date]) & "-Q" & FORMAT([Date], "Q"),
    "Month Number", MONTH([Date]),
    "Month Name", FORMAT([Date], "MMM"),
    "Year-Month", FORMAT([Date], "YYYY-MM"),
    "Year-Month Sort", YEAR([Date]) * 100 + MONTH([Date]),
    "Day of Week", FORMAT([Date], "dddd"),
    "Day of Week Number", WEEKDAY([Date], 2)
)
```

