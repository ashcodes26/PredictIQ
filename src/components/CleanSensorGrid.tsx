import React from 'react';
import { MachineAsset, TelemetryPoint } from '../types/telemetry';

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
  const history = asset.data.filter((d) => d.cycle <= currentCycle);

  return (
    <div className="bg-[#111722] border border-[#1e2638] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Multi-Channel Telemetry Envelopes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time physical sensors calibrated against nominal baseline thresholds
          </p>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          {asset.sensors.length} Active Channels
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {asset.sensors.map((sensor, idx) => {
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
          const isWarning = absPct > 8;
          const isCritical = absPct > 20;

          return (
            <div
              key={sensor.key}
              className="bg-[#151d2c] border border-[#232d3f] rounded-lg p-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{sensor.name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {sensor.description}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-slate-100">
                    {currentVal.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">{sensor.unit}</span>
                  </div>
                  <div
                    className={`text-[10px] font-mono ${
                      isCritical
                        ? 'text-rose-400 font-semibold'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    Δ {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} ({pctDelta}%)
                  </div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="mt-3">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
                  {/* Subtle baseline */}
                  <line
                    x1={pad.left}
                    y1={getY(baselineVal)}
                    x2={w - pad.right}
                    y2={getY(baselineVal)}
                    stroke="#334155"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                  {/* History line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#3b82f6'}
                    strokeWidth="1.8"
                  />
                  {/* Current point */}
                  <circle
                    cx={currX}
                    cy={currY}
                    r="3.5"
                    fill={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#3b82f6'}
                    stroke="#111722"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
