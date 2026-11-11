"""
Product Analytics Engine for SalesPulse.
Calculates SKU rankings, category/subcategory breakdowns, margin analysis,
and isolates unprofitable / loss-making products.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"


def get_product_performance(df: pd.DataFrame = None, limit: int = 10) -> dict:
    if df is None:
        df = pd.read_csv(CLEAN_CSV)

    # 1. Category Breakdown
    cat = df.groupby("Category").agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        quantity=("Quantity", "sum"),
        orders=("Order ID", "nunique"),
        avg_discount=("Discount", "mean"),
        loss_transactions=("Profit", lambda x: int((x < 0).sum())),
        total_loss=("Profit", lambda x: round(float(abs(x[x < 0].sum())), 2))
    ).reset_index()

    cat["revenue"] = cat["revenue"].round(2)
    cat["profit"] = cat["profit"].round(2)
    cat["profit_margin_pct"] = ((cat["profit"] / cat["revenue"]) * 100).round(2)
    cat["avg_discount_pct"] = (cat["avg_discount"] * 100).round(2)
    total_rev = cat["revenue"].sum()
    cat["revenue_share_pct"] = ((cat["revenue"] / total_rev) * 100).round(2)

    # 2. Sub-Category Breakdown
    subcat = df.groupby(["Category", "Sub-Category"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        quantity=("Quantity", "sum"),
        orders=("Order ID", "nunique"),
        avg_discount=("Discount", "mean"),
        loss_transactions=("Profit", lambda x: int((x < 0).sum())),
        total_loss=("Profit", lambda x: round(float(abs(x[x < 0].sum())), 2))
    ).reset_index().sort_values("revenue", ascending=False)

    subcat["revenue"] = subcat["revenue"].round(2)
    subcat["profit"] = subcat["profit"].round(2)
    subcat["profit_margin_pct"] = ((subcat["profit"] / subcat["revenue"]) * 100).round(2)
    subcat["avg_discount_pct"] = (subcat["avg_discount"] * 100).round(2)

    # 3. Product Level Aggregation
    prod = df.groupby(["Product ID", "Product Name", "Category", "Sub-Category"]).agg(
        revenue=("Sales", "sum"),
        profit=("Profit", "sum"),
        quantity=("Quantity", "sum"),
        orders=("Order ID", "nunique"),
        avg_discount=("Discount", "mean")
    ).reset_index()

    prod["revenue"] = prod["revenue"].round(2)
    prod["profit"] = prod["profit"].round(2)
    prod["profit_margin_pct"] = np.where(
        prod["revenue"] > 0,
        ((prod["profit"] / prod["revenue"]) * 100).round(2),
        0.0
    )
    prod["avg_discount_pct"] = (prod["avg_discount"] * 100).round(2)

    # Top by Revenue
    top_revenue_products = prod.sort_values("revenue", ascending=False).head(limit).to_dict(orient="records")

    # Top by Profit
    top_profit_products = prod.sort_values("profit", ascending=False).head(limit).to_dict(orient="records")

    # Worst Loss Making Products
    loss_making_products = prod[prod["profit"] < 0].sort_values("profit", ascending=True).head(limit).to_dict(orient="records")

    # High Revenue, Low Margin Trap (Top 15% revenue with margin < 5%)
    rev_p85 = prod["revenue"].quantile(0.85)
    margin_traps = prod[(prod["revenue"] >= rev_p85) & (prod["profit_margin_pct"] < 5.0)].sort_values("profit", ascending=True).to_dict(orient="records")

    return {
        "category_summary": cat.sort_values("revenue", ascending=False).to_dict(orient="records"),
        "subcategory_summary": subcat.to_dict(orient="records"),
        "top_revenue_products": top_revenue_products,
        "top_profit_products": top_profit_products,
        "loss_making_products": loss_making_products,
        "revenue_margin_traps": margin_traps,
        "total_unique_products": len(prod),
        "total_loss_making_products_count": int((prod["profit"] < 0).sum())
    }


if __name__ == "__main__":
    res = get_product_performance()
    print(f"Total Unique Products: {res['total_unique_products']}")
    print(f"Total Loss Making SKUs: {res['total_loss_making_products_count']}")
    print("Top Revenue Product:", res['top_revenue_products'][0]['Product Name'], f"${res['top_revenue_products'][0]['revenue']:,}")
    print("Worst Loss SKU:", res['loss_making_products'][0]['Product Name'], f"${res['loss_making_products'][0]['profit']:,}")
