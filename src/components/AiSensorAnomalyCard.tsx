import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Activity,
  Layers,
  Wrench,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  Filter
} from 'lucide-react';
import { MachineAsset, TelemetryPoint } from '../types/telemetry';

export interface AiSensorAnomalyCardProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  isOnlyAnomaliesFilter: boolean;
  onToggleFilter: () => void;
  anomalousChannelCount: number;
}

interface AnomalyData {
  hasAnomaly: boolean;
  severity: 'NOMINAL' | 'DRIFT' | 'WARNING' | 'CRITICAL';
  headline: string;
  summary: string;
  anomalousSensors: Array<{
    name: string;
    reading: string;
    deviation: string;
    concern: string;
  }>;
  physicalRootCause: string;
  recommendedAction: string;
}

export const AiSensorAnomalyCard: React.FC<AiSensorAnomalyCardProps> = ({
  asset,
  currentCycle,
  activePoint,
  isOnlyAnomaliesFilter,
  onToggleFilter,
  anomalousChannelCount,
}) => {
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  // Compile sensor deviations
  const sensorMetrics = asset.sensors.map((s) => {
    const valKey = s.key as keyof TelemetryPoint;
    const currentVal = Number(activePoint[valKey] || 0);
    const baseline = s.baseline;
    const delta = currentVal - baseline;
    const pctDelta = Number(((delta / (baseline || 1)) * 100).toFixed(1));
    const isWarning = Math.abs(pctDelta) > 8 && Math.abs(pctDelta) <= 20;
    const isCritical = Math.abs(pctDelta) > 20;

    return {
      key: s.key,
      name: s.name,
      unit: s.unit,
      baseline,
      current: currentVal,
      delta: Number(delta.toFixed(2)),
      pctDelta,
      isWarning,
      isCritical,
    };
  });

  const fetchAnomalyDiagnosis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/anomaly/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetName: asset.name,
          assetType: asset.type,
          category: asset.category,
          currentCycle,
          maxLife: asset.maxLife,
          timeUnit: asset.timeUnit,
          healthIndexMse: activePoint.health_index_mse,
          threshold3Sigma: asset.threshold3Sigma,
          rulPred: activePoint.RUL_pred,
          sensors: sensorMetrics,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI anomaly diagnosis');
      }

      const data: AnomalyData = await response.json();
      setAnomalyData(data);
    } catch {
      // Local fallback calculation if fetch fails
      const criticalCount = sensorMetrics.filter((s) => s.isCritical).length;
      const warningCount = sensorMetrics.filter((s) => s.isWarning).length;
      const mseRatio = activePoint.health_index_mse / asset.threshold3Sigma;

      const hasAnomaly = activePoint.health_index_mse > asset.threshold3Sigma || criticalCount > 0 || warningCount > 0;
      const severity: 'NOMINAL' | 'DRIFT' | 'WARNING' | 'CRITICAL' =
        criticalCount > 0 || mseRatio >= 2.0
          ? 'CRITICAL'
          : warningCount > 0 || mseRatio > 1.0
          ? 'WARNING'
          : mseRatio > 0.8
          ? 'DRIFT'
          : 'NOMINAL';

      setAnomalyData({
        hasAnomaly,
        severity,
        headline:
          severity === 'CRITICAL'
            ? 'Critical Sensor Anomaly Breach Detected'
            : severity === 'WARNING'
            ? 'Early Sensor Degradation Drift Observed'
            : severity === 'DRIFT'
            ? 'Subtle Multi-Channel Boundary Drift'
            : 'All Sensor Channels Calibrated & Nominal',
        summary:
          severity === 'NOMINAL'
            ? `All telemetry channels for ${asset.name} are tracking along expected baseline bounds with safe statistical variance.`
            : `Autoencoder anomaly MSE (${activePoint.health_index_mse.toFixed(4)}) is ${mseRatio.toFixed(2)}x the 3-sigma baseline. ${
                criticalCount > 0
                  ? `${criticalCount} channel(s) in critical limit breach.`
                  : `${warningCount} channel(s) exhibiting accelerated drift.`
              }`,
        anomalousSensors: sensorMetrics
          .filter((s) => Math.abs(s.pctDelta) > 8)
          .map((s) => ({
            name: s.name,
            reading: `${s.current} ${s.unit}`,
            deviation: `${s.delta > 0 ? '+' : ''}${s.delta} (${s.pctDelta}%)`,
            concern: s.isCritical ? 'Critical Envelope Breach' : 'Statistical Drift',
          })),
        physicalRootCause:
          severity === 'CRITICAL'
            ? `Sub-surface physical degradation and hot section thermal barrier breakdown on ${asset.name}.`
            : severity === 'WARNING'
            ? `Incipient component wear causing aerodynamic and frictional impedance drift.`
            : 'Nominal operational wear within calibrated design envelopes.',
        recommendedAction:
          severity === 'CRITICAL'
            ? `Schedule urgent overhaul within ${Math.min(15, Math.round(activePoint.RUL_pred))} ${asset.timeUnit} to prevent secondary catastrophic failure.`
            : severity === 'WARNING'
            ? `Flag telemetry for engineering review and prepare replacement staging.`
            : `Standard operational routine. No intervention required.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-run diagnosis on asset change or milestone cycle change (every 10 cycles)
  useEffect(() => {
    fetchAnomalyDiagnosis();
  }, [asset.id, Math.floor(currentCycle / 10)]);

  const mseRatio = activePoint.health_index_mse / asset.threshold3Sigma;
  const severity = anomalyData?.severity || (mseRatio > 1.8 ? 'CRITICAL' : mseRatio > 1.0 ? 'WARNING' : 'NOMINAL');

  // Severity-dependent styling with lighter professional gradients
  const config = {
    NOMINAL: {
      borderColor: 'border-emerald-500/40',
      bgGlow: 'bg-gradient-to-r from-emerald-950/35 via-[#1b2538]/90 to-[#151f30]/90',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      label: 'AI Sensor Anomaly: NOMINAL',
      accentColor: '#10b981',
    },
    DRIFT: {
      borderColor: 'border-blue-500/40',
      bgGlow: 'bg-gradient-to-r from-blue-950/35 via-[#1b2538]/90 to-[#151f30]/90',
      badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      icon: Activity,
      iconColor: 'text-blue-400',
      label: 'AI Sensor Monitor: EARLY DRIFT',
      accentColor: '#38bdf8',
    },
    WARNING: {
      borderColor: 'border-amber-500/45',
      bgGlow: 'bg-gradient-to-r from-amber-950/35 via-[#1b2538]/90 to-[#151f30]/90',
      badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      label: 'AI Anomaly Detected: SENSOR DRIFT',
      accentColor: '#f59e0b',
    },
    CRITICAL: {
      borderColor: 'border-rose-500/55',
      bgGlow: 'bg-gradient-to-r from-rose-950/40 via-[#1b2538]/90 to-[#151f30]/90',
      badgeBg: 'bg-rose-500/25 text-rose-200 border-rose-500/60',
      icon: AlertOctagon,
      iconColor: 'text-rose-400',
      label: 'AI Critical Alert: ANOMALY BREACH',
      accentColor: '#f43f5e',
    },
  }[severity];

  const IconComponent = config.icon;

  return (
    <div
      className={`relative rounded-xl border ${config.borderColor} ${config.bgGlow} p-4 sm:p-5 mb-6 transition-all duration-300 shadow-md backdrop-blur-sm overflow-hidden`}
    >
      {/* Decorative top pulse strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-colors duration-500"
        style={{
          backgroundColor: config.accentColor,
          opacity: severity === 'NOMINAL' ? 0.6 : 0.9,
          boxShadow: `0 0 12px ${config.accentColor}`,
        }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg border ${config.badgeBg} flex items-center justify-center shrink-0 shadow-inner`}
          >
            <IconComponent className={`w-5 h-5 ${config.iconColor} ${severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.badgeBg} uppercase tracking-wider`}>
                {config.label}
              </span>

              <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                <span>Autoencoder MSE:</span>
                <span className={`font-semibold ${activePoint.health_index_mse > asset.threshold3Sigma ? 'text-amber-400' : 'text-slate-100'}`}>
                  {activePoint.health_index_mse.toFixed(4)}
                </span>
                <span className="text-slate-400 text-[10px]">
                  (3σ: {asset.threshold3Sigma} · {mseRatio.toFixed(2)}x)
                </span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white mt-1 flex items-center gap-1.5">
              <span>{anomalyData?.headline || 'Scanning Multi-Channel Sensor Envelopes...'}</span>
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onToggleFilter}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 shadow-sm ${
              isOnlyAnomaliesFilter
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md'
                : 'bg-[#223048] hover:bg-[#2b3c59] text-slate-200 border-slate-600/60'
            }`}
            title="Filter to show only anomalous channels"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {isOnlyAnomaliesFilter ? 'Showing Anomalies' : 'Filter Anomalous'}
            </span>
            {anomalousChannelCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isOnlyAnomaliesFilter ? 'bg-blue-800 text-blue-100' : 'bg-amber-500/25 text-amber-200 border border-amber-500/50'
              }`}>
                {anomalousChannelCount}
              </span>
            )}
          </button>

          <button
            onClick={fetchAnomalyDiagnosis}
            disabled={isLoading}
            className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2b3c59] border border-slate-600/60 rounded-lg transition-colors disabled:opacity-40 shadow-sm"
            title="Re-run AI Sensor Scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="mt-3.5 space-y-3">
        {/* Natural Language Diagnostic Summary */}
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-[#141d2c]/90 rounded-xl p-3.5 border border-slate-700/60 flex items-start gap-2.5 shadow-inner">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-slate-100">
              {anomalyData?.summary || 'Synthesizing sensor patterns and autoencoder statistical metrics...'}
            </p>

            {/* Quick Action & Cause Tags */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center gap-2 text-xs">
              {anomalyData?.physicalRootCause && (
                <div className="flex items-center gap-1.5 bg-[#1e2a3e] px-2.5 py-1 rounded-md border border-slate-600/50 text-slate-200 shadow-sm">
                  <Layers className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="text-slate-400">Root Cause:</span>
                  <span className="font-medium text-slate-100">{anomalyData.physicalRootCause}</span>
                </div>
              )}

              {anomalyData?.recommendedAction && (
                <div className="flex items-center gap-1.5 bg-[#1e2a3e] px-2.5 py-1 rounded-md border border-slate-600/50 text-slate-200 shadow-sm">
                  <Wrench className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-slate-400">Action:</span>
                  <span className="font-medium text-amber-200">{anomalyData.recommendedAction}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Anomalous Channels List if detected */}
        {anomalyData && anomalyData.anomalousSensors && anomalyData.anomalousSensors.length > 0 && (
          <div className="bg-[#151f30] rounded-xl p-3.5 border border-slate-700/60 shadow-inner">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Detected Channel Anomalies ({anomalyData.anomalousSensors.length})
              </span>
              <span className="text-slate-400 font-normal">
                Deviations &gt; ±8% baseline limit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {anomalyData.anomalousSensors.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-[#1e2a3e] border border-slate-600/50 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="truncate mr-2">
                    <span className="font-medium text-white block truncate">{s.name}</span>
                    <span className="text-[10px] text-slate-300">{s.reading}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-xs font-bold block ${
                        s.concern.includes('Critical') ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {s.deviation}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                      {s.concern}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toggleable Technical Deep Dive Drawer */}
        <div className="pt-1">
          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors font-medium"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>{isDetailsExpanded ? 'Hide Mathematical & AI Details' : 'View AI Autoencoder & Sensor Threshold Details'}</span>
            {isDetailsExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          {isDetailsExpanded && (
            <div className="mt-2 text-xs bg-[#131d2c]/90 p-3.5 rounded-xl border border-slate-700/60 text-slate-200 space-y-2 leading-relaxed shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pb-2 border-b border-slate-700/50">
                <div className="bg-[#1e2a3e] p-2.5 rounded-lg border border-slate-600/50 shadow-sm">
                  <div className="text-[10px] text-slate-400">Reconstruction MSE</div>
                  <div className="font-mono font-bold text-white text-sm">{activePoint.health_index_mse.toFixed(5)}</div>
                </div>
                <div className="bg-[#1e2a3e] p-2.5 rounded-lg border border-slate-600/50 shadow-sm">
                  <div className="text-[10px] text-slate-400">3σ Baseline Threshold</div>
                  <div className="font-mono font-bold text-white text-sm">{asset.threshold3Sigma.toFixed(4)}</div>
                </div>
                <div className="bg-[#1e2a3e] p-2.5 rounded-lg border border-slate-600/50 shadow-sm">
                  <div className="text-[10px] text-slate-400">Threshold Ratio</div>
                  <div className={`font-mono font-bold text-sm ${mseRatio > 1.0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {mseRatio.toFixed(2)}x
                  </div>
                </div>
                <div className="bg-[#1e2a3e] p-2.5 rounded-lg border border-slate-600/50 shadow-sm">
                  <div className="text-[10px] text-slate-400">Degradation Knee Point</div>
                  <div className="font-mono font-bold text-white text-sm">Cycle {asset.kneePoint}</div>
                </div>
              </div>
              <p className="text-slate-300 text-[11px] pt-1">
                <strong className="text-white">How this AI model works:</strong> The deep PyTorch autoencoder is trained exclusively on healthy baseline telemetry (Cycles 1–{asset.kneePoint}). When component degradation sets in, cross-sensor correlations fracture, causing the reconstruction error (MSE) to diverge beyond the statistical 3-sigma envelope ({asset.threshold3Sigma}).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
