"""
Profitability Analytics Engine for SalesPulse.
Evaluates discount elasticity, margin deterioration, loss drivers,
and segment-level contribution margins.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def get_profitability_metrics(df: pd.DataFrame = None) -> dict:
    if df is None:
        df = pd.read_csv(CLEAN_CSV)

    total_sales = df["Sales"].sum()
    total_profit = df["Profit"].sum()
    overall_margin = (total_profit / total_sales) * 100

    # 1. Discount Tier Breakdown
    # Evaluating how discounting impacts profit margin and loss rate
    discount_tier_summary = df.groupby("Discount Tier").agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        line_items=("Row ID", "count"),
        loss_items=("Profit", lambda x: int((x < 0).sum())),
        total_loss=("Profit", lambda x: round(float(abs(x[x < 0].sum())), 2)),
        avg_discount=("Discount", "mean")
    ).reset_index()

    discount_tier_summary["revenue"] = discount_tier_summary["revenue"].round(2)
    discount_tier_summary["profit"] = discount_tier_summary["profit"].round(2)
    discount_tier_summary["profit_margin_pct"] = (
        (discount_tier_summary["profit"] / discount_tier_summary["revenue"]) * 100
    ).round(2)
    discount_tier_summary["loss_rate_pct"] = (
        (discount_tier_summary["loss_items"] / discount_tier_summary["line_items"]) * 100
    ).round(2)
    discount_tier_summary["avg_discount_pct"] = (discount_tier_summary["avg_discount"] * 100).round(2)

    # Sort in logical discount order
    tier_order = ["No Discount", "Low Discount (1-20%)", "Medium Discount (21-40%)", "High Discount (>40%)"]
    discount_tier_summary["tier_sort"] = discount_tier_summary["Discount Tier"].map(lambda x: tier_order.index(x) if x in tier_order else 99)
    discount_tier_summary = discount_tier_summary.sort_values("tier_sort").drop(columns=["tier_sort"])

    # 2. Granular Discount Bins (0.0 to 0.8 in 0.1 intervals)
    df["Discount Bin"] = pd.cut(
        df["Discount"],
        bins=[-0.01, 0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.81],
        labels=["0%", "1-10%", "11-20%", "21-30%", "31-40%", "41-50%", "51-60%", "61-70%", "71-80%"]
    )
    discount_bins = df.groupby("Discount Bin", observed=False).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        line_items=("Row ID", "count")
    ).reset_index()

    discount_bins["revenue"] = discount_bins["revenue"].round(2)
    discount_bins["profit"] = discount_bins["profit"].round(2)
    discount_bins["profit_margin_pct"] = np.where(
        discount_bins["revenue"] > 0,
        ((discount_bins["profit"] / discount_bins["revenue"]) * 100).round(2),
        0.0
    )

    # 3. Overall Loss Breakdown
    loss_subset = df[df["Profit"] < 0]
    total_loss_amount = abs(loss_subset["Profit"].sum())
    loss_transactions = len(loss_subset)
    loss_rate = (loss_transactions / len(df)) * 100

    # Top loss subcategories
    loss_by_subcat = loss_subset.groupby(["Category", "Sub-Category"]).agg(
        total_loss=("Profit", lambda x: round(abs(x.sum()), 2)),
        loss_count=("Row ID", "count"),
        avg_discount=("Discount", lambda x: round(x.mean() * 100, 2))
    ).reset_index().sort_values("total_loss", ascending=False).head(10).to_dict(orient="records")

    # 4. Correlation Analysis
    corr_discount_profit = float(df["Discount"].corr(df["Profit"]))
    corr_discount_margin = float(df["Discount"].corr(df["Profit Margin Pct"]))

    return {
        "overall_summary": {
            "total_revenue": round(float(total_sales), 2),
            "total_profit": round(float(total_profit), 2),
            "profit_margin_pct": round(float(overall_margin), 2),
            "total_loss_amount": round(float(total_loss_amount), 2),
            "loss_transactions": int(loss_transactions),
            "loss_rate_pct": round(float(loss_rate), 2),
            "corr_discount_profit": round(corr_discount_profit, 4),
            "corr_discount_margin": round(corr_discount_margin, 4)
        },
        "discount_tiers": discount_tier_summary.to_dict(orient="records"),
        "discount_bins": discount_bins.to_dict(orient="records"),
        "top_loss_subcategories": loss_by_subcat
    }


if __name__ == "__main__":
    res = get_profitability_metrics()
    print("Profitability Overview:", res["overall_summary"])
    print("\nDiscount Tiers:")
    for d in res["discount_tiers"]:
        print(f"  {d['Discount Tier']}: Rev=${d['revenue']:,}, Profit=${d['profit']:,}, Margin={d['profit_margin_pct']}%, Loss Rate={d['loss_rate_pct']}%")

