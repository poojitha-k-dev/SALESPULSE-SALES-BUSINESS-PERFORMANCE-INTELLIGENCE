import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Boxes,
  Percent,
  Sparkles,
  Download,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { KPICard } from '../components/KPICard';
import { ChartCard } from '../components/ChartCard';
import { GlobalFilterBar } from '../components/GlobalFilterBar';
import { fetchOverview } from '../services/api';
import { OverviewData, FilterState } from '../types';

const CATEGORY_COLORS = ['#6366F1', '#22D3EE', '#F59E0B'];
const REGION_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#22D3EE'];

export const ExecutiveOverviewPage: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    year: 'All',
    region: 'All',
    category: 'All',
    segment: 'All'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchOverview(filters);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load executive overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      year: 'All',
      region: 'All',
      category: 'All',
      segment: 'All'
    });
  };

  const handleDownloadReport = () => {
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SalesPulse_Executive_Report_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-400">Loading Executive Performance Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center text-rose-300">
        <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
        <h3 className="font-semibold text-white">Error Connecting to Analytics Backend</h3>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, monthly_trend, category_distribution, regional_distribution, top_products } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Performance Overview</h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete executive summary of business revenue, profit margins, orders, and commercial momentum.
          </p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary JSON</span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <GlobalFilterBar
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        isLoading={loading}
      />

      {/* 8 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Gross Revenue"
          value={`$${kpis.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={kpis.revenue_growth_yoy}
          changeLabel="YoY overall velocity"
          icon={DollarSign}
          accentColor="indigo"
        />
        <KPICard
          title="Total Net Profit"
          value={`$${kpis.total_profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={kpis.profit_growth_yoy}
          changeLabel="YoY profit velocity"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <KPICard
          title="Overall Profit Margin"
          value={`${kpis.profit_margin_pct.toFixed(2)}%`}
          subtext={`Net margin across ${kpis.total_orders.toLocaleString()} orders`}
          icon={Percent}
          accentColor="cyan"
        />
        <KPICard
          title="Average Order Value"
          value={`$${kpis.average_order_value.toFixed(2)}`}
          subtext={`Avg ticket across all categories`}
          icon={ShoppingCart}
          accentColor="indigo"
        />
        <KPICard
          title="Total Distinct Orders"
          value={kpis.total_orders.toLocaleString()}
          subtext={`${kpis.profitable_orders.toLocaleString()} profitable orders`}
          icon={ShoppingCart}
          accentColor="cyan"
        />
        <KPICard
          title="Total Units Sold"
          value={kpis.total_quantity_sold.toLocaleString()}
          subtext={`Cumulative catalog volume`}
          icon={Boxes}
          accentColor="emerald"
        />
        <KPICard
          title="Profitable Order Share"
          value={`${((kpis.profitable_orders / Math.max(kpis.total_orders, 1)) * 100).toFixed(1)}%`}
          subtext={`${kpis.profitable_orders} profitable vs ${kpis.loss_orders} loss orders`}
          icon={Sparkles}
          accentColor="emerald"
        />
        <KPICard
          title="Cumulative Losses"
          value={`-$${kpis.loss_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext={`Loss from ${kpis.loss_orders} unprofitable orders`}
          icon={AlertCircle}
          accentColor="rose"
        />
      </div>

      {/* Main Charts: Revenue & Profit Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trajectory Area Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Revenue & Profit Trajectory"
            subtitle="Historical timeline of gross sales versus realized net profit"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Right 1 Col: Category Sales Share Donut */}
        <div className="lg:col-span-1">
          <ChartCard
            title="Revenue by Category"
            subtitle="Merchandise revenue distribution"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={category_distribution}
                    dataKey="revenue"
                    nameKey="category"
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Secondary Charts: Regional Sales & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Bar Chart */}
        <ChartCard
          title="Regional Performance Breakdown"
          subtitle="Revenue and profit comparison across geographic sales territories"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regional_distribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="region" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top 5 Products Table */}
        <ChartCard
          title="Top 5 Products by Revenue"
          subtitle="Flagship commercial hardware and merchandise driving top-line"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {top_products.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 max-w-[200px] truncate font-medium text-white" title={p.product_name}>
                      {p.product_name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">${p.revenue.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">${p.profit.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-semibold ${p.margin_pct >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.margin_pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

