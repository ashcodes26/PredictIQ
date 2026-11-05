import React from 'react';
import { Activity, Plus, Bot, Code, ChevronDown } from 'lucide-react';
import { MachineAsset } from '../types/telemetry';

interface CleanTopNavProps {
  assets: MachineAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  onOpenAddModal: () => void;
  activeTab: 'overview' | 'models' | 'roi';
  onSelectTab: (tab: 'overview' | 'models' | 'roi') => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  onOpenCodeModal: () => void;
}

export const CleanTopNav: React.FC<CleanTopNavProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  onOpenAddModal,
  activeTab,
  onSelectTab,
  isCopilotOpen,
  onToggleCopilot,
  onOpenCodeModal,
}) => {
  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  return (
    <header className="border-b border-slate-700/60 bg-gradient-to-r from-[#172235]/95 via-[#1b263b]/95 to-[#172235]/95 backdrop-blur-md px-6 py-3 sticky top-0 z-30 shadow-lg shadow-black/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand & Machine Asset Selector */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-sm tracking-tight whitespace-nowrap">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/25 to-indigo-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-bold">
              PredictIQ
            </span>
            <span className="text-slate-600 font-normal">/</span>
            <span className="text-xs text-slate-400 font-normal">Fleet Monitor</span>
          </div>

          {/* Machine Dropdown Selector */}
          <div className="relative flex items-center">
            <select
              value={selectedAssetId}
              onChange={(e) => onSelectAsset(e.target.value)}
              className="bg-[#1f2c42] text-xs font-medium text-slate-100 border border-slate-600/60 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 appearance-none cursor-pointer shadow-sm hover:bg-[#263752] transition-colors"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id} className="bg-[#162030] text-slate-100">
                  {asset.name} ({asset.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-200 hover:text-white bg-[#1f2c42] hover:bg-[#283955] border border-slate-600/60 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Center: Simplified Clean View Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#131b29] p-1 rounded-lg border border-slate-700/60 shadow-inner">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            Health Overview
          </button>
          <button
            onClick={() => onSelectTab('models')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'models'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            AI Diagnostics & RUL
          </button>
          <button
            onClick={() => onSelectTab('roi')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeTab === 'roi'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/40'
            }`}
          >
            Financial ROI
          </button>
        </div>

        {/* Right: Copilot Toggle & Code Export */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isCopilotOpen
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md'
                : 'bg-[#1f2c42] text-slate-200 border-slate-600/60 hover:text-white hover:bg-[#283955] shadow-sm'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-[#1f2c42] hover:bg-[#283955] border border-slate-600/60 rounded-lg transition-colors shadow-sm"
          >
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>app.py</span>
          </button>
        </div>
      </div>
    </header>
  );
};
