import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Album } from '../../types/music';
import { ArtworkImage } from '../common/ArtworkImage';
import { SpotlightTiltCard } from '../common/SpotlightTiltCard';
import { EqualizerIndicator } from '../common/EqualizerIndicator';
import { useAudioStore } from '../../stores/useAudioStore';
import { musicRepository } from '../../data/repository/MockMusicRepository';
import { cn } from '../../utils/cn';

interface AlbumCardProps {
  album: Album;
  className?: string;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album, className }) => {
  const navigate = useNavigate();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const playTrack = useAudioStore((s) => s.playTrack);

  const isCurrentAlbum = currentTrack?.albumId === album.id;
  const isAlbumPlaying = isCurrentAlbum && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentAlbum) {
      togglePlayPause();
    } else {
      musicRepository.getAlbumById(album.id).then((res) => {
        if (res && res.tracks.length > 0) {
          playTrack(res.tracks[0], res.tracks);
        } else {
          navigate(`/album/${album.id}`);
        }
      });
    }
  };

  return (
    <SpotlightTiltCard
      onClick={() => navigate(`/album/${album.id}`)}
      className={cn('p-3.5 flex flex-col', className)}
    >
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg shadow-elevation-1">
        <ArtworkImage src={album.coverUrl} alt={album.title} rounded="md" />

        {/* 21st.dev Floating Play / Morphing Equalizer Trigger */}
        <button
          onClick={handlePlayClick}
          aria-label={isAlbumPlaying ? `Pause ${album.title}` : `Play ${album.title}`}
          className={cn(
            'absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-glow-emerald',
            isAlbumPlaying
              ? 'opacity-100 translate-y-0 bg-emerald text-canvas'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 bg-emerald text-canvas hover:scale-110 active:scale-95'
          )}
        >
          {isAlbumPlaying ? (
            <EqualizerIndicator isPlaying={true} />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <h4
          className="text-sm font-semibold truncate font-display mb-1 text-content-primary group-hover:text-white"
          title={album.title}
        >
          {album.title}
        </h4>
        <p className="text-xs text-content-secondary truncate">
          <span className="tabular-nums">{album.releaseYear}</span> • {album.artistName}
        </p>
      </div>
    </SpotlightTiltCard>
  );
};
