import {
  OverviewData,
  SalesTrendsData,
  ProductPerformanceData,
  RegionalPerformanceData,
  ProfitabilityData,
  CustomerAnalyticsData,
  StrategicInsight,
  PipelineStatusData,
  FilterState
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function fetchOverview(filters?: FilterState): Promise<OverviewData> {
  const params = new URLSearchParams();
  if (filters?.year && filters.year !== 'All') params.append('year', filters.year);
  if (filters?.region && filters.region !== 'All') params.append('region', filters.region);
  if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters?.segment && filters.segment !== 'All') params.append('segment', filters.segment);

  const res = await fetch(`${API_BASE_URL}/api/overview?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch Overview metrics');
  return res.json();
}

export async function fetchSalesTrends(filters?: FilterState): Promise<SalesTrendsData> {
  const params = new URLSearchParams();
  if (filters?.year && filters.year !== 'All') params.append('year', filters.year);
  if (filters?.region && filters.region !== 'All') params.append('region', filters.region);

  const res = await fetch(`${API_BASE_URL}/api/sales/trends?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch Sales Trends');
  return res.json();
}

export async function fetchProductPerformance(limit: number = 20): Promise<ProductPerformanceData> {
  const res = await fetch(`${API_BASE_URL}/api/products/performance?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch Product Performance');
  return res.json();
}

export async function fetchRegionalPerformance(): Promise<RegionalPerformanceData> {
  const res = await fetch(`${API_BASE_URL}/api/regions/performance`);
  if (!res.ok) throw new Error('Failed to fetch Regional Performance');
  return res.json();
}

export async function fetchProfitability(): Promise<ProfitabilityData> {
  const res = await fetch(`${API_BASE_URL}/api/profitability`);
  if (!res.ok) throw new Error('Failed to fetch Profitability metrics');
  return res.json();
}

export async function fetchCustomerAnalytics(): Promise<CustomerAnalyticsData> {
  const res = await fetch(`${API_BASE_URL}/api/customers/analytics`);
  if (!res.ok) throw new Error('Failed to fetch Customer Analytics');
  return res.json();
}

export async function fetchStrategicInsights(): Promise<StrategicInsight[]> {
  const res = await fetch(`${API_BASE_URL}/api/insights`);
  if (!res.ok) throw new Error('Failed to fetch Strategic Insights');
  return res.json();
}

export async function fetchPipelineStatus(): Promise<PipelineStatusData> {
  const res = await fetch(`${API_BASE_URL}/api/pipeline/status`);
  if (!res.ok) throw new Error('Failed to fetch Pipeline status');
  return res.json();
}

export async function triggerPipelineRun(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/pipeline/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger pipeline run');
  return res.json();
}

export async function fetchExplorerTables(): Promise<Array<{ table_name: string; record_count: number }>> {
  const res = await fetch(`${API_BASE_URL}/api/data/explorer/tables`);
  if (!res.ok) throw new Error('Failed to fetch database tables');
  return res.json();
}

export async function fetchTablePreview(table: string, page: number = 1, pageSize: number = 25): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/data/explorer/preview?table=${table}&page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error('Failed to preview table data');
  return res.json();
}

