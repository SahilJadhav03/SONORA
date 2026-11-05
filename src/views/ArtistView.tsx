import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BadgeCheck, Play, Pause, UserPlus, Check, Shuffle, Share2, Disc, Music } from 'lucide-react';
import { musicRepository } from '../data/repository/MockMusicRepository';
import { Artist, Track, Album } from '../types/music';
import { TracklistTable } from '../components/table/TracklistTable';
import { AlbumCard } from '../components/cards/AlbumCard';
import { ArtistCard } from '../components/cards/ArtistCard';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useUIStore } from '../stores/useUIStore';
import { formatNumber } from '../utils/formatters';
import { MorphingStickyHeader } from '../components/common/MorphingStickyHeader';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

export const ArtistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artistData, setArtistData] = useState<{
    artist: Artist;
    topTracks: Track[];
    albums: Album[];
    relatedArtists: Artist[];
  } | undefined>();

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);

  const isFollowing = id ? useLibraryStore((s) => s.isFollowing(id)) : false;
  const toggleFollow = useLibraryStore((s) => s.toggleFollowArtist);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (id) {
      musicRepository.getArtistById(id).then(setArtistData);
      // Reset scroll position to top when switching artists
      const mainEl = document.getElementById('main-view');
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [id]);

  if (!artistData) {
    return (
      <div className="p-12 text-center text-content-muted flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading artist experience...</p>
      </div>
    );
  }

  const { artist, topTracks, albums, relatedArtists } = artistData;

  const isArtistActive = Boolean(currentTrack && topTracks.some((t) => t.id === currentTrack.id));
  const isArtistPlaying = Boolean(isArtistActive && isPlaying);

  const handlePlayAll = () => {
    if (isArtistActive) {
      togglePlayPause();
    } else if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks);
    }
  };

  const handleShufflePlay = () => {
    if (topTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * topTracks.length);
      const shuffledTracks = [...topTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffledTracks[0], shuffledTracks);
      toggleShuffle();
      addToast({
        type: 'info',
        message: `Shuffling popular tracks by ${artist.name}`,
      });
    }
  };

  const handleToggleFollow = () => {
    const following = toggleFollow(artist.id);
    addToast({
      type: following ? 'success' : 'info',
      message: following
        ? `Added ${artist.name} to your followed artists`
        : `Removed ${artist.name} from followed artists`,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      type: 'success',
      message: `Artist link copied to clipboard`,
    });
  };

  return (
    <div className="flex flex-col pb-28 md:pb-8 relative">
      {/* Scroll-Linked Contextual Sticky Header */}
      <MorphingStickyHeader
        title={artist.name}
        subtitle={`${formatNumber(artist.monthlyListeners)} monthly listeners`}
        imageUrl={artist.avatarUrl}
        isPlaying={isArtistPlaying}
        onPlayToggle={handlePlayAll}
      />

      {/* 1. Panoramic Hero Banner with Ambient Glow */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden flex items-end p-6 sm:p-8">
        <img
          src={artist.headerBannerUrl}
          alt={artist.name}
          onError={handleImageError}
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/80 via-transparent to-transparent" />

        <div className="relative z-10 flex items-end gap-5">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            onError={handleImageError}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-surface-0 shadow-elevation-3 shrink-0"
          />
          <div className="space-y-2">
            {artist.verified && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald">
                <BadgeCheck className="w-4 h-4 fill-emerald/20" />
                <span>Verified Artist</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-6xl font-extrabold font-display text-white tracking-tight">
              {artist.name}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-content-secondary">
              {formatNumber(artist.monthlyListeners)} monthly listeners • {formatNumber(artist.followersCount || 0)} followers
            </p>
          </div>
        </div>
      </div>

      {/* 2. Action Ribbon */}
      <div className="px-6 sm:px-8 py-4 flex items-center gap-4 border-b border-white/[0.04]">
        <button
          onClick={handlePlayAll}
          aria-label={isArtistPlaying ? 'Pause artist' : 'Play artist'}
          className="w-14 h-14 rounded-full bg-emerald text-canvas flex items-center justify-center shadow-glow-emerald hover:scale-105 active:scale-95 transition-all"
        >
          {isArtistPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={handleShufflePlay}
          aria-label="Shuffle artist tracks"
          title="Shuffle artist tracks"
          className="w-11 h-11 rounded-full bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-white flex items-center justify-center transition-colors border border-white/5"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleFollow}
          aria-label={isFollowing ? 'Unfollow artist' : 'Follow artist'}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95',
            isFollowing
              ? 'border-emerald/40 bg-emerald/10 text-emerald hover:bg-emerald/20'
              : 'border-white/20 hover:border-white text-white'
          )}
        >
          {isFollowing ? (
            <>
              <Check className="w-4 h-4 text-emerald" />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Follow</span>
            </>
          )}
        </button>

        <button
          onClick={handleShare}
          aria-label="Share artist link"
          title="Share artist profile"
          className="p-2.5 rounded-full text-content-tertiary hover:text-white hover:bg-surface-2 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Main Content Columns */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-10">
        {/* Popular Tracks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-white">Popular Releases</h2>
            <span className="text-xs text-content-muted">{topTracks.length} tracks</span>
          </div>
          <TracklistTable tracks={topTracks} showHeader={false} />
        </div>

        {/* Discography Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-display text-white">Discography</h2>
            <span className="text-xs text-content-muted">{albums.length} releases</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>

        {/* SCREEN 5 SPECIFIC: Related Artists ("Fans Also Like") */}
        {relatedArtists && relatedArtists.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display text-white">Fans Also Like</h2>
              <span className="text-xs text-content-muted">Related Artists</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedArtists.map((relArtist) => (
                <ArtistCard key={relArtist.id} artist={relArtist} />
              ))}
            </div>
          </div>
        )}

        {/* Artist Biography & Details */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-display text-white">About</h2>
          <div className="p-6 rounded-2xl bg-surface-1 border border-white/5 space-y-4 max-w-3xl">
            <p className="text-sm text-content-secondary leading-relaxed">{artist.bio}</p>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              {artist.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full bg-surface-2 text-xs font-medium text-emerald/90 border border-emerald/10"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
