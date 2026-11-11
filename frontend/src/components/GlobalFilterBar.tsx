import React from 'react';
import { Filter, RotateCcw, Calendar, MapPin, Layers, Users } from 'lucide-react';
import { FilterState } from '../types';

interface GlobalFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  isLoading = false
}) => {
  const handleChange = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-[#172033]/80 backdrop-blur-sm border border-slate-800 rounded-xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Year Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0B1120]">All Years (2014-2017)</option>
            <option value="2017" className="bg-[#0B1120]">2017</option>
            <option value="2016" className="bg-[#0B1120]">2016</option>
            <option value="2015" className="bg-[#0B1120]">2015</option>
            <option value="2014" className="bg-[#0B1120]">2014</option>
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.region}
            onChange={(e) => handleChange('region', e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0B1120]">All Regions</option>
            <option value="West" className="bg-[#0B1120]">West</option>
            <option value="East" className="bg-[#0B1120]">East</option>
            <option value="Central" className="bg-[#0B1120]">Central</option>
            <option value="South" className="bg-[#0B1120]">South</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0B1120]">All Categories</option>
            <option value="Technology" className="bg-[#0B1120]">Technology</option>
            <option value="Furniture" className="bg-[#0B1120]">Furniture</option>
            <option value="Office Supplies" className="bg-[#0B1120]">Office Supplies</option>
          </select>
        </div>

        {/* Segment Filter */}
        <div className="flex items-center gap-1.5 bg-[#0B1120] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.segment}
            onChange={(e) => handleChange('segment', e.target.value)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0B1120]">All Segments</option>
            <option value="Consumer" className="bg-[#0B1120]">Consumer</option>
            <option value="Corporate" className="bg-[#0B1120]">Corporate</option>
            <option value="Home Office" className="bg-[#0B1120]">Home Office</option>
          </select>
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
          title="Reset all filters"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

