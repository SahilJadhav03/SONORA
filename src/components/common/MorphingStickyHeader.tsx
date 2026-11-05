import React, { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MorphingStickyHeaderProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  isPlaying: boolean;
  onPlayToggle: () => void;
  scrollThreshold?: number;
  scrollContainerId?: string;
  className?: string;
}

export const MorphingStickyHeader: React.FC<MorphingStickyHeaderProps> = ({
  title,
  subtitle,
  imageUrl,
  isPlaying,
  onPlayToggle,
  scrollThreshold = 260,
  scrollContainerId = 'main-view',
  className,
}) => {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    const container = document.getElementById(scrollContainerId);
    if (!container) return;

    let ticking = false;
    let rafId: number | null = null;

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          const past = container.scrollTop > scrollThreshold;
          setIsScrolledPast(past);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case view is restored with scroll
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollContainerId, scrollThreshold]);

  return (
    <div
      className={cn(
        'sticky top-0 z-30 w-full px-6 py-3 flex items-center justify-between transition-all duration-300 ease-out border-b backdrop-blur-2xl shadow-elevation-2',
        isScrolledPast
          ? 'translate-y-0 opacity-100 bg-surface-0/88 border-white/[0.08]'
          : '-translate-y-full opacity-0 pointer-events-none border-transparent',
        className
      )}
    >
      {/* Left: Compact artwork thumbnail & title */}
      <div className="flex items-center gap-3.5 min-w-0">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={title}
            className="w-10 h-10 rounded-md object-cover shadow-elevation-1 border border-white/10 shrink-0"
          />
        )}
        <div className="min-w-0 flex flex-col justify-center">
          <h3 className="text-base font-bold text-white font-display truncate" title={title}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-content-secondary truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Instant Play / Pause Action Button */}
      <button
        onClick={onPlayToggle}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-10 h-10 rounded-full bg-emerald text-canvas flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-emerald shrink-0 ml-3"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current text-canvas" />
        ) : (
          <Play className="w-5 h-5 fill-current text-canvas ml-0.5" />
        )}
      </button>
    </div>
  );
};
