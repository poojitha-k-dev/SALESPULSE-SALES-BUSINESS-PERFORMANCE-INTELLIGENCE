"""
Portfolio Visual Assets Generator for SalesPulse.
Generates publication-quality charts for the GitHub README, LinkedIn showcase,
and portfolio presentations.
"""

from pathlib import Path
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CLEAN_CSV = BASE_DIR / "data" / "processed" / "clean_superstore.csv"
PLOTS_DIR = BASE_DIR / "reports" / "plots"


def generate_portfolio_visuals():
    PLOTS_DIR.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(CLEAN_CSV)
    df["Order Date"] = pd.to_datetime(df["Order Date"])

    # Chart 1: Pareto Cumulative Revenue Curve (80/20 Rule)
    plt.figure(figsize=(10, 5), facecolor='#0B1120')
    ax = plt.subplot(111, facecolor='#172033')
    
    cust = df.groupby('Customer ID')['Sales'].sum().sort_values(ascending=False).reset_index()
    cust['cum_sales'] = cust['Sales'].cumsum()
    cust['cum_pct'] = (cust['cum_sales'] / df['Sales'].sum()) * 100
    cust['cust_pct'] = (np.arange(1, len(cust) + 1) / len(cust)) * 100

    ax.plot(cust['cust_pct'], cust['cum_pct'], color='#6366F1', linewidth=2.5, label='Cumulative Revenue %')
    ax.plot([0, 100], [0, 100], color='#64748B', linestyle='--', linewidth=1.5, label='Equal Distribution Line')
    
    # 80% mark
    p80 = cust[cust['cum_pct'] >= 80.0].iloc[0]
    ax.axhline(80, color='#10B981', linestyle=':', linewidth=1.5)
    ax.axvline(p80['cust_pct'], color='#10B981', linestyle=':', linewidth=1.5)
    ax.plot(p80['cust_pct'], 80, marker='o', markersize=8, color='#10B981')
    ax.annotate(
        f"Pareto Point: {p80['cust_pct']:.1f}% Customers\nDrive 80% of Sales",
        xy=(p80['cust_pct'], 80),
        xytext=(p80['cust_pct'] + 8, 65),
        arrowprops=dict(facecolor='#10B981', shrink=0.08, width=1.5, headwidth=6),
        color='#FFFFFF',
        fontweight='bold',
        fontsize=10,
        bbox=dict(boxstyle='round,pad=0.5', facecolor='#0B1120', edgecolor='#10B981')
    )

    ax.set_title('SalesPulse: Pareto Distribution Analysis (80/20 Rule)', color='#FFFFFF', fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel('% of Total Customer Accounts', color='#94A3B8', fontsize=10)
    ax.set_ylabel('% of Cumulative Sales Revenue', color='#94A3B8', fontsize=10)
    ax.tick_params(colors='#94A3B8')
    ax.grid(True, linestyle='--', color='#1E293B', alpha=0.6)
    ax.legend(facecolor='#0B1120', edgecolor='#334155', labelcolor='#FFFFFF')
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'pareto_analysis.png', dpi=200, facecolor=plt.gcf().get_facecolor())
    plt.close()
    print("Generated: pareto_analysis.png")

    # Chart 2: Regional Performance & Profit Margins
    plt.figure(figsize=(9, 5), facecolor='#0B1120')
    ax = plt.subplot(111, facecolor='#172033')
    
    reg = df.groupby('Region').agg(revenue=('Sales', 'sum'), profit=('Profit', 'sum')).reset_index()
    reg['margin'] = (reg['profit'] / reg['revenue']) * 100
    reg = reg.sort_values('revenue', ascending=False)
    
    x = np.arange(len(reg))
    width = 0.35
    
    rects1 = ax.bar(x - width/2, reg['revenue'] / 1000, width, label='Revenue ($k)', color='#6366F1', edgecolor='#4338CA')
    rects2 = ax.bar(x + width/2, reg['profit'] / 1000, width, label='Profit ($k)', color='#10B981', edgecolor='#059669')
    
    ax.set_title('Regional Revenue vs Profit Benchmark ($k USD)', color='#FFFFFF', fontsize=13, fontweight='bold', pad=12)
    ax.set_xticks(x)
    ax.set_xticklabels(reg['Region'], color='#FFFFFF', fontweight='bold')
    ax.tick_params(colors='#94A3B8')
    ax.set_ylabel('Thousands ($k)', color='#94A3B8')
    ax.grid(True, linestyle='--', color='#1E293B', alpha=0.6, axis='y')
    ax.legend(facecolor='#0B1120', edgecolor='#334155', labelcolor='#FFFFFF')
    
    # Margin badges on top
    for i, row in reg.reset_index(drop=True).iterrows():
        ax.text(i, max(row['revenue']/1000, row['profit']/1000) + 25, f"{row['margin']:.1f}% Margin", 
                ha='center', color='#22D3EE', fontweight='bold', fontsize=9,
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#0B1120', edgecolor='#22D3EE', alpha=0.8))
        
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'regional_performance.png', dpi=200, facecolor=plt.gcf().get_facecolor())
    plt.close()
    print("Generated: regional_performance.png")

    # Chart 3: Customer Segments Contribution Donut
    plt.figure(figsize=(7, 5), facecolor='#0B1120')
    ax = plt.subplot(111, facecolor='#0B1120')
    
    seg = df.groupby('Segment')['Sales'].sum()
    colors = ['#6366F1', '#22D3EE', '#F59E0B']
    wedges, texts, autotexts = ax.pie(
        seg, 
        labels=seg.index, 
        autopct='%1.1f%%', 
        pctdistance=0.75, 
        colors=colors,
        textprops=dict(color='#FFFFFF', fontweight='semibold'),
        wedgeprops=dict(width=0.45, edgecolor='#0B1120', linewidth=2)
    )
    for at in autotexts:
        at.set_color('#FFFFFF')
        at.set_fontsize(10)
        at.set_weight('bold')
        
    ax.set_title('Customer Cohort Revenue Contribution', color='#FFFFFF', fontsize=13, fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / 'customer_segments.png', dpi=200, facecolor=plt.gcf().get_facecolor())
    plt.close()
    print("Generated: customer_segments.png")


if __name__ == '__main__':
    generate_portfolio_visuals()

