"""
Data Cleaning & Feature Engineering Pipeline for SalesPulse.
Loads raw Superstore data, validates schema, applies transformations,
engineers business features, and exports standardized analytical datasets.
"""

from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
RAW_FILE = BASE_DIR / "data" / "raw" / "superstore.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
CLEAN_CSV = PROCESSED_DIR / "clean_superstore.csv"


def clean_and_transform_dataset() -> pd.DataFrame:
    print(f"[Cleaning Pipeline] Reading raw dataset from {RAW_FILE}...")
    try:
        df = pd.read_csv(RAW_FILE, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(RAW_FILE, encoding="windows-1252")

    initial_count = len(df)
    print(f"[Cleaning Pipeline] Raw rows loaded: {initial_count:,}")

    # 1. Clean Column Headers
    df.columns = [c.strip() for c in df.columns]

    # 2. Date Formatting & Parsing
    # Order Date and Ship Date can have mixed formats (MM/DD/YYYY or DD-MM-YYYY)
    df["Order Date"] = pd.to_datetime(df["Order Date"], format="mixed", dayfirst=False)
    df["Ship Date"] = pd.to_datetime(df["Ship Date"], format="mixed", dayfirst=False)

    # 3. Clean and Standardize String Fields
    string_cols = [
        "Order ID", "Ship Mode", "Customer ID", "Customer Name",
        "Segment", "Country", "City", "State", "Region",
        "Product ID", "Category", "Sub-Category", "Product Name"
    ]
    for col in string_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()

    # Postal Code: ensure clean 5-digit string, zero-padded, handle any NaN
    df["Postal Code"] = df["Postal Code"].fillna(0).astype(int).astype(str).str.zfill(5)

    # 4. Clean Numeric Fields
    df["Row ID"] = df["Row ID"].astype(int)
    df["Sales"] = df["Sales"].astype(float).round(2)
    df["Quantity"] = df["Quantity"].astype(int)
    df["Discount"] = df["Discount"].astype(float).round(2)
    df["Profit"] = df["Profit"].astype(float).round(2)

    # 5. Sanity Validations
    # Check for invalid shipping duration
    df["Shipping Days"] = (df["Ship Date"] - df["Order Date"]).dt.days
    assert (df["Shipping Days"] >= 0).all(), "Detected Ship Date prior to Order Date!"

    # 6. Feature Engineering
    # Temporal features
    df["Order Year"] = df["Order Date"].dt.year
    df["Order Quarter"] = "Q" + df["Order Date"].dt.quarter.astype(str)
    df["Order Month"] = df["Order Date"].dt.month
    df["Order Month Name"] = df["Order Date"].dt.strftime("%b")
    df["Order Year Month"] = df["Order Date"].dt.strftime("%Y-%m")
    df["Order Day of Week"] = df["Order Date"].dt.strftime("%A")

    # Financial features
    # Estimated Cost of Goods Sold (COGS)
    df["Cost"] = (df["Sales"] - df["Profit"]).round(2)
    # Profit Margin %: safe division
    df["Profit Margin Pct"] = np.where(
        df["Sales"] != 0,
        ((df["Profit"] / df["Sales"]) * 100).round(2),
        0.0
    )
    # Profitability flag
    df["Is Profitable"] = df["Profit"] > 0

    # Discount Tiers for pricing elasticity analysis
    # No Discount: 0%
    # Low Discount: > 0% and <= 20%
    # Medium Discount: > 20% and <= 40%
    # High Discount: > 40%
    conditions = [
        (df["Discount"] == 0),
        (df["Discount"] > 0) & (df["Discount"] <= 0.20),
        (df["Discount"] > 0.20) & (df["Discount"] <= 0.40),
        (df["Discount"] > 0.40)
    ]
    choices = ["No Discount", "Low Discount (1-20%)", "Medium Discount (21-40%)", "High Discount (>40%)"]
    df["Discount Tier"] = np.select(conditions, choices, default="Unknown")

    # Order Value Tier
    order_val_conditions = [
        (df["Sales"] < 50),
        (df["Sales"] >= 50) & (df["Sales"] < 250),
        (df["Sales"] >= 250) & (df["Sales"] < 1000),
        (df["Sales"] >= 1000)
    ]
    order_val_choices = ["Small (<$50)", "Medium ($50-$249)", "Large ($250-$999)", "High Value ($1000+)"]
    df["Sales Tier"] = np.select(order_val_conditions, order_val_choices, default="Small (<$50)")

    # 7. Format Date columns back to ISO standard string for CSV output
    df["Order Date"] = df["Order Date"].dt.strftime("%Y-%m-%d")
    df["Ship Date"] = df["Ship Date"].dt.strftime("%Y-%m-%d")

    # 8. Save Processed Dataset
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(CLEAN_CSV, index=False, encoding="utf-8")
    print(f"[Cleaning Pipeline] Transformed dataset saved successfully to {CLEAN_CSV}")
    print(f"[Cleaning Pipeline] Processed Rows: {len(df):,}, Processed Columns: {len(df.columns)}")

    return df


if __name__ == "__main__":
    clean_and_transform_dataset()

