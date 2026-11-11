"""
Regional Analytics Engine for SalesPulse.
Calculates geographic distributions across Regions, States, and Cities,
benchmarking revenues, profits, and identifying underperforming territories.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def get_regional_performance(df: pd.DataFrame = None) -> dict:
    if df is None:
        df = pd.read_csv(CLEAN_CSV)

    # 1. Macro Region Performance
    total_sales = df["Sales"].sum()
    region_summary = df.groupby("Region").agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        customers=("Customer ID", "nunique"),
        quantity=("Quantity", "sum"),
        avg_discount=("Discount", "mean")
    ).reset_index()

    region_summary["revenue"] = region_summary["revenue"].round(2)
    region_summary["profit"] = region_summary["profit"].round(2)
    region_summary["profit_margin_pct"] = ((region_summary["profit"] / region_summary["revenue"]) * 100).round(2)
    region_summary["avg_discount_pct"] = (region_summary["avg_discount"] * 100).round(2)
    region_summary["revenue_share_pct"] = ((region_summary["revenue"] / total_sales) * 100).round(2)
    region_summary = region_summary.sort_values("revenue", ascending=False)

    # 2. State Performance
    state_summary = df.groupby(["Region", "State"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique"),
        customers=("Customer ID", "nunique"),
        avg_discount=("Discount", "mean")
    ).reset_index()

    state_summary["revenue"] = state_summary["revenue"].round(2)
    state_summary["profit"] = state_summary["profit"].round(2)
    state_summary["profit_margin_pct"] = np.where(
        state_summary["revenue"] > 0,
        ((state_summary["profit"] / state_summary["revenue"]) * 100).round(2),
        0.0
    )
    state_summary["avg_discount_pct"] = (state_summary["avg_discount"] * 100).round(2)

    top_states_by_revenue = state_summary.sort_values("revenue", ascending=False).head(10).to_dict(orient="records")
    top_states_by_profit = state_summary.sort_values("profit", ascending=False).head(10).to_dict(orient="records")
    loss_making_states = state_summary[state_summary["profit"] < 0].sort_values("profit", ascending=True).to_dict(orient="records")

    # 3. City Performance
    city_summary = df.groupby(["Region", "State", "City"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        orders=("Order ID", "nunique")
    ).reset_index()

    city_summary["revenue"] = city_summary["revenue"].round(2)
    city_summary["profit"] = city_summary["profit"].round(2)
    city_summary["profit_margin_pct"] = ((city_summary["profit"] / city_summary["revenue"]) * 100).round(2)

    top_cities = city_summary.sort_values("revenue", ascending=False).head(10).to_dict(orient="records")
    loss_cities = city_summary[city_summary["profit"] < 0].sort_values("profit", ascending=True).head(10).to_dict(orient="records")

    return {
        "region_summary": region_summary.to_dict(orient="records"),
        "top_states_by_revenue": top_states_by_revenue,
        "top_states_by_profit": top_states_by_profit,
        "loss_making_states": loss_making_states,
        "all_states": state_summary.sort_values("revenue", ascending=False).to_dict(orient="records"),
        "top_cities": top_cities,
        "loss_cities": loss_cities,
        "total_regions": int(df["Region"].nunique()),
        "total_states": int(df["State"].nunique()),
        "total_cities": int(df["City"].nunique())
    }


if __name__ == "__main__":
    res = get_regional_performance()
    print("Regional Summary:")
    for r in res["region_summary"]:
        print(f"  {r['Region']}: Rev=${r['revenue']:,} ({r['revenue_share_pct']}%), Profit=${r['profit']:,}, Margin={r['profit_margin_pct']}%")
    print(f"Loss making states count: {len(res['loss_making_states'])}")
    for s in res['loss_making_states'][:3]:
        print(f"  {s['State']} ({s['Region']}): Profit=${s['profit']:,}, Discount={s['avg_discount_pct']}%")

