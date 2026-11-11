import React, { useEffect, useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Tag,
  ArrowRight,
  Download,
  Filter
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { fetchStrategicInsights } from '../services/api';
import { StrategicInsight } from '../types';

export const BusinessInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<StrategicInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    fetchStrategicInsights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredInsights = insights.filter((ins) => {
    if (priorityFilter === 'All') return true;
    return ins.priority === priorityFilter;
  });

  const exportInsightsMd = () => {
    let content = "# SalesPulse – Strategic Business Recommendations\n\n";
    insights.forEach((ins) => {
      content += `### [${ins.id}] ${ins.title}\n`;
      content += `- **Priority**: ${ins.priority} | **Domain**: ${ins.category}\n`;
      content += `- **Supporting Metric**: ${ins.metric}\n`;
      content += `- **Business Implication**: ${ins.implication}\n`;
      content += `- **Recommended Action**: ${ins.action}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SalesPulse_Executive_Directives_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Executive Business Insights & Action Plan</h2>
          <p className="text-xs text-slate-400 mt-1">
            Evidence-based strategic directives derived empirically from transactional analysis to optimize revenue and salvage lost margins.
          </p>
        </div>
        <button
          onClick={exportInsightsMd}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Markdown Directives</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium mr-2">
          <Filter className="w-3.5 h-3.5" /> Priority:
        </span>
        {['All', 'CRITICAL', 'HIGH', 'MEDIUM'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              priorityFilter === p
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        {filteredInsights.map((ins) => (
          <div
            key={ins.id}
            className="bg-[#172033] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition relative overflow-hidden"
          >
            {/* Priority Indicator Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {ins.id}
                </span>
                <span className="text-xs text-slate-400 font-medium">{ins.category}</span>
              </div>
              <StatusBadge status={ins.priority} type="priority" />
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-white tracking-tight">{ins.title}</h3>

            {/* Grid of Metric, Implication, Action */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Supporting Metric */}
              <div className="bg-[#0B1120] border border-slate-800/80 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Supporting Metric
                </p>
                <p className="text-slate-200 leading-relaxed">{ins.metric}</p>
              </div>

              {/* Business Implication */}
              <div className="bg-[#0B1120] border border-slate-800/80 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Business Implication
                </p>
                <p className="text-slate-200 leading-relaxed">{ins.implication}</p>
              </div>

              {/* Recommended Action */}
              <div className="bg-[#0B1120] border border-indigo-500/30 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recommended Action
                </p>
                <p className="text-slate-100 font-medium leading-relaxed">{ins.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

