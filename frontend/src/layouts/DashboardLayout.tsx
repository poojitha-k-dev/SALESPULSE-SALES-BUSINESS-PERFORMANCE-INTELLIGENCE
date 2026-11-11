import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  MapPin,
  Percent,
  Users,
  Lightbulb,
  Workflow,
  Database,
  Menu,
  X,
  Bell,
  Download,
  CheckCircle2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'sales'
  | 'products'
  | 'regions'
  | 'profitability'
  | 'customers'
  | 'insights'
  | 'pipeline'
  | 'explorer';

interface DashboardLayoutProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  children: React.ReactNode;
}

const navItems: Array<{ id: PageId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }> = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
  { id: 'products', label: 'Product Analytics', icon: Package },
  { id: 'regions', label: 'Regional Analytics', icon: MapPin },
  { id: 'profitability', label: 'Profitability Analysis', icon: Percent },
  { id: 'customers', label: 'Customer Analytics', icon: Users },
  { id: 'insights', label: 'Business Insights', icon: Lightbulb, badge: '7 Active' },
  { id: 'pipeline', label: 'Data Pipeline & Automation', icon: Workflow },
  { id: 'explorer', label: 'Data Explorer', icon: Database },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentPage,
  onPageChange,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111827] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Product Branding */}
          <div className="h-16 border-b border-slate-800/80 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight leading-none">SalesPulse</h1>
                <p className="text-[10px] text-cyan-400 font-medium tracking-wide mt-1">BUSINESS INTELLIGENCE</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 mt-2">
            <p className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Platform Analytics
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0F172A]/50">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">PostgreSQL 16</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium">Live Connected</span>
          </div>
          <p className="text-[11px] text-slate-400">
            9,994 transactions synchronized
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-[#111827]/70 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>SalesPulse</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-100 font-medium capitalize">
                {navItems.find((n) => n.id === currentPage)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Tagline */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Transform Sales Data Into Smarter Decisions</span>
            </div>

            {/* Direct Swagger Docs Button */}
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Open OpenAPI Swagger Documentation"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>API Docs</span>
            </a>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-400 bg-[#0B1120]">
          SalesPulse Enterprise BI Platform &copy; 2026. Built with React, TypeScript, Tailwind CSS, FastAPI & PostgreSQL.
        </footer>
      </div>
    </div>
  );
};
