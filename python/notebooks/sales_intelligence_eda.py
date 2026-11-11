"""
Exploratory Data Analysis (EDA) and Business Intelligence Workbook.
This module executes visual and statistical exploratory analysis across sales,
profitability, product performance, geographical variance, and customer cohorts.
"""

from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"
PLOTS_DIR = BASE_DIR / "reports" / "plots"


def run_exploratory_data_analysis():
    PLOTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[EDA Workbook] Loading dataset from {CLEAN_CSV}...")
    df = pd.read_csv(CLEAN_CSV)
    df["Order Date"] = pd.to_datetime(df["Order Date"])

    print("\n--- 1. High Level Summary ---")
    print(f"Total Transactions: {len(df):,}")
    print(f"Total Revenue:      ${df['Sales'].sum():,.2f}")
    print(f"Total Profit:       ${df['Profit'].sum():,.2f}")
    print(f"Average Margin:     {(df['Profit'].sum() / df['Sales'].sum()) * 100:.2f}%")

    # Generate Chart 1: Monthly Sales & Profit Trend
    plt.figure(figsize=(12, 6))
    monthly = df.groupby("Order Year Month").agg(revenue=("Sales", "sum"), profit=("Profit", "sum")).reset_index()
    plt.plot(monthly["Order Year Month"], monthly["revenue"], marker="o", label="Revenue ($)", color="#6366F1", linewidth=2)
    plt.plot(monthly["Order Year Month"], monthly["profit"], marker="s", label="Profit ($)", color="#10B981", linewidth=2)
    plt.xticks(rotation=90, fontsize=8)
    plt.title("SalesPulse: Monthly Revenue & Profit Trajectory (2014-2017)", fontsize=14, fontweight="bold")
    plt.xlabel("Year-Month", fontsize=10)
    plt.ylabel("USD ($)", fontsize=10)
    plt.grid(True, linestyle="--", alpha=0.5)
    plt.legend()
    plt.tight_layout()
    chart1_path = PLOTS_DIR / "monthly_trends.png"
    plt.savefig(chart1_path, dpi=150)
    plt.close()
    print(f"Saved chart: {chart1_path}")

    # Generate Chart 2: Category Profit Margins
    plt.figure(figsize=(8, 5))
    cat = df.groupby("Category").agg(revenue=("Sales", "sum"), profit=("Profit", "sum")).reset_index()
    cat["margin"] = (cat["profit"] / cat["revenue"]) * 100
    bars = plt.bar(cat["Category"], cat["margin"], color=["#F59E0B", "#22D3EE", "#6366F1"])
    plt.title("Net Profit Margin % by Product Category", fontsize=13, fontweight="bold")
    plt.ylabel("Profit Margin (%)", fontsize=10)
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + 0.5, f"{yval:.1f}%", ha="center", va="bottom", fontweight="bold")
    plt.tight_layout()
    chart2_path = PLOTS_DIR / "category_margins.png"
    plt.savefig(chart2_path, dpi=150)
    plt.close()
    print(f"Saved chart: {chart2_path}")

    # Generate Chart 3: Discount vs Profit Margin Scatter / Bin
    plt.figure(figsize=(10, 5))
    tier = df.groupby("Discount Tier").agg(revenue=("Sales", "sum"), profit=("Profit", "sum")).reset_index()
    tier["margin"] = (tier["profit"] / tier["revenue"]) * 100
    tier_order = ["No Discount", "Low Discount (1-20%)", "Medium Discount (21-40%)", "High Discount (>40%)"]
    tier["sort"] = tier["Discount Tier"].map(lambda x: tier_order.index(x) if x in tier_order else 9)
    tier = tier.sort_values("sort")
    colors = ["#10B981", "#22D3EE", "#F59E0B", "#EF4444"]
    bars = plt.bar(tier["Discount Tier"], tier["margin"], color=colors)
    plt.axhline(0, color="gray", linestyle="--")
    plt.title("Discount Elasticity: Realized Profit Margin by Discount Tier", fontsize=13, fontweight="bold")
    plt.ylabel("Profit Margin (%)", fontsize=10)
    for bar in bars:
        yval = bar.get_height()
        va = "bottom" if yval >= 0 else "top"
        plt.text(bar.get_x() + bar.get_width()/2.0, yval + (0.5 if yval >= 0 else -1.5), f"{yval:.1f}%", ha="center", va=va, fontweight="bold")
    plt.tight_layout()
    chart3_path = PLOTS_DIR / "discount_margin_impact.png"
    plt.savefig(chart3_path, dpi=150)
    plt.close()
    print(f"Saved chart: {chart3_path}")

    print("\n[EDA Workbook] Exploratory data analysis execution completed.")


if __name__ == "__main__":
    run_exploratory_data_analysis()

