import React, { useRef } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { cn } from '../../utils/cn';

export const VolumeControl: React.FC<{ className?: string }> = ({ className }) => {
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const setVolume = useAudioStore((s) => s.setVolume);
  const toggleMute = useAudioStore((s) => s.toggleMute);

  const sliderRef = useRef<HTMLDivElement>(null);
  const effectiveVolume = isMuted ? 0 : volume;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    if (isMuted && ratio > 0) toggleMute();
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        className="text-content-secondary hover:text-white transition-colors p-1"
      >
        {effectiveVolume === 0 ? (
          <VolumeX className="w-4 h-4 text-content-muted" />
        ) : effectiveVolume < 0.5 ? (
          <Volume1 className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      <div
        ref={sliderRef}
        onPointerDown={handlePointerDown}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            setVolume(Math.min(1, volume + 0.05));
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            setVolume(Math.max(0, volume - 0.05));
          }
        }}
        tabIndex={0}
        className="group relative w-20 sm:w-24 h-4 flex items-center cursor-pointer select-none rounded-full focus-visible:ring-1 focus-visible:ring-emerald"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(effectiveVolume * 100)}
        aria-label="Volume slider"
      >
        <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden transition-all duration-200 group-hover:h-1.5">
          <div
            style={{ width: `${effectiveVolume * 100}%` }}
            className="h-full bg-white group-hover:bg-emerald transition-colors rounded-full"
          />
        </div>
        <div
          style={{ left: `${effectiveVolume * 100}%` }}
          className="absolute -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none"
        />
      </div>
    </div>
  );
};
