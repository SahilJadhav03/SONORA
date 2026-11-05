import React, { useRef, useState, useMemo } from 'react';
import { Activity, Minus } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { formatTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface TimelineScrubberProps {
  className?: string;
  showModeToggle?: boolean;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  className,
  showModeToggle = true,
}) => {
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const seekTo = useAudioStore((s) => s.seekTo);
  const waveformMode = useAudioStore((s) => s.waveformMode);
  const toggleWaveformMode = useAudioStore((s) => s.toggleWaveformMode);
  const currentTrack = useAudioStore((s) => s.currentTrack);

  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const barRef = useRef<HTMLDivElement>(null);

  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Deterministic waveform bar heights based on current track title
  const waveformBars = useMemo(() => {
    const seed = (currentTrack?.title || 'SONORA').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const bars: number[] = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      // Natural music envelope: lower at start and finish, dynamic peaks in middle
      const normalizedPos = i / count;
      const envelope = Math.sin(normalizedPos * Math.PI);
      const pseudoRandom = Math.abs(Math.sin(seed * (i + 1) * 0.35));
      const heightPercent = Math.max(20, Math.min(100, (envelope * 0.7 + pseudoRandom * 0.3) * 100));
      bars.push(heightPercent);
    }
    return bars;
  }, [currentTrack?.title]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * duration);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(ratio * duration);
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  return (
    <div className={cn('flex items-center gap-2 sm:gap-2.5 w-full select-none', className)}>
      {/* Current Timecode */}
      <span className="text-[11px] font-mono text-content-tertiary w-9 text-right shrink-0">
        {formatTime(currentTime)}
      </span>

      {/* Scrubber Bar Container */}
      <div
        ref={barRef}
        onPointerDown={handlePointerDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            seekTo(Math.min(duration, currentTime + 5));
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            seekTo(Math.max(0, currentTime - 5));
          }
        }}
        tabIndex={0}
        className="group relative flex-1 h-6 flex items-center cursor-pointer rounded-full focus-visible:ring-1 focus-visible:ring-emerald"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-label="Playback timeline scrubber"
      >
        {/* Floating Timestamp Preview Pill */}
        {hoverTime !== null && (
          <div
            style={{ left: `${hoverX}px` }}
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-surface-3/95 text-white text-[10px] font-mono shadow-elevation-2 pointer-events-none border border-white/10 z-30"
          >
            {formatTime(hoverTime)}
          </div>
        )}

        {/* MODE 1: SMOOTH MAGNETIC PROGRESS BAR */}
        {waveformMode === 'progress' && (
          <div className="relative w-full h-1 bg-white/15 rounded-full overflow-hidden transition-all duration-200 group-hover:h-1.5">
            <div
              style={{ width: `${percentage}%` }}
              className="h-full bg-white group-hover:bg-emerald transition-colors rounded-full relative"
            />
          </div>
        )}

        {/* MODE 2: HIGH-DENSITY ACOUSTIC WAVEFORM BARS */}
        {waveformMode === 'waveform' && (
          <div className="flex items-center justify-between w-full h-5 gap-[2px]">
            {waveformBars.map((height, idx) => {
              const barPct = (idx / waveformBars.length) * 100;
              const isPlayed = barPct <= percentage;
              return (
                <div
                  key={idx}
                  style={{ height: `${height}%` }}
                  className={cn(
                    'flex-1 rounded-full transition-colors duration-75',
                    isPlayed
                      ? 'bg-emerald shadow-[0_0_6px_rgba(0,245,155,0.4)]'
                      : 'bg-white/15 group-hover:bg-white/25'
                  )}
                />
              );
            })}
          </div>
        )}

        {/* Magnetic Draggable Scrubber Thumb */}
        {waveformMode === 'progress' && (
          <div
            style={{ left: `${percentage}%` }}
            className="absolute -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow-elevation-1 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none"
          />
        )}
      </div>

      {/* Total Duration Timecode */}
      <span className="text-[11px] font-mono text-content-tertiary w-9 shrink-0">
        {formatTime(duration)}
      </span>

      {/* Scrubber Mode Toggle (Smooth vs Waveform) */}
      {showModeToggle && (
        <button
          onClick={toggleWaveformMode}
          title={waveformMode === 'progress' ? 'Switch to Waveform view' : 'Switch to Smooth Bar view'}
          className="p-1 rounded text-content-muted hover:text-white hover:bg-surface-2 transition-colors hidden sm:block"
        >
          {waveformMode === 'progress' ? (
            <Activity className="w-3.5 h-3.5" />
          ) : (
            <Minus className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
};
