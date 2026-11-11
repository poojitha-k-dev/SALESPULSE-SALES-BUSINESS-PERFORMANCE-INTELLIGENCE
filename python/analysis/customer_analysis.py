"""
Customer Analytics Engine for SalesPulse.
Evaluates customer segments (Consumer, Corporate, Home Office),
Pareto 80/20 distributions, purchasing frequency, and top client contribution.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def get_customer_analytics(df: pd.DataFrame = None) -> dict:
    if df is None:
        df = pd.read_csv(CLEAN_CSV)

    total_sales = df["Sales"].sum()
    total_profit = df["Profit"].sum()

    # 1. Customer Segment Breakdown
    segment_summary = df.groupby("Segment").agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        customers=("Customer ID", "nunique"),
        orders=("Order ID", "nunique"),
        units=("Quantity", "sum")
    ).reset_index()

    segment_summary["revenue"] = segment_summary["revenue"].round(2)
    segment_summary["profit"] = segment_summary["profit"].round(2)
    segment_summary["profit_margin_pct"] = ((segment_summary["profit"] / segment_summary["revenue"]) * 100).round(2)
    segment_summary["revenue_share_pct"] = ((segment_summary["revenue"] / total_sales) * 100).round(2)
    segment_summary["profit_share_pct"] = ((segment_summary["profit"] / total_profit) * 100).round(2)
    segment_summary["aov"] = (segment_summary["revenue"] / segment_summary["orders"]).round(2)
    segment_summary["orders_per_customer"] = (segment_summary["orders"] / segment_summary["customers"]).round(2)

    # 2. Individual Customer Aggregations
    cust = df.groupby(["Customer ID", "Customer Name", "Segment"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        units=("Quantity", "sum"),
        avg_discount=("Discount", "mean"),
        first_order=("Order Date", "min"),
        last_order=("Order Date", "max")
    ).reset_index()

    cust["revenue"] = cust["revenue"].round(2)
    cust["profit"] = cust["profit"].round(2)
    cust["profit_margin_pct"] = np.where(
        cust["revenue"] > 0,
        ((cust["profit"] / cust["revenue"]) * 100).round(2),
        0.0
    )
    cust["avg_discount_pct"] = (cust["avg_discount"] * 100).round(2)
    cust["aov"] = (cust["revenue"] / cust["orders"]).round(2)

    top_revenue_customers = cust.sort_values("revenue", ascending=False).head(15).to_dict(orient="records")
    top_profit_customers = cust.sort_values("profit", ascending=False).head(15).to_dict(orient="records")
    loss_customers = cust[cust["profit"] < 0].sort_values("profit", ascending=True).head(10).to_dict(orient="records")

    # 3. Pareto Distribution (Cumulative Revenue Contribution)
    sorted_cust = cust.sort_values("revenue", ascending=False).copy()
    sorted_cust["cumulative_revenue"] = sorted_cust["revenue"].cumsum()
    sorted_cust["cumulative_revenue_pct"] = ((sorted_cust["cumulative_revenue"] / total_sales) * 100).round(2)
    sorted_cust["customer_rank"] = np.arange(1, len(sorted_cust) + 1)
    sorted_cust["customer_pct"] = ((sorted_cust["customer_rank"] / len(sorted_cust)) * 100).round(2)

    # Calculate what % of customers drive 80% of revenue
    p80_row = sorted_cust[sorted_cust["cumulative_revenue_pct"] >= 80.0].iloc[0]
    pareto_80_customer_pct = round(float(p80_row["customer_pct"]), 2)
    pareto_80_customer_count = int(p80_row["customer_rank"])

    # 4. Order Frequency Distribution
    freq_dist = cust["orders"].value_counts().sort_index().reset_index()
    freq_dist.columns = ["orders_count", "customer_count"]
    freq_dist["pct_of_customers"] = ((freq_dist["customer_count"] / len(cust)) * 100).round(2)

    return {
        "segment_summary": segment_summary.sort_values("revenue", ascending=False).to_dict(orient="records"),
        "top_revenue_customers": top_revenue_customers,
        "top_profit_customers": top_profit_customers,
        "loss_customers": loss_customers,
        "pareto_metrics": {
            "total_customers": len(cust),
            "customers_for_80_pct_revenue": pareto_80_customer_count,
            "pct_customers_for_80_pct_revenue": pareto_80_customer_pct
        },
        "order_frequency_distribution": freq_dist.to_dict(orient="records")
    }


if __name__ == "__main__":
    res = get_customer_analytics()
    print("Customer Segments:")
    for s in res["segment_summary"]:
        print(f"  {s['Segment']}: Revenue=${s['revenue']:,} ({s['revenue_share_pct']}%), Margin={s['profit_margin_pct']}%, Orders/Cust={s['orders_per_customer']}")
    print(f"Pareto Principle: {res['pareto_metrics']['pct_customers_for_80_pct_revenue']}% of customers drive 80% of revenue ({res['pareto_metrics']['customers_for_80_pct_revenue']} customers).")
