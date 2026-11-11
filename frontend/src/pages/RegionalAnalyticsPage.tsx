import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Compass,
  AlertOctagon,
  Building2,
  TrendingDown,
  TrendingUp
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
import { StatusBadge } from '../components/StatusBadge';
import { fetchRegionalPerformance } from '../services/api';
import { RegionalPerformanceData } from '../types';

export const RegionalAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<RegionalPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionalPerformance()
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

  const { region_summary, top_states_by_revenue, top_states_by_profit, loss_making_states, top_cities, loss_cities } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Regional & Geographical Performance</h2>
        <p className="text-xs text-slate-400 mt-1">
          Geographic revenue benchmarks, regional profit margin variances, and forensic analysis of underperforming sales territories.
        </p>
      </div>

      {/* 4 Macro Regional Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {region_summary.map((r: any) => (
          <div key={r.Region} className="bg-[#172033] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider">{r.Region} Region</span>
              <span className="text-[11px] text-indigo-400 font-semibold">{r.revenue_share_pct}% share</span>
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-bold text-white">${r.revenue.toLocaleString()}</h3>
              <p className="text-xs text-emerald-400 mt-0.5">
                Profit: ${r.profit.toLocaleString()} ({r.profit_margin_pct.toFixed(1)}% margin)
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{r.orders.toLocaleString()} orders</span>
              <span>Avg Disc: {r.avg_discount_pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Regional Revenue & Profit Bar Chart */}
      <ChartCard
        title="Territorial Revenue vs Profit Comparison"
        subtitle="Contrasting sales volume against retained operating earnings across West, East, Central, and South"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={region_summary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="Region" stroke="#64748B" fontSize={11} tickLine={false} />
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
              <Bar dataKey="revenue" name="Total Revenue ($)" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* State & City Performance Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 States by Revenue */}
        <ChartCard
          title="Top 10 States by Revenue"
          subtitle="Leading enterprise sales territories across the United States"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {top_states_by_revenue.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-white">{s.State}</td>
                    <td className="py-2 px-3 text-slate-400">{s.Region}</td>
                    <td className="py-2 px-3 text-right font-medium">${s.revenue.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-medium">${s.profit.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-200">{s.profit_margin_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Loss Making States Alert Table */}
        <ChartCard
          title="Loss-Making States (Critical Operational Review)"
          subtitle="States where discounting and freight result in negative operating profits"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">State</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-right">Avg Discount</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Loss ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loss_making_states.map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-white">{s.State}</td>
                    <td className="py-2 px-3 text-slate-400">{s.Region}</td>
                    <td className="py-2 px-3 text-right text-rose-400 font-mono font-semibold">{s.avg_discount_pct}%</td>
                    <td className="py-2 px-3 text-right">${s.revenue.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-400">
                      -${Math.abs(s.profit).toLocaleString()}
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

