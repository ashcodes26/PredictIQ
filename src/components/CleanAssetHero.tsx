import React from 'react';
import { ShieldCheck, AlertTriangle, Wrench, AlertOctagon, MapPin } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

interface CleanAssetHeroProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  financials: FinancialImpact;
}

export const CleanAssetHero: React.FC<CleanAssetHeroProps> = ({
  asset,
  currentCycle,
  activePoint,
  financials,
}) => {
  // Normalized 0-100% health score
  const healthPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        activePoint.RUL_pred >= 125
          ? 100 - (currentCycle / asset.kneePoint) * 12
          : (activePoint.RUL_pred / 125) * 88
      )
    )
  );

  let statusBadge = {
    label: 'Normal Condition',
    colorClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    icon: ShieldCheck,
  };

  if (financials.status === 'DRIFT DETECTED') {
    statusBadge = {
      label: 'Early Drift Detected',
      colorClass: 'text-blue-400 bg-blue-950/40 border-blue-800/60',
      icon: AlertTriangle,
    };
  } else if (financials.status === 'SCHEDULE MAINTENANCE') {
    statusBadge = {
      label: 'Maintenance Recommended',
      colorClass: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
      icon: Wrench,
    };
  } else if (financials.status === 'CRITICAL IMMINENT FAILURE') {
    statusBadge = {
      label: 'Critical Alert · Service Required',
      colorClass: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
      icon: AlertOctagon,
    };
  }

  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-[#111722] border border-[#1e2638] rounded-xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Asset Identity & Status */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#1a2334] text-slate-300 border border-[#2a364f]">
              {asset.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{asset.location}</span>
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">
              Priority: <strong className="text-slate-300 font-medium">{asset.criticality}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{asset.name}</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-medium ${statusBadge.colorClass}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusBadge.label}</span>
            </div>
          </div>
        </div>

        {/* Right: Key 3 Vital Numbers */}
        <div className="grid grid-cols-3 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1e2638] lg:divide-x lg:divide-[#1e2638]">
          {/* Health Score */}
          <div className="lg:pl-6">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Health Score
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  healthPercent > 60
                    ? 'text-emerald-400'
                    : healthPercent > 25
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {healthPercent}%
              </span>
              <span className="text-xs text-slate-500">Nominal</span>
            </div>
            <div className="w-24 bg-[#1e2638] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  healthPercent > 60
                    ? 'bg-emerald-500'
                    : healthPercent > 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>

          {/* Remaining Useful Life */}
          <div className="lg:pl-6">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Remaining Useful Life
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {Math.round(activePoint.RUL_pred)}
              </span>
              <span className="text-xs text-slate-400 font-mono">{asset.timeUnit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">
              Active {currentCycle} / {asset.maxLife} {asset.timeUnit}
            </div>
          </div>

          {/* Cost Impact */}
          <div className="lg:pl-6">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Avoided Loss Value
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                ${financials.avoidedLoss.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">
              ${financials.scheduledCost.toLocaleString()} Service vs ${financials.unplannedCost.toLocaleString()} Outage
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
