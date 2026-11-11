# SalesPulse – KPI Definitions and Calculation Standards

This document establishes the official mathematical formulations and business definitions for all Key Performance Indicators (KPIs) utilized across SalesPulse.

## 1. Revenue & Sales Metrics

### Total Revenue ($)
- **Definition**: The gross monetary sum received from sales transactions before operating expenses and taxes.
- **Formula**:
  $$\text{Total Revenue} = \sum \text{Sales}$$
- **Data Source**: `fact_sales.sales`

### Total Orders
- **Definition**: The count of unique sales orders placed by customers.
- **Formula**:
  $$\text{Total Orders} = \text{COUNT(DISTINCT } \text{order\_id)}$$
- **Data Source**: `fact_sales.order_id`

### Total Quantity Sold
- **Definition**: The cumulative number of individual product units sold across all transactions.
- **Formula**:
  $$\text{Total Quantity} = \sum \text{Quantity}$$
- **Data Source**: `fact_sales.quantity`

### Average Order Value (AOV)
- **Definition**: The average dollar amount generated per unique order.
- **Formula**:
  $$\text{AOV} = \frac{\text{Total Revenue}}{\text{Total Orders}} = \frac{\sum \text{Sales}}{\text{COUNT(DISTINCT } \text{order\_id)}}$$

### Revenue Growth (MoM / YoY)
- **Definition**: The percentage change in revenue compared to the prior period (Month-over-Month or Year-over-Year).
- **Formula**:
  $$\text{Revenue Growth \%} = \frac{\text{Revenue}_{t} - \text{Revenue}_{t-1}}{\text{Revenue}_{t-1}} \times 100$$

---

## 2. Profitability Metrics

### Total Profit ($)
- **Definition**: Total net earnings from sales after accounting for Cost of Goods Sold (COGS), discounts, and operating cost factors.
- **Formula**:
  $$\text{Total Profit} = \sum \text{Profit}$$
- **Data Source**: `fact_sales.profit` (Can be positive or negative for loss-making sales).

### Profit Margin (%)
- **Definition**: The percentage of revenue that turns into profit.
- **Formula**:
  $$\text{Profit Margin \%} = \left( \frac{\text{Total Profit}}{\text{Total Revenue}} \right) \times 100 = \left( \frac{\sum \text{Profit}}{\sum \text{Sales}} \right) \times 100$$

### Profit Growth (MoM / YoY)
- **Definition**: The percentage change in net profit compared to the previous period.
- **Formula**:
  $$\text{Profit Growth \%} = \frac{\text{Profit}_{t} - \text{Profit}_{t-1}}{|\text{Profit}_{t-1}|} \times 100$$

### Loss-Making Orders / Products
- **Definition**: Transactions or products where `Profit < 0`.
- **Metrics**:
  - Total Loss Amount: $\sum |\text{Profit}|$ where $\text{Profit} < 0$.
  - Loss Order Ratio: $\frac{\text{Orders with Profit } < 0}{\text{Total Orders}} \times 100$.

---

## 3. Pricing & Discount Impact Metrics

### Average Discount Rate (%)
- **Definition**: The average percentage discount applied to transactions.
- **Formula**:
  $$\text{Average Discount \%} = \left( \frac{\sum \text{Discount}}{\text{Total Line Items}} \right) \times 100$$

### Discount Elasticity & Profit Correlation
- **Definition**: Pearson correlation coefficient between discount percentage and profit margin:
  $$r = \frac{\sum (D - \bar{D})(M - \bar{M})}{\sqrt{\sum (D - \bar{D})^2 \sum (M - \bar{M})^2}}$$
  Where $D$ is discount rate and $M$ is profit margin.

---

## 4. Customer & Geographic Performance

### Customer Revenue Contribution
- **Definition**: Proportion of overall revenue attributed to an individual customer or customer segment.
- **Formula**:
  $$\text{Contribution \%} = \left( \frac{\text{Segment Revenue}}{\text{Total Revenue}} \right) \times 100$$

### Customer Order Frequency
- **Definition**: Average number of distinct orders generated per active customer.
- **Formula**:
  $$\text{Order Frequency} = \frac{\text{Total Orders}}{\text{COUNT(DISTINCT } \text{customer\_id)}}$$

### Regional Profit Margin
- **Definition**: Operating profit margin evaluated per geographic region or state:
  $$\text{Regional Margin \%} = \left( \frac{\sum_{\text{region}} \text{Profit}}{\sum_{\text{region}} \text{Sales}} \right) \times 100$$

