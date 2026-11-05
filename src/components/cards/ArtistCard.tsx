import React from 'react';
import { BadgeCheck, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../../types/music';
import { ArtworkImage } from '../common/ArtworkImage';
import { SpotlightTiltCard } from '../common/SpotlightTiltCard';
import { EqualizerIndicator } from '../common/EqualizerIndicator';
import { useAudioStore } from '../../stores/useAudioStore';
import { musicRepository } from '../../data/repository/MockMusicRepository';
import { cn } from '../../utils/cn';

interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, className }) => {
  const navigate = useNavigate();
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const playTrack = useAudioStore((s) => s.playTrack);

  const isCurrentArtist = currentTrack?.artistId === artist.id;
  const isArtistPlaying = isCurrentArtist && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentArtist) {
      togglePlayPause();
    } else {
      musicRepository.getArtistById(artist.id).then((res) => {
        if (res && res.topTracks.length > 0) {
          playTrack(res.topTracks[0], res.topTracks);
        } else {
          navigate(`/artist/${artist.id}`);
        }
      });
    }
  };

  return (
    <SpotlightTiltCard
      onClick={() => navigate(`/artist/${artist.id}`)}
      className={cn('p-3.5 flex flex-col', className)}
    >
      <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-full shadow-elevation-1">
        <ArtworkImage src={artist.avatarUrl} alt={artist.name} rounded="full" />

        {/* 21st.dev Floating Play / Morphing Equalizer Trigger */}
        <button
          onClick={handlePlayClick}
          aria-label={isArtistPlaying ? `Pause ${artist.name}` : `Play ${artist.name}`}
          className={cn(
            'absolute bottom-2 right-2 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-glow-emerald',
            isArtistPlaying
              ? 'opacity-100 translate-y-0 bg-emerald text-canvas'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 bg-emerald text-canvas hover:scale-110 active:scale-95'
          )}
        >
          {isArtistPlaying ? (
            <EqualizerIndicator isPlaying={true} />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4
            className="text-sm font-semibold truncate font-display text-content-primary group-hover:text-white"
            title={artist.name}
          >
            {artist.name}
          </h4>
          {artist.verified && <BadgeCheck className="w-3.5 h-3.5 text-emerald shrink-0 fill-emerald/20" />}
        </div>
        <p className="text-xs text-content-secondary capitalize">
          Artist
        </p>
      </div>
    </SpotlightTiltCard>
  );
};
