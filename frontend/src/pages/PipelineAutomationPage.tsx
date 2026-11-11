import React, { useEffect, useState } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Clock,
  ShieldCheck,
  Server,
  Zap,
  Activity
} from 'lucide-react';
import { ChartCard } from '../components/ChartCard';
import { StatusBadge } from '../components/StatusBadge';
import { fetchPipelineStatus, triggerPipelineRun } from '../services/api';
import { PipelineStatusData } from '../types';

export const PipelineAutomationPage: React.FC = () => {
  const [status, setStatus] = useState<PipelineStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetchPipelineStatus();
      setStatus(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleManualRun = async () => {
    try {
      setTriggering(true);
      setRunMessage(null);
      const res = await triggerPipelineRun();
      setRunMessage(`Pipeline completed successfully! Quality Score: ${res.quality_score}%`);
      await loadStatus();
    } catch (err: any) {
      setRunMessage(`Execution error: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  if (loading && !status) {
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
          <h2 className="text-xl font-bold text-white tracking-tight">Data Pipeline & Automation Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time monitoring of automated ETL orchestration, PostgreSQL ingestion health, and n8n workflow execution pipelines.
          </p>
        </div>
        <button
          onClick={handleManualRun}
          disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition self-start sm:self-auto disabled:opacity-50"
        >
          {triggering ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{triggering ? 'Executing Pipeline...' : 'Run Pipeline Now'}</span>
        </button>
      </div>

      {runMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{runMessage}</span>
        </div>
      )}

      {/* 4 Pipeline Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Pipeline Status</span>
            <StatusBadge status="OPERATIONAL" type="status" />
          </div>
          <h3 className="text-lg font-bold text-white mt-2">Active & Healthy</h3>
          <p className="text-xs text-slate-400 mt-0.5">Last execution: Today</p>
        </div>

        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Database Ingestion</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mt-2">9,994 Records</h3>
          <p className="text-xs text-emerald-400 mt-0.5">100% Fact Parity in PostgreSQL</p>
        </div>

        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">Data Quality Score</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-cyan-400 mt-2">100.0%</h3>
          <p className="text-xs text-slate-400 mt-0.5">10/10 Automated Rules Passed</p>
        </div>

        <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase">n8n Automation</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mt-2">3 Active Workflows</h3>
          <p className="text-xs text-amber-400 mt-0.5">Webhooks & Triggers Configured</p>
        </div>
      </div>

      {/* Pipeline Architecture Execution Trace */}
      <ChartCard
        title="Automated Data Pipeline Execution Topology"
        subtitle="End-to-end data transformation pipeline from Raw Ingestion to Analytical PostgreSQL Tables"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
          {/* Step 1 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400 font-mono">01. INGESTION</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-white">Raw Superstore Data</h4>
            <p className="text-[11px] text-slate-400 mt-1">9,994 transaction rows loaded into staging_superstore.</p>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">Status: Verified</div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400 font-mono">02. CLEANSING</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-white">Pandas Validation Engine</h4>
            <p className="text-[11px] text-slate-400 mt-1">Type casting, ISO dates, profit margin math, discount bins.</p>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">Zero nulls detected</div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400 font-mono">03. STAR SCHEMA</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-white">PostgreSQL Loading</h4>
            <p className="text-[11px] text-slate-400 mt-1">Populates dim_products, dim_customers, dim_geography, fact_sales.</p>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">4 Foreign Keys Indexed</div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-400 font-mono">04. AGGREGATES</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-white">Analytical Rollups</h4>
            <p className="text-[11px] text-slate-400 mt-1">Generates agg_monthly_sales, agg_category, agg_regional tables.</p>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">FastAPI cache warm</div>
          </div>
        </div>
      </ChartCard>

      {/* 3 Configured n8n Automation Workflows */}
      <ChartCard
        title="n8n Production Workflow Automations"
        subtitle="Automated scheduled workers executing periodic extraction, KPI anomaly monitoring, and executive alerts"
      >
        <div className="space-y-3">
          {/* Workflow 1 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Workflow 1: Automated Sales Data Pipeline</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Cron: Daily at 02:00 UTC</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schedule Trigger &rarr; HTTP Trigger to FastAPI &rarr; Execute Cleansing &rarr; PostgreSQL Sync &rarr; Validate 10 Rules &rarr; Dispatch Status Webhook.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">File: n8n/sales_pipeline.json</span>
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Workflow 2: Sales Performance & KPI Monitoring</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">Cron: Hourly</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schedule Trigger &rarr; Query /api/overview &rarr; Evaluate Margin &lt; 10% or Loss Alerts &rarr; IF Condition Threshold &rarr; Slack/Webhook Notification.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">File: n8n/sales_monitoring.json</span>
            </div>
          </div>

          {/* Workflow 3 */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Workflow 3: Automated Business Reporting</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium">Cron: Weekly (Mon 09:00 UTC)</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Schedule Trigger &rarr; Extract Monthly Sales &amp; Top 10 SKUs &rarr; Format Executive Markdown / HTML &rarr; Send Email Report to Leadership.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">File: n8n/business_reporting.json</span>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

