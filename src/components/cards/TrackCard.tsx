import React from 'react';
import { Play, Pause } from 'lucide-react';
import { Track } from '../../types/music';
import { useAudioStore } from '../../stores/useAudioStore';
import { ArtworkImage } from '../common/ArtworkImage';
import { cn } from '../../utils/cn';

interface TrackCardProps {
  track: Track;
  contextTracks?: Track[];
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  contextTracks,
  className,
}) => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, contextTracks);
    }
  };

  return (
    <div
      onClick={() => playTrack(track, contextTracks)}
      className={cn(
        'group relative p-3.5 rounded-lg bg-surface-1/70 hover:bg-surface-2 transition-all duration-300 border border-white/[0.04] hover:border-white/[0.08] cursor-pointer flex flex-col',
        isCurrent && 'bg-surface-2 border-emerald/20',
        className
      )}
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md shadow-elevation-1">
        <ArtworkImage src={track.coverUrl} alt={track.title} rounded="md" />

        {/* Ambient Glow on Card Hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: track.accentColor || '#00F59B' }}
        />

        {/* Source Badge Pill */}
        {track.sourceBadge && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider backdrop-blur-md border shadow-sm',
                track.source === 'audius'
                  ? 'bg-emerald/90 text-canvas border-emerald font-extrabold'
                  : track.source === 'itunes'
                  ? 'bg-sky-500/90 text-white border-sky-400 font-extrabold'
                  : track.source === 'local'
                  ? 'bg-amber-500/90 text-canvas border-amber-400 font-extrabold'
                  : 'bg-black/60 text-white border-white/20'
              )}
            >
              {track.sourceBadge}
            </span>
          </div>
        )}

        {/* Floating Play Action FAB */}
        <button
          onClick={handlePlayClick}
          aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          className={cn(
            'absolute bottom-2 right-2 w-11 h-11 rounded-full bg-emerald text-canvas flex items-center justify-center shadow-glow-emerald transition-all duration-300',
            'hover:scale-105 active:scale-95 hover:bg-emerald-hover',
            isCurrentPlaying
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          )}
        >
          {isCurrentPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h4
          className={cn(
            'text-sm font-semibold truncate font-display mb-1 transition-colors',
            isCurrent ? 'text-emerald' : 'text-content-primary group-hover:text-white'
          )}
          title={track.title}
        >
          {track.title}
        </h4>
        <p className="text-xs text-content-secondary truncate" title={track.artistName}>
          {track.artistName}
        </p>
      </div>
    </div>
  );
};
