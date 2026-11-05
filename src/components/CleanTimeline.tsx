import React, { useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { MachineAsset } from '../types/telemetry';

interface CleanTimelineProps {
  asset: MachineAsset;
  currentCycle: number;
  onCycleChange: (cycle: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const CleanTimeline: React.FC<CleanTimelineProps> = ({
  asset,
  currentCycle,
  onCycleChange,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
}) => {
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onCycleChange(Math.min(asset.maxLife, currentCycle + speed));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, currentCycle, asset.maxLife, speed, onCycleChange]);

  useEffect(() => {
    if (currentCycle >= asset.maxLife && isPlaying) {
      onTogglePlay();
    }
  }, [currentCycle, asset.maxLife, isPlaying, onTogglePlay]);

  return (
    <div className="bg-gradient-to-b from-[#1b2537]/90 to-[#151f30]/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-5 py-3.5 shadow-lg shadow-black/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate</span>
              </>
            )}
          </button>

          <button
            onClick={() => onCycleChange(Math.max(1, currentCycle - 1))}
            disabled={currentCycle <= 1}
            title="Step Back"
            className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2b3d5b] border border-slate-600/60 rounded-lg disabled:opacity-30 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onCycleChange(Math.min(asset.maxLife, currentCycle + 1))}
            disabled={currentCycle >= asset.maxLife}
            title="Step Forward"
            className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2b3d5b] border border-slate-600/60 rounded-lg disabled:opacity-30 transition-colors shadow-sm"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onCycleChange(1)}
            title="Reset to Start"
            className="p-1.5 text-slate-300 hover:text-white bg-[#223048] hover:bg-[#2b3d5b] border border-slate-600/60 rounded-lg transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-[#141d2c] p-0.5 rounded-lg border border-slate-700/60 shadow-inner ml-1">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  speed === s ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider with Life Markers */}
        <div className="flex-1 max-w-xl flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
            <span>Start (1)</span>
            <span className="text-blue-400 font-medium">Degradation Knee: {asset.kneePoint} {asset.timeUnit}</span>
            <span>Max: {asset.maxLife} {asset.timeUnit}</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={1}
              max={asset.maxLife}
              value={currentCycle}
              onChange={(e) => onCycleChange(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-rose-500/30 bg-slate-700/70 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-400 mr-1 font-medium">Presets:</span>
          <button
            onClick={() => onCycleChange(15)}
            className="px-2.5 py-1 bg-[#223048] hover:bg-[#2b3d5b] border border-slate-600/60 rounded-md text-slate-200 hover:text-white text-xs transition-colors shadow-sm"
          >
            Healthy
          </button>
          <button
            onClick={() => onCycleChange(asset.kneePoint + 5)}
            className="px-2.5 py-1 bg-[#223048] hover:bg-[#2b3d5b] border border-blue-500/40 rounded-md text-blue-300 hover:text-blue-100 text-xs transition-colors shadow-sm"
          >
            Knee-Point
          </button>
          <button
            onClick={() => onCycleChange(asset.maxLife - 25)}
            className="px-2.5 py-1 bg-[#223048] hover:bg-[#2b3d5b] border border-amber-500/40 rounded-md text-amber-300 hover:text-amber-100 text-xs transition-colors shadow-sm"
          >
            Service
          </button>
          <button
            onClick={() => onCycleChange(asset.maxLife - 3)}
            className="px-2.5 py-1 bg-[#223048] hover:bg-[#2b3d5b] border border-rose-500/40 rounded-md text-rose-300 hover:text-rose-100 text-xs transition-colors shadow-sm"
          >
            Failure
          </button>
        </div>
      </div>
    </div>
  );
};
