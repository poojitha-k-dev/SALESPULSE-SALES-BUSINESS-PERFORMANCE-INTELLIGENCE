"""
Pydantic Schemas for API Requests & Responses in SalesPulse.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class FilterParams(BaseModel):
    year: Optional[int] = None
    region: Optional[str] = None
    category: Optional[str] = None
    segment: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class OverviewKPIs(BaseModel):
    total_revenue: float
    total_profit: float
    total_orders: int
    total_quantity_sold: int
    average_order_value: float
    profit_margin_pct: float
    profitable_orders: int
    loss_orders: int
    loss_amount: float
    revenue_growth_yoy: Optional[float] = 0.0
    profit_growth_yoy: Optional[float] = 0.0


class OverviewResponse(BaseModel):
    kpis: OverviewKPIs
    monthly_trend: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    regional_distribution: List[Dict[str, Any]]
    top_products: List[Dict[str, Any]]


class SalesTrendResponse(BaseModel):
    monthly_trends: List[Dict[str, Any]]
    quarterly_trends: List[Dict[str, Any]]
    yearly_summary: List[Dict[str, Any]]
    dow_seasonality: List[Dict[str, Any]]
    month_seasonality: List[Dict[str, Any]]


class ProductPerformanceResponse(BaseModel):
    category_summary: List[Dict[str, Any]]
    subcategory_summary: List[Dict[str, Any]]
    top_revenue_products: List[Dict[str, Any]]
    top_profit_products: List[Dict[str, Any]]
    loss_making_products: List[Dict[str, Any]]
    revenue_margin_traps: List[Dict[str, Any]]
    total_unique_products: int
    total_loss_making_products_count: int


class RegionalPerformanceResponse(BaseModel):
    region_summary: List[Dict[str, Any]]
    top_states_by_revenue: List[Dict[str, Any]]
    top_states_by_profit: List[Dict[str, Any]]
    loss_making_states: List[Dict[str, Any]]
    top_cities: List[Dict[str, Any]]
    loss_cities: List[Dict[str, Any]]
    all_states: List[Dict[str, Any]]


class ProfitabilityResponse(BaseModel):
    overall_summary: Dict[str, Any]
    discount_tiers: List[Dict[str, Any]]
    discount_bins: List[Dict[str, Any]]
    top_loss_subcategories: List[Dict[str, Any]]


class CustomerAnalyticsResponse(BaseModel):
    segment_summary: List[Dict[str, Any]]
    top_revenue_customers: List[Dict[str, Any]]
    top_profit_customers: List[Dict[str, Any]]
    loss_customers: List[Dict[str, Any]]
    pareto_metrics: Dict[str, Any]
    order_frequency_distribution: List[Dict[str, Any]]


class StrategicInsight(BaseModel):
    id: str
    title: str
    metric: str
    implication: str
    action: str
    priority: str
    category: str


class PipelineStatusResponse(BaseModel):
    status: str
    last_run_timestamp: str
    records_ingested: int
    records_cleaned: int
    records_loaded: int
    database_status: str
    tables_active: List[str]
    n8n_integration: Dict[str, Any]


class DataQualityResponse(BaseModel):
    dataset_name: str
    total_records: int
    total_columns: int
    checks_executed: int
    checks_passed: int
    checks_failed: int
    quality_score_pct: float
    passed_rules: List[Dict[str, Any]]
    failed_rules: List[Dict[str, Any]]
    summary_statistics: Dict[str, Any]
