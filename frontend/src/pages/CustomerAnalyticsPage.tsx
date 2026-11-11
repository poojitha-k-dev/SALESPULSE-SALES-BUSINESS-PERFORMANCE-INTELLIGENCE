import React, { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  Home,
  UserCheck,
  ShoppingBag,
  Award,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { fetchCustomerAnalytics } from '../services/api';
import { CustomerAnalyticsData } from '../types';

export const CustomerAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'revenue' | 'profit' | 'loss'>('revenue');

  useEffect(() => {
    fetchCustomerAnalytics()
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

  const { segment_summary, top_revenue_customers, top_profit_customers, loss_customers, pareto_metrics, order_frequency_distribution } = data;

  const currentList =
    viewMode === 'revenue'
      ? top_revenue_customers
      : viewMode === 'profit'
      ? top_profit_customers
      : loss_customers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Customer Analytics & Segment Contribution</h2>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating customer purchasing power across Consumer, Corporate, and Home Office segments, purchasing frequency, and Pareto concentration.
        </p>
      </div>

      {/* 3 Customer Segment Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segment_summary.map((seg: any) => {
          const Icon =
            seg.Segment === 'Consumer' ? Users : seg.Segment === 'Corporate' ? Briefcase : Home;
          return (
            <div key={seg.Segment} className="bg-[#172033] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{seg.Segment} Cohort</span>
                  <h3 className="text-2xl font-bold text-white mt-1">${seg.revenue.toLocaleString()}</h3>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">{seg.revenue_share_pct}% of total sales</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-[11px] text-slate-400">Profit</p>
                  <p className="font-semibold text-emerald-400 mt-0.5">${(seg.profit / 1000).toFixed(1)}k</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Margin</p>
                  <p className="font-semibold text-white mt-0.5">{seg.profit_margin_pct.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">AOV</p>
                  <p className="font-semibold text-white mt-0.5">${seg.aov.toFixed(0)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pareto Concentration Metric Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-indigo-800/20 to-cyan-900/40 border border-indigo-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Pareto Principle (80/20 Concentration Rule)</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Empirical calculation: <span className="font-bold text-cyan-400">{pareto_metrics.pct_customers_for_80_pct_revenue}% of customers</span> ({pareto_metrics.customers_for_80_pct_revenue} accounts) generate <span className="font-bold text-indigo-400">80% of total revenue</span>.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          Total Client Base: <span className="text-white font-bold">{pareto_metrics.total_customers} Customers</span>
        </div>
      </div>

      {/* Customer Rankings Table */}
      <div className="bg-[#172033] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'revenue'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Top Revenue Customers
            </button>
            <button
              onClick={() => setViewMode('profit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'profit'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Top Profit Contributors
            </button>
            <button
              onClick={() => setViewMode('loss')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'loss'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Loss-Generating Accounts
            </button>
          </div>
          <p className="text-xs text-slate-400">Showing top 10 accounts by lifetime transaction value</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Customer ID & Name</th>
                <th className="py-2.5 px-3">Segment</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">Units</th>
                <th className="py-2.5 px-3 text-right">Avg Disc %</th>
                <th className="py-2.5 px-3 text-right">Lifetime Sales</th>
                <th className="py-2.5 px-3 text-right">Lifetime Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {currentList.map((c: any, idx: number) => {
                const isLoss = c.profit < 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{c['Customer Name']}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c['Customer ID']}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {c['Segment']}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.orders}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.units}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{c.avg_discount_pct}%</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-white">${c.revenue.toLocaleString()}</td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isLoss ? `-$${Math.abs(c.profit).toLocaleString()}` : `$${c.profit.toLocaleString()}`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={c.profit_margin_pct >= 20 ? 'text-emerald-400' : c.profit_margin_pct >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                        {c.profit_margin_pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
