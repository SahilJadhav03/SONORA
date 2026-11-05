import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useUIStore } from '../../stores/useUIStore';
import { getTrackLyrics } from '../../data/mockData';
import { LyricLine } from '../../types/music';
import { cn } from '../../utils/cn';

interface TimeSyncedLyricsProps {
  variant?: 'compact' | 'theatre';
  className?: string;
  showSingModeToggle?: boolean;
}

export const TimeSyncedLyrics: React.FC<TimeSyncedLyricsProps> = ({
  variant = 'compact',
  className,
  showSingModeToggle = true,
}) => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const currentTime = useAudioStore((s) => s.currentTime);
  const seekTo = useAudioStore((s) => s.seekTo);
  const isSingMode = useAudioStore((s) => s.isSingMode);
  const toggleSingMode = useAudioStore((s) => s.toggleSingMode);
  const addToast = useUIStore((s) => s.addToast);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [rippleIndex, setRippleIndex] = useState<number | null>(null);

  // Normalize lyrics with fallback auto-pacing
  const lyrics: LyricLine[] = currentTrack ? getTrackLyrics(currentTrack) : [];

  // Find active line index based on current playback timestamp
  const activeIndex = lyrics.findIndex(
    (line, i, arr) =>
      currentTime >= line.time &&
      (!arr[i + 1] || currentTime < arr[i + 1].time)
  );

  // Auto-scroll to center active line with smooth spring curve
  useEffect(() => {
    if (isUserScrolling || isHovered) return;

    if (activeIndex >= 0 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeIndex, isUserScrolling, isHovered]);

  // Handle manual user scroll: pause auto-scroll for 3.5s then resume smoothly
  const handleScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsUserScrolling(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleLineClick = (lineTime: number, index: number) => {
    seekTo(lineTime);
    setRippleIndex(index);
    setTimeout(() => setRippleIndex(null), 600);
  };

  const handleToggleSingMode = () => {
    toggleSingMode();
    const nextState = !isSingMode;
    addToast({
      type: 'success',
      message: nextState
        ? 'Sing Mode ON: Vocal attenuation filter activated'
        : 'Sing Mode OFF: Standard master output restored',
    });
  };

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-content-muted">
        <p className="text-sm">Play a track to experience time-synced lyrics.</p>
      </div>
    );
  }

  const isTheatre = variant === 'theatre';

  return (
    <div
      className={cn(
        'group/lyrics relative w-full flex flex-col select-none overflow-hidden h-full',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Bar with Sing Mode & Auto-Scroll Status */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
            Time-Synced Lyrics
          </span>
          {isUserScrolling && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-content-muted animate-pulse">
              Scroll Paused
            </span>
          )}
        </div>

        {/* Apple Music Sing Mode Toggle */}
        {showSingModeToggle && (
          <button
            onClick={handleToggleSingMode}
            aria-label="Toggle Apple Music Sing Mode"
            title={
              isSingMode
                ? 'Sing Mode Active (Vocals Attenuated)'
                : 'Turn on Sing Mode (Vocal Attenuation)'
            }
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 border',
              isSingMode
                ? 'bg-gradient-to-r from-violet-600 to-emerald text-white border-transparent shadow-glow-emerald scale-105'
                : 'bg-surface-2/80 text-content-secondary border-white/10 hover:text-white hover:border-white/20'
            )}
          >
            {isSingMode ? (
              <>
                <Mic className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Sing Mode: ON</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 opacity-70" />
                <span>Sing Mode</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Depth-of-Field Blur Lyric Stream */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          'flex-1 overflow-y-auto sonora-scrollbar space-y-6 py-12 px-2 scroll-smooth',
          isTheatre ? 'text-center max-w-3xl mx-auto py-20 space-y-8' : 'text-left'
        )}
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const distance = Math.abs(idx - activeIndex);
          const isRipple = rippleIndex === idx;

          // Depth-of-Field blur and opacity hierarchy
          let depthClass = '';
          if (isActive) {
            depthClass =
              'scale-105 text-white font-bold opacity-100 blur-none text-glow-lyrics';
          } else if (distance === 1) {
            depthClass =
              'opacity-70 blur-[0.6px] text-content-primary hover:opacity-100 hover:blur-none';
          } else if (distance === 2) {
            depthClass =
              'opacity-40 blur-[2px] text-content-secondary hover:opacity-90 hover:blur-none';
          } else {
            depthClass =
              'opacity-25 blur-[3.5px] text-content-muted hover:opacity-80 hover:blur-none';
          }

          return (
            <div
              key={`${line.time}-${idx}`}
              onClick={() => handleLineClick(line.time, idx)}
              className={cn(
                'relative cursor-pointer transition-all duration-300 ease-out origin-left px-3 py-1.5 rounded-xl',
                isTheatre ? 'origin-center' : '',
                // When container is hovered, instantly reduce blur for effortless browsing
                'group-hover/lyrics:blur-none group-hover/lyrics:opacity-75',
                depthClass,
                isRipple ? 'animate-lyric-ripple ring-1 ring-emerald' : ''
              )}
            >
              <p
                className={cn(
                  'font-display leading-relaxed tracking-tight select-none',
                  isTheatre
                    ? 'text-2xl sm:text-3xl md:text-4xl'
                    : 'text-base sm:text-lg font-semibold'
                )}
              >
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
