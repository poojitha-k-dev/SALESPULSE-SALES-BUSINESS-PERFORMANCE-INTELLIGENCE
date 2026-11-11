import React, { useEffect, useState } from 'react';
import {
  Percent,
  TrendingDown,
  AlertTriangle,
  Scale,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { StatusBadge } from '../components/StatusBadge';
import { fetchProfitability } from '../services/api';
import { ProfitabilityData } from '../types';

export const ProfitabilityPage: React.FC = () => {
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitability()
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

  const { overall_summary, discount_tiers, discount_bins, top_loss_subcategories } = data;

  const TIER_COLORS = ['#10B981', '#22D3EE', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Profitability & Pricing Elasticity Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">
          Forensic margin diagnostics: evaluating how price discounting erodes bottom-line profits and identifying structural balance sheet leaks.
        </p>
      </div>

      {/* 4 Financial Integrity Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Net Realized Profit</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">${overall_summary.total_profit.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-1">Across ${overall_summary.total_revenue.toLocaleString()} revenue</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Overall Profit Margin</p>
          <h3 className="text-xl font-bold text-cyan-400 mt-1">{overall_summary.profit_margin_pct.toFixed(2)}%</h3>
          <p className="text-xs text-slate-400 mt-1">Blended across all 4 fiscal years</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Cumulative Loss Drag</p>
          <h3 className="text-xl font-bold text-rose-400 mt-1">-${overall_summary.total_loss_amount.toLocaleString()}</h3>
          <p className="text-xs text-rose-400/80 mt-1">{overall_summary.loss_transactions.toLocaleString()} loss transactions ({overall_summary.loss_rate_pct}%)</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Discount-Profit Correlation</p>
          <h3 className="text-xl font-bold text-amber-400 mt-1">{overall_summary.corr_discount_profit}</h3>
          <p className="text-xs text-slate-400 mt-1">Strong inverse relationship (r = -0.22)</p>
        </div>
      </div>

      {/* Discount Tiers Impact Breakdown Chart */}
      <ChartCard
        title="Profit Margin Realization by Discount Tier"
        subtitle="Empirical proof that discounts above 20% produce severe structural negative margins"
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={discount_tiers} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="Discount Tier" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Profit Margin']}
              />
              <Bar dataKey="profit_margin_pct" name="Profit Margin %" radius={[4, 4, 0, 0]}>
                {discount_tiers.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={TIER_COLORS[index % TIER_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Discount Tiers Data Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Discount Tiers Financial Matrix"
          subtitle="Revenue, losses, and transaction count by discount bracket"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Discount Tier</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                  <th className="py-2.5 px-3 text-right">Margin %</th>
                  <th className="py-2.5 px-3 text-right">Loss Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {discount_tiers.map((t: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">{t['Discount Tier']}</td>
                    <td className="py-2.5 px-3 text-right">${t.revenue.toLocaleString()}</td>
                    <td className={`py-2.5 px-3 text-right font-medium ${t.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.profit >= 0 ? `$${t.profit.toLocaleString()}` : `-$${Math.abs(t.profit).toLocaleString()}`}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={t.profit_margin_pct >= 10 ? 'text-emerald-400' : t.profit_margin_pct >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                        {t.profit_margin_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {t.loss_rate_pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Top 10 Loss Sub-Categories */}
        <ChartCard
          title="Top 10 Loss Sub-Categories by Loss Amount"
          subtitle="Merchandise categories where excessive discounting drives net losses"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Sub-Category</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Loss Lines</th>
                  <th className="py-2.5 px-3 text-right">Avg Discount</th>
                  <th className="py-2.5 px-3 text-right">Total Loss ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {top_loss_subcategories.map((l: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-semibold text-white">{l['Sub-Category']}</td>
                    <td className="py-2 px-3 text-slate-400">{l['Category']}</td>
                    <td className="py-2 px-3 text-right font-mono">{l.loss_count}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-400 font-semibold">{l.avg_discount}%</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-400">
                      -${Math.abs(l.total_loss).toLocaleString()}
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
