import React, { useState } from 'react';
import { TelemetryPoint } from '../types/telemetry';

interface HealthIndexRulChartProps {
  data: TelemetryPoint[];
  currentCycle: number;
  maxCycles: number;
  kneePoint: number;
  threshold3Sigma: number;
  timeUnit?: string;
}

export const HealthIndexRulChart: React.FC<HealthIndexRulChartProps> = ({
  data,
  currentCycle,
  maxCycles,
  kneePoint,
  threshold3Sigma,
  timeUnit = 'Cycles',
}) => {
  const [hoveredCycle, setHoveredCycle] = useState<number | null>(null);

  const activeHover = hoveredCycle !== null ? hoveredCycle : currentCycle;
  const hoveredPoint = data.find((d) => d.cycle === activeHover) || data[data.length - 1];

  const width = 1000;
  const height1 = 180;
  const height2 = 210;
  const margin = { top: 20, right: 30, bottom: 20, left: 60 };

  const plotW = width - margin.left - margin.right;
  const plotH1 = height1 - margin.top - margin.bottom;
  const plotH2 = height2 - margin.top - margin.bottom;

  const xScale = (cycle: number) => margin.left + (cycle / maxCycles) * plotW;

  const maxMse = Math.max(0.08, ...data.map((d) => d.health_index_mse));
  const yScaleTop = (mse: number) =>
    margin.top + plotH1 - (Math.min(mse, maxMse) / maxMse) * plotH1;

  const maxRul = 135;
  const yScaleBottom = (rul: number) =>
    margin.top + plotH2 - (Math.min(rul, maxRul) / maxRul) * plotH2;

  const history = data.filter((d) => d.cycle <= currentCycle);

  const mseHistoryPath = history
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.cycle).toFixed(1)} ${yScaleTop(d.health_index_mse).toFixed(1)}`)
    .join(' ');

  const rulActualPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.cycle).toFixed(1)} ${yScaleBottom(d.RUL_clipped).toFixed(1)}`)
    .join(' ');

  const rulPredPath = history
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.cycle).toFixed(1)} ${yScaleBottom(d.RUL_pred).toFixed(1)}`)
    .join(' ');

  const ciPolygon = history.length > 1
    ? history
        .map((d) => `${xScale(d.cycle).toFixed(1)},${yScaleBottom(Math.min(135, d.RUL_pred + 12)).toFixed(1)}`)
        .concat(
          history
            .slice()
            .reverse()
            .map((d) => `${xScale(d.cycle).toFixed(1)},${yScaleBottom(Math.max(0, d.RUL_pred - 12)).toFixed(1)}`)
        )
        .join(' ')
    : '';

  const thresholdY = yScaleTop(threshold3Sigma);
  const currentX = xScale(currentCycle);
  const kneeX = xScale(kneePoint);

  return (
    <div className="bg-[#111722] border border-[#1e2638] rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 tracking-tight">
            Predictive Health Degradation Trajectory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage 1 Autoencoder anomaly reconstruction MSE & Stage 2 LSTM Remaining Useful Life
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-500 rounded-sm inline-block" />
            <span>Autoencoder MSE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-amber-500 inline-block" />
            <span>3σ Threshold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-sm inline-block" />
            <span>LSTM Predicted RUL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dotted border-slate-500 inline-block" />
            <span>Actual Ground Truth</span>
          </div>
        </div>
      </div>

      {/* Top: Autoencoder MSE */}
      <div className="relative">
        <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex justify-between">
          <span>STAGE 1 · RECONSTRUCTION ERROR (ANOMALY INDEX)</span>
          <span className="text-blue-400 font-mono">
            Reading: {hoveredPoint.health_index_mse.toFixed(4)} MSE{' '}
            {hoveredPoint.health_index_mse > threshold3Sigma ? '(Drift Detected)' : '(Normal)'}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height1}`}
          className="w-full h-auto bg-[#0c1017] border border-[#1e2638] rounded-lg overflow-hidden"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const fraction = (relX / rect.width) * (width / plotW) - margin.left / plotW;
            const cycle = Math.max(1, Math.min(maxCycles, Math.round(fraction * maxCycles)));
            setHoveredCycle(cycle);
          }}
          onMouseLeave={() => setHoveredCycle(null)}
        >
          {/* Subtle grid */}
          {[0.33, 0.66, 1.0].map((frac) => (
            <line
              key={frac}
              x1={margin.left}
              y1={margin.top + plotH1 * (1 - frac)}
              x2={width - margin.right}
              y2={margin.top + plotH1 * (1 - frac)}
              stroke="#1b2332"
              strokeDasharray="2 2"
            />
          ))}

          {/* Knee point marker */}
          <line
            x1={kneeX}
            y1={margin.top}
            x2={kneeX}
            y2={margin.top + plotH1}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeOpacity="0.5"
          />
          <text x={kneeX + 4} y={margin.top + 12} fill="#f59e0b" fontSize="10" fontFamily="sans-serif">
            Degradation Onset
          </text>

          {/* 3-Sigma Limit */}
          <line
            x1={margin.left}
            y1={thresholdY}
            x2={width - margin.right}
            y2={thresholdY}
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
          <text x={width - margin.right - 90} y={thresholdY - 4} fill="#f59e0b" fontSize="9" fontFamily="sans-serif">
            3σ Limit ({threshold3Sigma.toFixed(4)})
          </text>

          {/* MSE Trace */}
          <path d={mseHistoryPath} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Active Cursor */}
          <line x1={currentX} y1={margin.top} x2={currentX} y2={margin.top + plotH1} stroke="#f43f5e" strokeWidth="1.2" />
          <circle cx={currentX} cy={yScaleTop(hoveredPoint.health_index_mse)} r="4" fill="#f43f5e" />

          <text x={margin.left - 8} y={margin.top + 10} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="sans-serif">
            {maxMse.toFixed(2)}
          </text>
          <text x={margin.left - 8} y={margin.top + plotH1} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="sans-serif">
            0.00
          </text>
        </svg>
      </div>

      {/* Bottom: RUL Prediction */}
      <div className="relative mt-5">
        <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex justify-between">
          <span>STAGE 2 · REMAINING USEFUL LIFE (PIECEWISE LINEAR REGRESSION)</span>
          <span className="text-emerald-400 font-mono">
            RUL: {hoveredPoint.RUL_pred} {timeUnit} (Actual: {hoveredPoint.RUL_actual})
          </span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height2}`}
          className="w-full h-auto bg-[#0c1017] border border-[#1e2638] rounded-lg overflow-hidden"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const fraction = (relX / rect.width) * (width / plotW) - margin.left / plotW;
            const cycle = Math.max(1, Math.min(maxCycles, Math.round(fraction * maxCycles)));
            setHoveredCycle(cycle);
          }}
          onMouseLeave={() => setHoveredCycle(null)}
        >
          {/* Service threshold line */}
          <line
            x1={margin.left}
            y1={yScaleBottom(35)}
            x2={width - margin.right}
            y2={yScaleBottom(35)}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.6"
          />
          <text x={margin.left + 8} y={yScaleBottom(35) - 4} fill="#f59e0b" fontSize="9" fontFamily="sans-serif">
            Maintenance Window (35 {timeUnit})
          </text>

          {/* Confidence interval */}
          {ciPolygon && <polygon points={ciPolygon} fill="rgba(16, 185, 129, 0.1)" />}

          {/* Ground truth */}
          <path d={rulActualPath} fill="none" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* RUL prediction */}
          <path d={rulPredPath} fill="none" stroke="#10b981" strokeWidth="2.2" />

          {/* Active cursor */}
          <line x1={currentX} y1={margin.top} x2={currentX} y2={margin.top + plotH2} stroke="#f43f5e" strokeWidth="1.2" />
          <circle cx={currentX} cy={yScaleBottom(hoveredPoint.RUL_pred)} r="4" fill="#10b981" />

          <text x={margin.left - 8} y={yScaleBottom(125)} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="sans-serif">
            125 (Cap)
          </text>
          <text x={margin.left - 8} y={yScaleBottom(0)} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="sans-serif">
            0
          </text>

          <text x={margin.left} y={height2 - 5} fill="#64748b" fontSize="9" fontFamily="sans-serif">
            Start (0)
          </text>
          <text x={width / 2} y={height2 - 5} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif">
            Operating Life ({timeUnit})
          </text>
          <text x={width - margin.right} y={height2 - 5} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="sans-serif">
            Total ({maxCycles})
          </text>
        </svg>
      </div>
    </div>
  );
};
