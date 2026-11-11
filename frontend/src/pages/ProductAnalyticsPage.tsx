import React, { useEffect, useState } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Award,
  Search,
  ArrowUpDown,
  Filter
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
import { fetchProductPerformance } from '../services/api';
import { ProductPerformanceData } from '../types';

export const ProductAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'top_revenue' | 'top_profit' | 'loss_making' | 'margin_traps'>('top_revenue');

  useEffect(() => {
    fetchProductPerformance(25)
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

  const { category_summary, subcategory_summary, top_revenue_products, top_profit_products, loss_making_products, revenue_margin_traps, total_unique_products, total_loss_making_products_count } = data;

  const currentProductList =
    activeTab === 'top_revenue'
      ? top_revenue_products
      : activeTab === 'top_profit'
      ? top_profit_products
      : activeTab === 'loss_making'
      ? loss_making_products
      : revenue_margin_traps;

  const filteredProducts = currentProductList.filter((p: any) => {
    const matchesSearch =
      p['Product Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      p['Product ID'].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p['Category'] === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Product Analytics & Merchandising Intelligence</h2>
        <p className="text-xs text-slate-400 mt-1">
          Catalog profitability diagnostics: analyzing 1,862 active SKUs, isolating loss-generating hardware, and uncovering high-volume margin traps.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Catalog Catalog Depth</p>
          <h3 className="text-xl font-bold text-white mt-1">{total_unique_products.toLocaleString()} SKUs</h3>
          <p className="text-xs text-slate-400 mt-1">Across 17 distinct subcategories</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Unprofitable SKUs</p>
          <h3 className="text-xl font-bold text-rose-400 mt-1">{total_loss_making_products_count} SKUs</h3>
          <p className="text-xs text-rose-400/80 mt-1">{((total_loss_making_products_count / total_unique_products) * 100).toFixed(1)}% of catalog operates at loss</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Highest Margin Category</p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">Technology (17.4%)</h3>
          <p className="text-xs text-emerald-400/80 mt-1">Copiers & Phones drive top profits</p>
        </div>
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase font-medium">Lowest Margin Sub-Category</p>
          <h3 className="text-xl font-bold text-amber-400 mt-1">Tables (-8.6%)</h3>
          <p className="text-xs text-rose-400 mt-1">-$17,725 cumulative loss</p>
        </div>
      </div>

      {/* Subcategory Revenue vs Profit Benchmark Chart */}
      <ChartCard
        title="Sub-Category Revenue & Profit Performance (All 17 Sub-Categories)"
        subtitle="Comparing sales volume against net realized earnings by merchandise segment"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subcategory_summary} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="Sub-Category" stroke="#64748B" fontSize={10} angle={-30} textAnchor="end" />
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
              <Bar dataKey="revenue" name="Revenue ($)" fill="#6366F1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit ($)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Interactive Filterable Product Performance Table */}
      <div className="bg-[#172033] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Tab Selection */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('top_revenue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'top_revenue'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Top Revenue SKUs
            </button>
            <button
              onClick={() => setActiveTab('top_profit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'top_profit'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Most Profitable SKUs
            </button>
            <button
              onClick={() => setActiveTab('loss_making')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'loss_making'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Loss-Making SKUs (Action Needed)
            </button>
            <button
              onClick={() => setActiveTab('margin_traps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'margin_traps'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              High-Volume Margin Traps
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search product SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0B1120] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none w-56 focus:border-indigo-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#0B1120] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Furniture">Furniture</option>
              <option value="Office Supplies">Office Supplies</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Product Name & SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Sub-Category</th>
                <th className="py-2.5 px-3 text-right">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Avg Discount</th>
                <th className="py-2.5 px-3 text-right">Revenue</th>
                <th className="py-2.5 px-3 text-right">Profit</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((p: any, idx: number) => {
                const isLoss = p.profit < 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 max-w-[280px]">
                      <div className="font-semibold text-white truncate" title={p['Product Name']}>
                        {p['Product Name']}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p['Product ID']}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p['Category']}</td>
                    <td className="py-3 px-3 text-slate-300">{p['Sub-Category']}</td>
                    <td className="py-3 px-3 text-right font-mono">{p.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">{p.avg_discount_pct}%</td>
                    <td className="py-3 px-3 text-right font-semibold text-white">${p.revenue.toLocaleString()}</td>
                    <td className={`py-3 px-3 text-right font-semibold ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isLoss ? `-$${Math.abs(p.profit).toLocaleString()}` : `$${p.profit.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">
                      <span className={p.profit_margin_pct >= 20 ? 'text-emerald-400' : p.profit_margin_pct >= 0 ? 'text-amber-400' : 'text-rose-400'}>
                        {p.profit_margin_pct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge
                        status={isLoss ? 'LOSS' : p.profit_margin_pct >= 20 ? 'PROFITABLE' : 'LOW MARGIN'}
                      />
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

