import React from 'react';
import { DollarSign, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

interface VenturePitchPanelProps {
  asset: MachineAsset;
  data: TelemetryPoint[];
  currentCycle: number;
  financials: FinancialImpact;
}

export const VenturePitchPanel: React.FC<VenturePitchPanelProps> = ({
  asset,
  data,
  currentCycle,
  financials,
}) => {
  return (
    <div className="bg-[#111722] border border-[#1e2638] rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-100 tracking-tight">
          Financial & Operational Risk Avoidance Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Proactive condition-based intervention transitions heavy assets from reactive catastrophic triage to predictable maintenance windows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cost Matrix */}
        <div className="bg-[#151d2c] border border-[#232d3f] rounded-lg p-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Economic Impact Breakdown ({asset.name})</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[#232d3f]">
              <div>
                <div className="text-xs font-medium text-rose-400">Unplanned Outage / Catastrophic Failure</div>
                <div className="text-[11px] text-slate-400">Emergency repairs, collateral equipment damage, downtime</div>
              </div>
              <div className="text-sm font-mono font-bold text-rose-400">
                ${asset.unplannedCost.toLocaleString()}
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[#232d3f]">
              <div>
                <div className="text-xs font-medium text-emerald-400">Planned Condition Maintenance</div>
                <div className="text-[11px] text-slate-400">Scheduled component replacement during regular shutdown</div>
              </div>
              <div className="text-sm font-mono font-bold text-emerald-400">
                ${asset.scheduledCost.toLocaleString()}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 bg-[#0c1017] px-3.5 rounded-lg border border-emerald-900/40">
              <div>
                <div className="text-xs font-semibold text-slate-100">Net Capital Saved Per Event</div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {financials.roiPercent}% Return on Maintenance Investment
                </div>
              </div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                +${(asset.unplannedCost - asset.scheduledCost).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Model Overview */}
        <div className="bg-[#151d2c] border border-[#232d3f] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-3">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Two-Stage Predictive Algorithm</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-[#0c1017] rounded-lg border border-[#232d3f]">
                <div className="text-xs font-semibold text-blue-400 mb-1">
                  1. Autoencoder Anomaly Detection
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Reconstructs baseline sensor correlations without labeled failure data. When reconstruction MSE crosses a 3-sigma statistical threshold, an onset warning is flagged.
                </p>
              </div>

              <div className="p-3 bg-[#0c1017] rounded-lg border border-[#232d3f]">
                <div className="text-xs font-semibold text-emerald-400 mb-1">
                  2. Recurrent Sequence RUL Regression
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Processes multi-cycle sliding windows to regress Remaining Useful Life ({asset.timeUnit}) with conservative asymmetric weighting to eliminate late failure risks.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-[#232d3f] flex items-center justify-between">
            <span>Machine Category: {asset.category}</span>
            <span>Asset ID: {asset.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
