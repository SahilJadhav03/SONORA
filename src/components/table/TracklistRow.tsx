import React from 'react';
import { Play, Pause, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { Track } from '../../types/music';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useUIStore } from '../../stores/useUIStore';
import { useContextMenuStore } from '../../stores/useContextMenuStore';
import { EqualizerIndicator } from '../common/EqualizerIndicator';
import { formatTime } from '../../utils/formatters';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

interface TracklistRowProps {
  track: Track;
  index: number;
  contextTracks: Track[];
}

const TracklistRowComponent: React.FC<TracklistRowProps> = ({
  track,
  index,
  contextTracks,
}) => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const addToQueue = useAudioStore((s) => s.addToQueue);

  const isLiked = useLibraryStore((s) => s.isLiked(track.id));
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const openContextMenu = useContextMenuStore((s) => s.openContextMenu);
  const addToast = useUIStore((s) => s.addToast);

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track, contextTracks);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeTrack(track.id);
  };

  return (
    <div
      onClick={handleRowClick}
      onContextMenu={(e) => {
        e.preventDefault();
        openContextMenu(e.clientX, e.clientY, track);
      }}
      className={cn(
        'group flex items-center px-4 py-2.5 rounded-lg hover:bg-white/[0.06] transition-all duration-150 cursor-pointer select-none text-sm text-content-secondary hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
        isCurrent && 'bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
      )}
    >
      {/* Col 1: Index / Play Button / Equalizer */}
      <div className="w-8 shrink-0 flex items-center justify-start">
        {isCurrent ? (
          <div className="w-5 flex items-center justify-center">
            {isCurrentPlaying ? (
              <span className="group-hover:hidden">
                <EqualizerIndicator isPlaying={true} />
              </span>
            ) : (
              <span className="text-emerald text-xs font-semibold tabular-nums group-hover:hidden">
                {index + 1}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="hidden group-hover:flex text-white hover:scale-110 transition-transform"
            >
              {isCurrentPlaying ? (
                <Pause className="w-4 h-4 fill-current text-white" />
              ) : (
                <Play className="w-4 h-4 fill-current text-white" />
              )}
            </button>
          </div>
        ) : (
          <>
            <span className="group-hover:hidden text-content-tertiary font-mono tabular-nums text-xs w-4 text-center">
              {index + 1}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(track, contextTracks);
              }}
              className="hidden group-hover:flex text-white hover:scale-110 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Col 2: Thumbnail & Title + Artist */}
      <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
        <img
          src={track.coverUrl}
          alt={track.title}
          onError={handleImageError}
          className="w-10 h-10 rounded object-cover shrink-0 shadow-sm"
          loading="lazy"
        />
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-medium truncate transition-colors text-sm',
                isCurrent ? 'text-emerald font-semibold' : 'text-content-primary group-hover:text-white'
              )}
            >
              {track.title}
            </span>
            {track.explicit && (
              <span className="px-1 py-0.2 rounded-xs bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider shrink-0">
                E
              </span>
            )}
            {track.sourceBadge && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border',
                  track.source === 'audius'
                    ? 'bg-emerald/15 text-emerald border-emerald/30'
                    : track.source === 'itunes'
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : track.source === 'local'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-white/10 text-content-secondary border-white/10'
                )}
              >
                {track.sourceBadge}
              </span>
            )}
          </div>
          <span className="text-xs text-content-secondary truncate group-hover:text-content-primary/80">
            {track.artistName}
          </span>
        </div>
      </div>

      {/* Col 3: Album (Hidden on small mobile) */}
      <div className="w-1/3 hidden md:block min-w-0 pr-4">
        <span className="text-xs text-content-secondary truncate hover:text-white hover:underline transition-colors block">
          {track.albumTitle}
        </span>
      </div>

      {/* Col 4: Heart & Duration & Actions */}
      <div className="flex items-center justify-end gap-3 shrink-0">
        <button
          onClick={handleHeartClick}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
          className={cn(
            'p-1 text-content-tertiary hover:text-emerald transition-colors',
            isLiked ? 'text-emerald opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart className={cn('w-4 h-4', isLiked && 'fill-current text-emerald')} />
        </button>

        <span className="text-xs font-mono tabular-nums text-content-tertiary w-10 text-right">
          {formatTime(track.duration)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            openContextMenu(e.clientX, e.clientY, track);
          }}
          aria-label="More options"
          title="More options"
          className="p-1 text-content-tertiary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const TracklistRow = React.memo(TracklistRowComponent);
