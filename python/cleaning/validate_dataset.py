"""
Data Quality & Validation Suite for SalesPulse.
Runs structural, logical, and referential data quality rules on the cleaned dataset.
Generates a structured Data Quality Report (JSON + Markdown).
"""

import json
from pathlib import Path
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"
DOCS_DIR = BASE_DIR / "documentation"
REPORTS_DIR = BASE_DIR / "reports"


def validate_dataset():
    print(f"[Validation Suite] Loading cleaned data from {CLEAN_CSV}...")
    if not CLEAN_CSV.exists():
        raise FileNotFoundError(f"Cleaned dataset not found at {CLEAN_CSV}. Run clean_dataset.py first.")

    df = pd.read_csv(CLEAN_CSV)
    rules_passed = []
    rules_failed = []

    def check_rule(name, condition, details=""):
        if condition:
            rules_passed.append({"rule": name, "status": "PASSED", "details": details})
        else:
            rules_failed.append({"rule": name, "status": "FAILED", "details": details})

    # Rule 1: Row count expectation (Sample superstore has 9,994 rows)
    check_rule(
        "Expected Row Count",
        len(df) == 9994,
        f"Row count is {len(df):,} (Expected 9,994)"
    )

    # Rule 2: Primary Key Uniqueness on Row ID
    check_rule(
        "Primary Key Uniqueness (Row ID)",
        df["Row ID"].nunique() == len(df),
        f"Unique Row IDs: {df['Row ID'].nunique():,} / {len(df):,}"
    )

    # Rule 3: Zero Null Values across core fields
    null_counts = df.isnull().sum()
    total_nulls = null_counts.sum()
    check_rule(
        "Zero Missing Values",
        total_nulls == 0,
        f"Total nulls found: {total_nulls}"
    )

    # Rule 4: Sales Range & Positivity
    sales_positive = (df["Sales"] > 0).all()
    check_rule(
        "Positive Sales Values",
        sales_positive,
        f"Min sales: ${df['Sales'].min():.2f}, Max sales: ${df['Sales'].max():.2f}"
    )

    # Rule 5: Quantity Range
    quantity_valid = ((df["Quantity"] >= 1) & (df["Quantity"] <= 100)).all()
    check_rule(
        "Quantity Valid Range (1 to 100)",
        quantity_valid,
        f"Min quantity: {df['Quantity'].min()}, Max quantity: {df['Quantity'].max()}"
    )

    # Rule 6: Discount Range [0.0, 1.0]
    discount_valid = ((df["Discount"] >= 0.0) & (df["Discount"] <= 1.0)).all()
    check_rule(
        "Discount Valid Range (0.0 to 1.0)",
        discount_valid,
        f"Min discount: {df['Discount'].min():.2f}, Max discount: {df['Discount'].max():.2f}"
    )

    # Rule 7: Shipping Date after or equal to Order Date
    order_dt = pd.to_datetime(df["Order Date"])
    ship_dt = pd.to_datetime(df["Ship Date"])
    date_logic_valid = (ship_dt >= order_dt).all()
    check_rule(
        "Chronological Shipping Validity (Ship Date >= Order Date)",
        date_logic_valid,
        f"Max shipping days: {(ship_dt - order_dt).dt.days.max()} days, Min: {(ship_dt - order_dt).dt.days.min()} days"
    )

    # Rule 8: Categorical Consistency
    valid_categories = {"Furniture", "Office Supplies", "Technology"}
    category_valid = set(df["Category"].unique()).issubset(valid_categories)
    check_rule(
        "Standardized Product Categories",
        category_valid,
        f"Categories: {sorted(list(df['Category'].unique()))}"
    )

    # Rule 9: Valid Regions
    valid_regions = {"South", "West", "Central", "East"}
    region_valid = set(df["Region"].unique()).issubset(valid_regions)
    check_rule(
        "Standardized Sales Regions",
        region_valid,
        f"Regions: {sorted(list(df['Region'].unique()))}"
    )

    # Rule 10: Cost Consistency
    # Cost = Sales - Profit, so Cost + Profit == Sales
    cost_math_valid = np.allclose(df["Cost"] + df["Profit"], df["Sales"], atol=0.05)
    check_rule(
        "Financial Balance Equation (Cost + Profit == Sales)",
        cost_math_valid,
        f"Verified across {len(df):,} line items"
    )

    # Overall Summary
    total_checks = len(rules_passed) + len(rules_failed)
    pass_rate = (len(rules_passed) / total_checks) * 100

    report = {
        "dataset_name": "Sample Superstore Cleaned Dataset",
        "file_path": str(CLEAN_CSV),
        "total_records": len(df),
        "total_columns": len(df.columns),
        "checks_executed": total_checks,
        "checks_passed": len(rules_passed),
        "checks_failed": len(rules_failed),
        "quality_score_pct": pass_rate,
        "passed_rules": rules_passed,
        "failed_rules": rules_failed,
        "summary_statistics": {
            "total_sales": float(df["Sales"].sum()),
            "total_profit": float(df["Profit"].sum()),
            "overall_profit_margin_pct": float(round((df["Profit"].sum() / df["Sales"].sum()) * 100, 2)),
            "total_orders": int(df["Order ID"].nunique()),
            "total_customers": int(df["Customer ID"].nunique()),
            "loss_making_rows": int((df["Profit"] < 0).sum())
        }
    }

    # Save JSON report
    report_json_path = REPORTS_DIR / "data_quality_report.json"
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    # Save Markdown report
    report_md_path = DOCS_DIR / "testing_report.md"
    with open(report_md_path, "w", encoding="utf-8") as f:
        f.write("# SalesPulse – Data Quality & Validation Report\n\n")
        f.write(f"**Execution Status**: {'ALL CHECKS PASSED' if len(rules_failed) == 0 else 'WARNINGS / FAILURES'}\n")
        f.write(f"**Quality Score**: {pass_rate:.1f}%\n")
        f.write(f"**Total Records Evaluated**: {len(df):,}\n\n")
        f.write("## Validation Rules Execution Matrix\n\n")
        f.write("| Rule Name | Status | Verification Details |\n")
        f.write("| :--- | :--- | :--- |\n")
        for item in rules_passed:
            f.write(f"| **{item['rule']}** | `PASSED` | {item['details']} |\n")
        for item in rules_failed:
            f.write(f"| **{item['rule']}** | `FAILED` | {item['details']} |\n")
        f.write("\n## Financial Integrity Baseline\n\n")
        f.write(f"- **Gross Revenue**: ${report['summary_statistics']['total_sales']:,.2f}\n")
        f.write(f"- **Total Realized Profit**: ${report['summary_statistics']['total_profit']:,.2f}\n")
        f.write(f"- **Overall Profit Margin**: {report['summary_statistics']['overall_profit_margin_pct']:.2f}%\n")
        f.write(f"- **Distinct Orders**: {report['summary_statistics']['total_orders']:,}\n")
        f.write(f"- **Distinct Customers**: {report['summary_statistics']['total_customers']:,}\n")
        f.write(f"- **Loss-Making Transactions**: {report['summary_statistics']['loss_making_rows']:,}\n")

    print(f"\n[Validation Suite] Completed: {len(rules_passed)} passed, {len(rules_failed)} failed.")
    print(f"[Validation Suite] Quality Score: {pass_rate:.1f}%")
    print(f"[Validation Suite] Reports generated at {report_json_path} and {report_md_path}")

    return report


if __name__ == "__main__":
    validate_dataset()
