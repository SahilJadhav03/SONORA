import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Playlist } from '../../types/music';
import { ArtworkImage } from '../common/ArtworkImage';
import { SpotlightTiltCard } from '../common/SpotlightTiltCard';
import { EqualizerIndicator } from '../common/EqualizerIndicator';
import { useAudioStore } from '../../stores/useAudioStore';
import { musicRepository } from '../../data/repository/MockMusicRepository';
import { cn } from '../../utils/cn';

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, className }) => {
  const navigate = useNavigate();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const playTrack = useAudioStore((s) => s.playTrack);

  const isCurrentPlaylist = currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id);
  const isPlaylistPlaying = isCurrentPlaylist && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentPlaylist) {
      togglePlayPause();
    } else {
      musicRepository.getPlaylistById(playlist.id).then((pl) => {
        if (pl && pl.tracks.length > 0) {
          playTrack(pl.tracks[0], pl.tracks);
        } else {
          navigate(`/playlist/${playlist.id}`);
        }
      });
    }
  };

  return (
    <SpotlightTiltCard
      onClick={() => navigate(`/playlist/${playlist.id}`)}
      className={cn('p-3.5 flex flex-col', className)}
    >
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg shadow-elevation-1">
        <ArtworkImage src={playlist.coverUrl} alt={playlist.title} rounded="md" />

        {/* 21st.dev Floating Play / Morphing Equalizer Trigger */}
        <button
          onClick={handlePlayClick}
          aria-label={isPlaylistPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`}
          className={cn(
            'absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-glow-emerald',
            isPlaylistPlaying
              ? 'opacity-100 translate-y-0 bg-emerald text-canvas'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 bg-emerald text-canvas hover:scale-110 active:scale-95'
          )}
        >
          {isPlaylistPlaying ? (
            <EqualizerIndicator isPlaying={true} />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h4
          className="text-sm font-semibold truncate font-display mb-1 text-content-primary group-hover:text-white"
          title={playlist.title}
        >
          {playlist.title}
        </h4>
        <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed" title={playlist.description}>
          {playlist.description}
        </p>
      </div>
    </SpotlightTiltCard>
  );
};
