import React, { useEffect, useState } from 'react';
import {
  Database,
  Table as TableIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ChartCard } from '../components/ChartCard';
import { fetchExplorerTables, fetchTablePreview } from '../services/api';

export const DataExplorerPage: React.FC = () => {
  const [tables, setTables] = useState<Array<{ table_name: string; record_count: number }>>([]);
  const [selectedTable, setSelectedTable] = useState<string>('fact_sales');
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExplorerTables()
      .then((t) => {
        setTables(t);
        if (t.length > 0 && !selectedTable) setSelectedTable(t[0].table_name);
      })
      .catch(console.error);
  }, []);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const res = await fetchTablePreview(selectedTable, page, pageSize);
      setPreviewData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [selectedTable, page, pageSize]);

  const handleTableChange = (name: string) => {
    setSelectedTable(name);
    setPage(1);
  };

  const handleExportCSV = () => {
    window.open(`http://127.0.0.1:8000/api/data/explorer/export?table=${selectedTable}`, '_blank');
  };

  const filteredRows =
    previewData?.rows?.filter((r: any) => {
      if (!searchTerm) return true;
      return Object.values(r).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">PostgreSQL Relational Data Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Safely browse schema definitions, dimensional entities, transactional facts, and download analytical extracts.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Table to CSV</span>
        </button>
      </div>

      {/* Available Database Tables Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tables.map((t) => (
          <button
            key={t.table_name}
            onClick={() => handleTableChange(t.table_name)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
              selectedTable === t.table_name
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 font-semibold'
                : 'bg-[#172033] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t.table_name}</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded-full text-slate-300 font-mono">
              {t.record_count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* Table Metadata Summary Cards */}
      {previewData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase">Selected Entity</span>
            <h4 className="text-base font-bold text-white mt-1 font-mono">{previewData.table_name}</h4>
          </div>
          <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase">Total Persisted Records</span>
            <h4 className="text-base font-bold text-emerald-400 mt-1">{previewData.total_records.toLocaleString()} rows</h4>
          </div>
          <div className="bg-[#172033] border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-medium text-slate-400 uppercase">Schema Columns</span>
            <h4 className="text-base font-bold text-cyan-400 mt-1">{previewData.columns.length} Fields Defined</h4>
          </div>
        </div>
      )}

      {/* Interactive Table Container */}
      <div className="bg-[#172033] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        {/* Search & Pagination Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search current page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B1120] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none w-56 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Page <strong className="text-white">{page}</strong> of{' '}
              <strong className="text-white">{previewData?.total_pages || 1}</strong>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(previewData?.total_pages || 1, p + 1))}
                disabled={page >= (previewData?.total_pages || 1) || loading}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto max-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 sticky top-0 bg-[#172033] z-10">
                <tr>
                  {previewData?.columns.map((c: any) => (
                    <th key={c.column_name} className="py-2.5 px-3">
                      <div>{c.column_name}</div>
                      <div className="text-[9px] text-indigo-400 font-mono font-normal">
                        {c.data_type}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                {filteredRows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40">
                    {previewData?.columns.map((c: any) => (
                      <td key={c.column_name} className="py-2 px-3 text-slate-200">
                        {row[c.column_name] !== null ? String(row[c.column_name]) : <span className="text-slate-600">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
