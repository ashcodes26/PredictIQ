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
    <div className="bg-[#111722] border border-[#1e2638] rounded-xl px-5 py-3.5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Playback & Step Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
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
            className="p-1.5 text-slate-400 hover:text-white bg-[#151d2c] border border-[#232d3f] rounded-lg disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onCycleChange(Math.min(asset.maxLife, currentCycle + 1))}
            disabled={currentCycle >= asset.maxLife}
            title="Step Forward"
            className="p-1.5 text-slate-400 hover:text-white bg-[#151d2c] border border-[#232d3f] rounded-lg disabled:opacity-30"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onCycleChange(1)}
            title="Reset to Start"
            className="p-1.5 text-slate-400 hover:text-white bg-[#151d2c] border border-[#232d3f] rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Speed Toggle */}
          <div className="flex items-center gap-1 bg-[#151d2c] p-0.5 rounded-lg border border-[#232d3f] ml-1">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                  speed === s ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider with Life Markers */}
        <div className="flex-1 max-w-xl flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Start</span>
            <span className="text-blue-400">Degradation Onset: {asset.kneePoint} {asset.timeUnit}</span>
            <span>Total: {asset.maxLife} {asset.timeUnit}</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="range"
              min={1}
              max={asset.maxLife}
              value={currentCycle}
              onChange={(e) => onCycleChange(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1e2638] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          <span className="text-[11px] text-slate-500 mr-1">Presets:</span>
          <button
            onClick={() => onCycleChange(15)}
            className="px-2.5 py-1 bg-[#151d2c] hover:bg-[#1b2538] border border-[#232d3f] rounded text-slate-300 text-xs"
          >
            Healthy
          </button>
          <button
            onClick={() => onCycleChange(asset.kneePoint + 5)}
            className="px-2.5 py-1 bg-[#151d2c] hover:bg-[#1b2538] border border-[#232d3f] rounded text-blue-300 text-xs"
          >
            Knee-Point
          </button>
          <button
            onClick={() => onCycleChange(asset.maxLife - 25)}
            className="px-2.5 py-1 bg-[#151d2c] hover:bg-[#1b2538] border border-[#232d3f] rounded text-amber-300 text-xs"
          >
            Service
          </button>
          <button
            onClick={() => onCycleChange(asset.maxLife - 3)}
            className="px-2.5 py-1 bg-[#151d2c] hover:bg-[#1b2538] border border-[#232d3f] rounded text-rose-300 text-xs"
          >
            Failure
          </button>
        </div>
      </div>
    </div>
  );
};
