import React, { useState } from 'react';
import { MachineAsset, TelemetryPoint } from '../types/telemetry';
import { AiSensorAnomalyCard } from './AiSensorAnomalyCard';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface CleanSensorGridProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
}

export const CleanSensorGrid: React.FC<CleanSensorGridProps> = ({
  asset,
  currentCycle,
  activePoint,
}) => {
  const [isOnlyAnomaliesFilter, setIsOnlyAnomaliesFilter] = useState<boolean>(false);
  const history = asset.data.filter((d) => d.cycle <= currentCycle);

  // Compute anomalous channels count
  const anomalousChannelCount = asset.sensors.filter((s) => {
    const valKey = s.key as keyof TelemetryPoint;
    const currentVal = Number(activePoint[valKey] || 0);
    const baseline = s.baseline;
    const delta = currentVal - baseline;
    const pct = Math.abs((delta / (baseline || 1)) * 100);
    return pct > 8;
  }).length;

  const displayedSensors = isOnlyAnomaliesFilter
    ? asset.sensors.filter((s) => {
        const valKey = s.key as keyof TelemetryPoint;
        const currentVal = Number(activePoint[valKey] || 0);
        const baseline = s.baseline;
        const delta = currentVal - baseline;
        const pct = Math.abs((delta / (baseline || 1)) * 100);
        return pct > 8;
      })
    : asset.sensors;

  return (
    <div className="bg-gradient-to-b from-[#1b2537]/90 to-[#151f30]/90 backdrop-blur-sm border border-slate-700/60 rounded-xl p-6 shadow-lg shadow-black/10">
      {/* 1. AI Sensor Anomaly Diagnostic Component */}
      <AiSensorAnomalyCard
        asset={asset}
        currentCycle={currentCycle}
        activePoint={activePoint}
        isOnlyAnomaliesFilter={isOnlyAnomaliesFilter}
        onToggleFilter={() => setIsOnlyAnomaliesFilter(!isOnlyAnomaliesFilter)}
        anomalousChannelCount={anomalousChannelCount}
      />

      {/* 2. Sensor Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Multi-Channel Telemetry Envelopes</span>
            {isOnlyAnomaliesFilter && (
              <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                Filtered: Anomalies Only
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physical telemetry channels evaluated against statistical baseline models
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-[11px] text-slate-500">{asset.sensors.length - anomalousChannelCount} Nominal</span>
          </span>
          {anomalousChannelCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
              <span className="text-[11px] text-amber-400 font-semibold">{anomalousChannelCount} Anomalous</span>
            </span>
          )}
          <span className="text-slate-600">|</span>
          <span>{displayedSensors.length} of {asset.sensors.length} Channels</span>
        </div>
      </div>

      {/* Empty State when filter is active and no anomalies exist */}
      {displayedSensors.length === 0 ? (
        <div className="text-center py-10 px-4 bg-[#182336]/80 rounded-xl border border-slate-700/60 my-2">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-100">No Sensor Anomalies Detected</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
            At {currentCycle} {asset.timeUnit}, all {asset.sensors.length} channels are operating within the nominal ±8% variance envelope.
          </p>
          <button
            onClick={() => setIsOnlyAnomaliesFilter(false)}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
          >
            Show All Channels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedSensors.map((sensor) => {
            const valKey = sensor.key as keyof TelemetryPoint;
            const currentVal = Number(activePoint[valKey] || 0);
            const baselineVal = sensor.baseline;
            const delta = currentVal - baselineVal;
            const pctDelta = ((delta / (baselineVal || 1)) * 100).toFixed(1);

            // Calculate min/max for sparkline
            const allVals = asset.data.map((d) => Number(d[valKey] || 0));
            const minVal = Math.min(...allVals);
            const maxVal = Math.max(...allVals);
            const range = maxVal - minVal || 1;

            // Sparkline coordinates
            const w = 320;
            const h = 75;
            const pad = { top: 8, bottom: 12, left: 6, right: 6 };
            const plotW = w - pad.left - pad.right;
            const plotH = h - pad.top - pad.bottom;

            const getX = (c: number) => pad.left + (c / asset.maxLife) * plotW;
            const getY = (v: number) =>
              pad.top + plotH - ((Math.min(maxVal, Math.max(minVal, v)) - minVal) / range) * plotH;

            const pathD = history
              .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.cycle).toFixed(1)} ${getY(Number(d[valKey] || 0)).toFixed(1)}`)
              .join(' ');

            const currX = getX(currentCycle);
            const currY = getY(currentVal);

            const absPct = Math.abs(Number(pctDelta));
            const isWarning = absPct > 8 && absPct <= 20;
            const isCritical = absPct > 20;

            return (
              <div
                key={sensor.key}
                className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-md ${
                  isCritical
                    ? 'bg-gradient-to-b from-[#2a1a2b] to-[#1c1424] border-rose-500/50 shadow-[0_0_18px_rgba(244,63,94,0.12)]'
                    : isWarning
                    ? 'bg-gradient-to-b from-[#2b2420] to-[#1e1a1e] border-amber-500/40 shadow-[0_0_14px_rgba(245,158,11,0.08)]'
                    : 'bg-gradient-to-b from-[#1f2c42]/90 to-[#182335]/90 border-slate-700/60 hover:border-slate-500/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100">{sensor.name}</span>
                      {isCritical && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 uppercase">
                          Anomaly
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40 uppercase">
                          Drift
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      {sensor.description}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-white">
                      {currentVal.toFixed(1)}{' '}
                      <span className="text-xs font-normal text-slate-300">{sensor.unit}</span>
                    </div>
                    <div
                      className={`text-[10px] font-mono font-medium ${
                        isCritical
                          ? 'text-rose-400 font-semibold'
                          : isWarning
                          ? 'text-amber-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      Δ {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} ({pctDelta}%)
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mt-3 p-1.5 bg-[#121927]/60 rounded-lg border border-slate-700/40">
                  <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
                    {/* Subtle baseline */}
                    <line
                      x1={pad.left}
                      y1={getY(baselineVal)}
                      x2={w - pad.right}
                      y2={getY(baselineVal)}
                      stroke="#475569"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    {/* History line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#38bdf8'}
                      strokeWidth="1.8"
                    />
                    {/* Current point */}
                    <circle
                      cx={currX}
                      cy={currY}
                      r="3.5"
                      fill={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#38bdf8'}
                      stroke="#182335"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Sensor footer state bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Baseline: {baselineVal} {sensor.unit}</span>
                  <span className={isCritical ? 'text-rose-400 font-semibold' : isWarning ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                    {isCritical ? 'Envelope Breach' : isWarning ? 'Statistical Drift' : 'Calibrated Nominal'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
