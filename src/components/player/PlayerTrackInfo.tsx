import React from 'react';
import { Heart, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useUIStore } from '../../stores/useUIStore';
import { MagneticButton } from '../common/MagneticButton';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

export const PlayerTrackInfo: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const isLiked = currentTrack ? useLibraryStore((s) => s.isLiked(currentTrack.id)) : false;
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);

  if (!currentTrack) {
    return (
      <div className={cn('flex items-center gap-3 w-1/4 min-w-[180px]', className)}>
        <div className="w-14 h-14 rounded-md bg-surface-3/50 animate-pulse" />
        <div className="space-y-1">
          <div className="w-24 h-4 bg-surface-3/50 rounded" />
          <div className="w-16 h-3 bg-surface-3/30 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3 min-w-0', className)}>
      {/* Track Cover with Beat-Reactive Bass Halo & hover expand */}
      <div className="relative shrink-0">
        <div
          className="absolute -inset-1 rounded-md filter blur-md pointer-events-none transition-all duration-75"
          style={{
            backgroundColor: currentTrack.accentColor || '#00F59B',
            transform: 'scale(calc(1 + var(--sonora-bass, 0) * 0.28))',
            opacity: 'calc(0.25 + var(--sonora-bass, 0) * 0.65)',
          }}
        />
        <div
          onClick={() => setTheatreOpen(true)}
          className="group relative w-14 h-14 rounded-md overflow-hidden shadow-elevation-1 cursor-pointer z-10"
          title="Open Immersive Theatre Mode"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Title & Artist */}
      <div className="min-w-0 flex flex-col justify-center">
        <h4
          onClick={() => setTheatreOpen(true)}
          className="text-sm font-semibold truncate text-content-primary hover:text-emerald hover:underline cursor-pointer font-display"
          title={currentTrack.title}
        >
          {currentTrack.title}
        </h4>
        <div className="flex items-center gap-1.5 min-w-0">
          <p
            onClick={() => navigate(`/artist/${currentTrack.artistId}`)}
            className="text-xs text-content-secondary truncate hover:text-white hover:underline cursor-pointer"
            title={currentTrack.artistName}
          >
            {currentTrack.artistName}
          </p>
          {currentTrack.sourceBadge && (
            <span
              className={cn(
                'px-1 py-0.2 rounded text-[8px] font-mono font-bold tracking-wider shrink-0 border',
                currentTrack.source === 'audius'
                  ? 'bg-emerald/15 text-emerald border-emerald/30'
                  : currentTrack.source === 'itunes'
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : currentTrack.source === 'local'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-white/10 text-content-secondary border-white/10'
              )}
            >
              {currentTrack.sourceBadge}
            </span>
          )}
        </div>
      </div>

      {/* Magnetic Favorite Heart Button */}
      <MagneticButton
        pullDistance={3}
        onClick={() => toggleLikeTrack(currentTrack.id)}
        aria-label={isLiked ? 'Unlike track' : 'Like track'}
        className={cn(
          'p-1.5 transition-colors shrink-0 ml-1 rounded-full',
          isLiked ? 'text-emerald' : 'text-content-tertiary hover:text-white'
        )}
      >
        <Heart className={cn('w-4 h-4', isLiked && 'fill-current text-emerald')} />
      </MagneticButton>
    </div>
  );
};
