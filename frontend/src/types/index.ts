export interface FilterState {
  year: string;
  region: string;
  category: string;
  segment: string;
  startDate?: string;
  endDate?: string;
}

export interface OverviewData {
  kpis: {
    total_revenue: number;
    total_profit: number;
    total_orders: number;
    total_quantity_sold: number;
    average_order_value: number;
    profit_margin_pct: number;
    profitable_orders: number;
    loss_orders: number;
    loss_amount: number;
    revenue_growth_yoy?: number;
    profit_growth_yoy?: number;
  };
  monthly_trend: Array<{
    month: string;
    year: number;
    revenue: number;
    profit: number;
    orders: number;
    margin_pct: number;
  }>;
  category_distribution: Array<{
    category: string;
    revenue: number;
    profit: number;
    margin_pct: number;
    orders: number;
  }>;
  regional_distribution: Array<{
    region: string;
    revenue: number;
    profit: number;
    margin_pct: number;
    orders: number;
  }>;
  top_products: Array<{
    product_name: string;
    category: string;
    sub_category: string;
    revenue: number;
    profit: number;
    margin_pct: number;
  }>;
}

export interface SalesTrendsData {
  monthly_trends: Array<{
    Order_Year_Month?: string;
    Order_Year?: number;
    Order_Month?: number;
    revenue: number;
    profit: number;
    orders: number;
    quantity: number;
    aov: number;
    profit_margin_pct: number;
    revenue_mom_growth: number;
    rolling_3m_revenue: number;
  }>;
  quarterly_trends: Array<{
    quarter_label: string;
    revenue: number;
    profit: number;
    orders: number;
    profit_margin_pct: number;
  }>;
  yearly_summary: Array<{
    Order_Year?: number;
    revenue: number;
    profit: number;
    orders: number;
    quantity: number;
    aov: number;
    profit_margin_pct: number;
    revenue_yoy_growth: number;
    profit_yoy_growth: number;
  }>;
  dow_seasonality: Array<{
    Order_Day_of_Week?: string;
    revenue: number;
    orders: number;
    aov: number;
    revenue_share_pct: number;
  }>;
  month_seasonality: Array<{
    Order_Month_Name?: string;
    avg_revenue: number;
    total_revenue: number;
    total_profit: number;
    total_orders: number;
    profit_margin_pct: number;
  }>;
}

export interface ProductPerformanceData {
  category_summary: Array<any>;
  subcategory_summary: Array<any>;
  top_revenue_products: Array<any>;
  top_profit_products: Array<any>;
  loss_making_products: Array<any>;
  revenue_margin_traps: Array<any>;
  total_unique_products: number;
  total_loss_making_products_count: number;
}

export interface RegionalPerformanceData {
  region_summary: Array<any>;
  top_states_by_revenue: Array<any>;
  top_states_by_profit: Array<any>;
  loss_making_states: Array<any>;
  top_cities: Array<any>;
  loss_cities: Array<any>;
  all_states: Array<any>;
}

export interface ProfitabilityData {
  overall_summary: {
    total_revenue: number;
    total_profit: number;
    profit_margin_pct: number;
    total_loss_amount: number;
    loss_transactions: number;
    loss_rate_pct: number;
    corr_discount_profit: number;
    corr_discount_margin: number;
  };
  discount_tiers: Array<{
    discount_tier?: string;
    revenue: number;
    profit: number;
    profit_margin_pct: number;
    loss_rate_pct: number;
    line_items: number;
    loss_items: number;
    total_loss: number;
    avg_discount_pct: number;
  }>;
  discount_bins: Array<any>;
  top_loss_subcategories: Array<any>;
}

export interface CustomerAnalyticsData {
  segment_summary: Array<any>;
  top_revenue_customers: Array<any>;
  top_profit_customers: Array<any>;
  loss_customers: Array<any>;
  pareto_metrics: {
    total_customers: number;
    customers_for_80_pct_revenue: number;
    pct_customers_for_80_pct_revenue: number;
  };
  order_frequency_distribution: Array<any>;
}

export interface StrategicInsight {
  id: string;
  title: string;
  metric: string;
  implication: string;
  action: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

export interface PipelineStatusData {
  status: string;
  last_run_timestamp: string;
  records_ingested: number;
  records_cleaned: number;
  records_loaded: number;
  database_status: string;
  tables_active: string[];
  n8n_integration: {
    webhook_configured: boolean;
    active_workflows: number;
    target_url: string;
  };
}

