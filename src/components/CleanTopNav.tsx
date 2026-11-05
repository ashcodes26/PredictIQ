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
    <header className="border-b border-[#1e2638] bg-[#0d121c] px-6 py-3 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand & Machine Asset Selector */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 text-slate-100 font-semibold text-sm tracking-tight whitespace-nowrap">
            <div className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span>PredictIQ</span>
            <span className="text-slate-600 font-normal">/</span>
            <span className="text-xs text-slate-400 font-normal">Asset Fleet</span>
          </div>

          {/* Machine Dropdown Selector */}
          <div className="relative flex items-center">
            <select
              value={selectedAssetId}
              onChange={(e) => onSelectAsset(e.target.value)}
              className="bg-[#151d2c] text-xs font-medium text-slate-200 border border-[#232d3f] rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-[#151d2c] hover:bg-[#1b2538] border border-[#232d3f] rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Center: Simplified Clean View Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#151d2c] p-1 rounded-lg border border-[#232d3f]">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Health Overview
          </button>
          <button
            onClick={() => onSelectTab('models')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'models'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Diagnostics & RUL
          </button>
          <button
            onClick={() => onSelectTab('roi')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'roi'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Financial ROI
          </button>
        </div>

        {/* Right: Copilot Toggle & Code Export */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isCopilotOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-[#151d2c] text-slate-300 border-[#232d3f] hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#151d2c] border border-[#232d3f] rounded-lg transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>app.py</span>
          </button>
        </div>
      </div>
    </header>
  );
};
