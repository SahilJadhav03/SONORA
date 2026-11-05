import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Track } from '../../types/music';
import { useAudioStore } from '../../stores/useAudioStore';
import { EqualizerIndicator } from '../common/EqualizerIndicator';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

interface QuickReplayTileProps {
  track: Track;
  contextTracks?: Track[];
  className?: string;
}

export const QuickReplayTile: React.FC<QuickReplayTileProps> = ({
  track,
  contextTracks,
  className,
}) => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, contextTracks);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onClick={() => playTrack(track, contextTracks)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative flex items-center rounded-xl bg-surface-2/60 hover:bg-surface-3/85 transition-all duration-300 overflow-hidden cursor-pointer border border-white/[0.06] hover:border-white/[0.12] pr-4 h-16 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] hover:shadow-elevation-2',
        isCurrent && 'bg-surface-3 border-emerald/40 shadow-glow-emerald/10',
        className
      )}
    >
      {/* 21st.dev Radial Spotlight Sheen */}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
          style={{
            background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.08), transparent 70%)`,
          }}
        />
      )}

      <img
        src={track.coverUrl}
        alt={track.title}
        onError={handleImageError}
        className="w-16 h-16 object-cover shrink-0 rounded-l-xl z-20"
        loading="lazy"
      />
      <div className="flex-1 px-3.5 min-w-0 z-20">
        <p
          className={cn(
            'text-sm font-semibold truncate transition-colors font-display',
            isCurrent ? 'text-emerald' : 'text-content-primary group-hover:text-white'
          )}
        >
          {track.title}
        </p>
        <p className="text-xs text-content-secondary truncate">{track.artistName}</p>
      </div>

      <button
        onClick={handlePlay}
        aria-label={isCurrentPlaying ? 'Pause' : 'Play'}
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shadow-glow-emerald transition-all duration-300 shrink-0 z-20 backdrop-blur-md',
          'hover:scale-105 active:scale-95',
          isCurrentPlaying
            ? 'opacity-100 scale-100 bg-emerald text-canvas'
            : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 bg-emerald text-canvas'
        )}
      >
        {isCurrentPlaying ? (
          <EqualizerIndicator isPlaying={true} />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
};
