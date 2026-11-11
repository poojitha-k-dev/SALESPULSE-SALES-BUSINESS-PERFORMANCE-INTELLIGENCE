import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'priority' | 'status' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  const getBadgeStyle = () => {
    const s = status.toUpperCase();
    if (s === 'CRITICAL' || s === 'FAILED' || s === 'LOSS') {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (s === 'HIGH' || s === 'WARNING') {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    if (s === 'MEDIUM' || s === 'INFO') {
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
    if (s === 'LOW' || s === 'OPERATIONAL' || s === 'SUCCESS' || s === 'PROFITABLE') {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    return 'bg-slate-700/30 text-slate-300 border-slate-700';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle()}`}>
      {status}
    </span>
  );
};

