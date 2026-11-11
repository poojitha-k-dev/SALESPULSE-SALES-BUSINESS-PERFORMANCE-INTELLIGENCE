import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { fetchSalesTrends } from '../services/api';
import { SalesTrendsData } from '../types';

export const SalesAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<SalesTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesTrends()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { monthly_trends, quarterly_trends, yearly_summary, dow_seasonality, month_seasonality } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Sales Analytics & Temporal Velocity</h2>
        <p className="text-xs text-slate-400 mt-1">
          In-depth time-series analysis evaluating monthly trajectory, YoY annual acceleration, quarterly comparisons, and day-of-week demand patterns.
        </p>
      </div>

      {/* 4 Annual Performance Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {yearly_summary.map((yr: any) => (
          <div key={yr['Order Year']} className="bg-[#172033] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Year {yr['Order Year']}</span>
              <span className="flex items-center gap-1 font-semibold text-indigo-400">
                {yr.revenue_yoy_growth > 0 ? `+${yr.revenue_yoy_growth}% YoY` : 'Baseline'}
              </span>
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold text-white">${yr.revenue.toLocaleString()}</h3>
              <p className="text-xs text-emerald-400 mt-0.5">
                Profit: ${yr.profit.toLocaleString()} ({yr.profit_margin_pct.toFixed(1)}% margin)
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{yr.orders.toLocaleString()} orders</span>
              <span>AOV: ${yr.aov.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Trend: Revenue vs Rolling 3-Month Trajectory */}
      <ChartCard
        title="Monthly Revenue Trend with 3-Month Rolling Average"
        subtitle="Smoothing short-term volatility to reveal structural business acceleration"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="Order_Year_Month" stroke="#64748B" fontSize={11} tickLine={false} />
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
              <Legend verticalAlign="top" height={36} />
              <Line type="monotone" dataKey="revenue" name="Monthly Revenue ($)" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rolling_3m_revenue" name="3-Mo Rolling Avg ($)" stroke="#22D3EE" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="profit" name="Monthly Profit ($)" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Quarterly Performance & Month-over-Month Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quarterly Performance Bar */}
        <ChartCard
          title="Quarterly Performance Trajectory"
          subtitle="Revenue and profit breakdown per fiscal quarter"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterly_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="quarter_label" stroke="#64748B" fontSize={10} tickLine={false} />
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
                <Bar dataKey="revenue" name="Quarterly Revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Quarterly Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Seasonality: Day of Week Distribution */}
        <ChartCard
          title="Day of Week Sales Seasonality"
          subtitle="Identifying operational order peaks throughout the business week"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dow_seasonality} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="Order_Day_of_Week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Total Revenue" fill="#22D3EE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Seasonality Table */}
      <ChartCard
        title="Calendar Month Seasonality Benchmark (Annual Average Across 4 Years)"
        subtitle="Understanding annual corporate procurement cycles and holiday surge dynamics"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {month_seasonality.map((m: any) => (
            <div key={m['Order Month']} className="bg-[#0B1120] border border-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-slate-300">{m['Order Month Name']}</p>
              <p className="text-sm font-bold text-white mt-1">${(m.avg_revenue / 1000).toFixed(1)}k <span className="text-[10px] text-slate-400 font-normal">/yr</span></p>
              <p className="text-[11px] text-emerald-400 mt-0.5">{m.profit_margin_pct.toFixed(1)}% margin</p>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

