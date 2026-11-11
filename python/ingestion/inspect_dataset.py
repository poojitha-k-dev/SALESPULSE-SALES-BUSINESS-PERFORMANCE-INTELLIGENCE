"""
Dataset Inspection Module for SalesPulse.
Performs exploratory data inspection and generates structural profile.
"""

import json
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_FILE = BASE_DIR / "data" / "raw" / "superstore.csv"
DOCS_DIR = BASE_DIR / "documentation"


def inspect_dataset():
    print(f"Loading dataset from: {RAW_FILE}")
    # Sample superstore CSV is typically encoded in windows-1252 or utf-8
    try:
        df = pd.read_csv(RAW_FILE, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(RAW_FILE, encoding="windows-1252")

    print(f"\n--- Basic Dataset Dimensions ---")
    print(f"Total Rows: {len(df):,}")
    print(f"Total Columns: {len(df.columns)}")
    print(f"Columns: {list(df.columns)}")

    # Check for missing values
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100
    missing_summary = pd.DataFrame({"Missing_Count": missing, "Missing_Pct": missing_pct})
    print("\n--- Missing Values Summary ---")
    print(missing_summary[missing_summary["Missing_Count"] > 0] if (missing > 0).any() else "No missing values found.")

    # Duplicate check
    duplicate_rows = df.duplicated().sum()
    duplicate_order_lines = df.duplicated(subset=["Order ID", "Product ID"]).sum()
    print("\n--- Duplicate Analysis ---")
    print(f"Exact Duplicate Rows: {duplicate_rows}")
    print(f"Duplicate Order ID + Product ID lines: {duplicate_order_lines}")

    # Inspect Date Fields
    # Detect date format
    order_dates = pd.to_datetime(df["Order Date"], format="mixed")
    ship_dates = pd.to_datetime(df["Ship Date"], format="mixed")

    print("\n--- Date Ranges ---")
    print(f"Order Date Range: {order_dates.min().strftime('%Y-%m-%d')} to {order_dates.max().strftime('%Y-%m-%d')}")
    print(f"Ship Date Range: {ship_dates.min().strftime('%Y-%m-%d')} to {ship_dates.max().strftime('%Y-%m-%d')}")

    # Check for shipping date anomalies (Ship Date before Order Date)
    shipping_anomalies = (ship_dates < order_dates).sum()
    print(f"Shipping Date Anomalies (Ship Date < Order Date): {shipping_anomalies}")

    # Numerical Metrics Summary
    print("\n--- Numerical Summary (Sales, Quantity, Discount, Profit) ---")
    num_summary = df[["Sales", "Quantity", "Discount", "Profit"]].describe().T
    num_summary["sum"] = df[["Sales", "Quantity", "Discount", "Profit"]].sum()
    print(num_summary.to_string())

    # Categorical Dimensions
    print("\n--- Categorical Dimensions ---")
    print(f"Unique Categories ({df['Category'].nunique()}): {df['Category'].unique().tolist()}")
    print(f"Unique Sub-Categories ({df['Sub-Category'].nunique()}): {df['Sub-Category'].unique().tolist()}")
    print(f"Unique Segments ({df['Segment'].nunique()}): {df['Segment'].unique().tolist()}")
    print(f"Unique Regions ({df['Region'].nunique()}): {df['Region'].unique().tolist()}")
    print(f"Unique States: {df['State'].nunique()}")
    print(f"Unique Cities: {df['City'].nunique()}")
    print(f"Unique Customers: {df['Customer ID'].nunique()}")
    print(f"Unique Orders: {df['Order ID'].nunique()}")
    print(f"Unique Products: {df['Product ID'].nunique()}")

    # Profitability & Loss Investigation
    negative_profit = df[df["Profit"] < 0]
    zero_profit = df[df["Profit"] == 0]
    positive_profit = df[df["Profit"] > 0]

    print("\n--- Profit Distribution Analysis ---")
    print(f"Profitable Transactions: {len(positive_profit):,} ({len(positive_profit)/len(df)*100:.2f}%) | Total Profit: ${positive_profit['Profit'].sum():,.2f}")
    print(f"Break-even Transactions (Profit = 0): {len(zero_profit):,} ({len(zero_profit)/len(df)*100:.2f}%)")
    print(f"Loss-making Transactions (Profit < 0): {len(negative_profit):,} ({len(negative_profit)/len(df)*100:.2f}%) | Total Loss: ${negative_profit['Profit'].sum():,.2f}")
    print(f"Net Realized Profit: ${df['Profit'].sum():,.2f}")
    print(f"Gross Revenue: ${df['Sales'].sum():,.2f}")
    print(f"Overall Profit Margin: {(df['Profit'].sum() / df['Sales'].sum()) * 100:.2f}%")

    # Discount impact on profit
    print("\n--- Discount vs Profit Correlation ---")
    correlation = df["Discount"].corr(df["Profit"])
    print(f"Pearson Correlation (Discount vs Profit): {correlation:.4f}")

    # Build profiling dictionary for programmatic use
    profile = {
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "columns": list(df.columns),
        "data_types": {col: str(df[col].dtype) for col in df.columns},
        "missing_values": {col: int(missing[col]) for col in df.columns},
        "exact_duplicates": int(duplicate_rows),
        "date_ranges": {
            "order_date_min": order_dates.min().strftime('%Y-%m-%d'),
            "order_date_max": order_dates.max().strftime('%Y-%m-%d'),
            "ship_date_min": ship_dates.min().strftime('%Y-%m-%d'),
            "ship_date_max": ship_dates.max().strftime('%Y-%m-%d'),
        },
        "totals": {
            "gross_revenue": round(float(df["Sales"].sum()), 2),
            "net_profit": round(float(df["Profit"].sum()), 2),
            "total_quantity": int(df["Quantity"].sum()),
            "distinct_orders": int(df["Order ID"].nunique()),
            "distinct_customers": int(df["Customer ID"].nunique()),
            "distinct_products": int(df["Product ID"].nunique()),
            "loss_making_transactions": int(len(negative_profit)),
            "loss_amount": round(float(negative_profit["Profit"].sum()), 2),
            "profit_margin_pct": round(float((df["Profit"].sum() / df["Sales"].sum()) * 100), 2)
        }
    }

    profile_path = BASE_DIR / "data" / "processed" / "dataset_profile.json"
    profile_path.parent.mkdir(parents=True, exist_ok=True)
    with open(profile_path, "w", encoding="utf-8") as f:
        json.dump(profile, f, indent=2)

    print(f"\nSaved dataset profile metadata to {profile_path}")
    return df, profile


if __name__ == "__main__":
    inspect_dataset()

