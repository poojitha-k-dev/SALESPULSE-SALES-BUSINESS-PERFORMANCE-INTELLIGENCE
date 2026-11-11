"""
Sales Analytics Engine for SalesPulse.
Computes daily, weekly, monthly, quarterly trends, YoY & MoM growth,
seasonality, and average order value metrics.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def get_sales_trends(df: pd.DataFrame = None) -> dict:
    if df is None:
        df = pd.read_csv(CLEAN_CSV)
        df["Order Date"] = pd.to_datetime(df["Order Date"])

    # Monthly Aggregation
    monthly = df.groupby(["Order Year", "Order Month", "Order Year Month", "Order Month Name"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        quantity=("Quantity", "sum")
    ).reset_index().sort_values(["Order Year", "Order Month"])

    monthly["revenue"] = monthly["revenue"].round(2)
    monthly["profit"] = monthly["profit"].round(2)
    monthly["aov"] = (monthly["revenue"] / monthly["orders"]).round(2)
    monthly["profit_margin_pct"] = np.where(
        monthly["revenue"] > 0,
        ((monthly["profit"] / monthly["revenue"]) * 100).round(2),
        0.0
    )
    monthly["revenue_mom_growth"] = monthly["revenue"].pct_change().fillna(0).mul(100).round(2)
    monthly["profit_mom_growth"] = monthly["profit"].pct_change().fillna(0).mul(100).round(2)
    monthly["rolling_3m_revenue"] = monthly["revenue"].rolling(3, min_periods=1).mean().round(2)

    # Quarterly Aggregation
    quarterly = df.groupby(["Order Year", "Order Quarter"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        quantity=("Quantity", "sum")
    ).reset_index().sort_values(["Order Year", "Order Quarter"])

    quarterly["revenue"] = quarterly["revenue"].round(2)
    quarterly["profit"] = quarterly["profit"].round(2)
    quarterly["profit_margin_pct"] = ((quarterly["profit"] / quarterly["revenue"]) * 100).round(2)
    quarterly["quarter_label"] = quarterly["Order Year"].astype(str) + " " + quarterly["Order Quarter"]

    # Annual YoY Summary
    yearly = df.groupby("Order Year").agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        quantity=("Quantity", "sum")
    ).reset_index().sort_values("Order Year")

    yearly["revenue"] = yearly["revenue"].round(2)
    yearly["profit"] = yearly["profit"].round(2)
    yearly["aov"] = (yearly["revenue"] / yearly["orders"]).round(2)
    yearly["profit_margin_pct"] = ((yearly["profit"] / yearly["revenue"]) * 100).round(2)
    yearly["revenue_yoy_growth"] = yearly["revenue"].pct_change().fillna(0).mul(100).round(2)
    yearly["profit_yoy_growth"] = yearly["profit"].pct_change().fillna(0).mul(100).round(2)

    # Seasonality by Day of Week
    day_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    dow = df.groupby("Order Day of Week").agg(
        revenue=("Sales", "sum"),
        orders=("Order ID", "nunique"),
        quantity=("Quantity", "sum")
    ).reindex(day_order).reset_index()
    dow["revenue"] = dow["revenue"].round(2)
    dow["aov"] = (dow["revenue"] / dow["orders"]).round(2)
    total_sales = dow["revenue"].sum()
    dow["revenue_share_pct"] = ((dow["revenue"] / total_sales) * 100).round(2)

    # Seasonality by Month across all years (1 to 12)
    month_seasonality = df.groupby(["Order Month", "Order Month Name"]).agg(
        avg_revenue=("Sales", lambda x: round(x.sum() / df["Order Year"].nunique(), 2)),
        total_revenue=("Sales", "sum"),
        total_profit=("Profit", "sum"),
        total_orders=("Order ID", "nunique")
    ).reset_index().sort_values("Order Month")
    month_seasonality["profit_margin_pct"] = ((month_seasonality["total_profit"] / month_seasonality["total_revenue"]) * 100).round(2)

    return {
        "monthly_trends": monthly.to_dict(orient="records"),
        "quarterly_trends": quarterly.to_dict(orient="records"),
        "yearly_summary": yearly.to_dict(orient="records"),
        "dow_seasonality": dow.to_dict(orient="records"),
        "month_seasonality": month_seasonality.to_dict(orient="records")
    }


if __name__ == "__main__":
    res = get_sales_trends()
    print("Yearly Summary:")
    for y in res["yearly_summary"]:
        print(f"  Year {y['Order Year']}: Revenue=${y['revenue']:,} (+{y['revenue_yoy_growth']}%), Margin={y['profit_margin_pct']}%")

