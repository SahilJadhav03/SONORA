import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Shuffle, ListPlus, Share2, Disc, Sparkles } from 'lucide-react';
import { musicRepository } from '../data/repository/MockMusicRepository';
import { Album, Track, Artist } from '../types/music';
import { TracklistTable } from '../components/table/TracklistTable';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useUIStore } from '../stores/useUIStore';
import { formatTime } from '../utils/formatters';
import { MorphingStickyHeader } from '../components/common/MorphingStickyHeader';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

export const AlbumView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [albumData, setAlbumData] = useState<{ album: Album; tracks: Track[] } | undefined>();
  const [artist, setArtist] = useState<Artist | undefined>();

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const addToQueue = useAudioStore((s) => s.addToQueue);

  const isSaved = id ? useLibraryStore((s) => s.isAlbumSaved(id)) : false;
  const toggleSaveAlbum = useLibraryStore((s) => s.toggleSaveAlbum);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    if (id) {
      musicRepository.getAlbumById(id).then((data) => {
        setAlbumData(data);
        if (data?.album.artistId) {
          musicRepository.getArtistById(data.album.artistId).then((res) => {
            if (res) setArtist(res.artist);
          });
        }
      });
      // Scroll to top
      const mainEl = document.getElementById('main-view');
      if (mainEl) mainEl.scrollTop = 0;
    }
  }, [id]);

  if (!albumData) {
    return (
      <div className="p-12 text-center text-content-muted flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Loading album experience...</p>
      </div>
    );
  }

  const { album, tracks } = albumData;
  const isAlbumActive = Boolean(currentTrack && tracks.some((t) => t.id === currentTrack.id));
  const isAlbumPlaying = Boolean(isAlbumActive && isPlaying);

  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

  const handlePlayAll = () => {
    if (isAlbumActive) {
      togglePlayPause();
    } else if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    if (tracks.length > 0) {
      const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffledTracks[0], shuffledTracks);
      toggleShuffle();
      addToast({
        type: 'info',
        message: `Shuffling "${album.title}"`,
      });
    }
  };

  const handleToggleSave = () => {
    const saved = toggleSaveAlbum(album.id);
    addToast({
      type: saved ? 'success' : 'info',
      message: saved ? `Saved "${album.title}" to Your Library` : `Removed "${album.title}" from Your Library`,
    });
  };

  const handleAddAllToQueue = () => {
    tracks.forEach((track) => addToQueue(track));
    addToast({
      type: 'success',
      message: `Added ${tracks.length} tracks from "${album.title}" to queue`,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      type: 'success',
      message: `Album link copied to clipboard`,
    });
  };

  return (
    <div className="flex flex-col pb-28 md:pb-8 relative">
      {/* Scroll-Linked Contextual Sticky Header */}
      <MorphingStickyHeader
        title={album.title}
        subtitle={`${album.artistName} • ${album.releaseYear}`}
        imageUrl={album.coverUrl}
        isPlaying={isAlbumPlaying}
        onPlayToggle={handlePlayAll}
      />

      {/* 1. Hero Header with Ambient Album Accent Color Glow */}
      <div
        className="p-6 sm:p-8 flex flex-col sm:flex-row items-end gap-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${album.accentColor || '#8B5CF6'}45 0%, var(--sonora-surface-0) 100%)`,
        }}
      >
        <div className="relative group shrink-0">
          <img
            src={album.coverUrl}
            alt={album.title}
            onError={handleImageError}
            className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-cover shadow-elevation-3 transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-emerald flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Hi-Res Lossless</span>
          </div>
        </div>

        <div className="space-y-2.5 z-10">
          <span className="text-xs font-semibold tracking-wider uppercase text-content-secondary capitalize inline-block px-2.5 py-0.5 rounded-full bg-surface-2/60 border border-white/5">
            {album.type}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
            {album.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-content-secondary pt-1">
            {artist && (
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                onError={handleImageError}
                className="w-6 h-6 rounded-full object-cover shrink-0"
              />
            )}
            <span
              onClick={() => navigate(`/artist/${album.artistId}`)}
              className="font-semibold text-white hover:underline cursor-pointer"
            >
              {album.artistName}
            </span>
            <span>•</span>
            <span>{album.releaseYear}</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
            <span>•</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* 2. Action Ribbon */}
      <div className="px-6 sm:px-8 py-4 flex items-center gap-4 border-b border-white/[0.04]">
        {/* Play All button */}
        <button
          onClick={handlePlayAll}
          aria-label={isAlbumPlaying ? 'Pause album' : 'Play album'}
          className="w-14 h-14 rounded-full bg-emerald text-canvas flex items-center justify-center shadow-glow-emerald hover:scale-105 active:scale-95 transition-all"
        >
          {isAlbumPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>

        {/* Shuffle Play */}
        <button
          onClick={handleShufflePlay}
          aria-label="Shuffle album"
          title="Shuffle album"
          className="w-11 h-11 rounded-full bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-white flex items-center justify-center transition-colors border border-white/5"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        {/* Save to Library Toggle */}
        <button
          onClick={handleToggleSave}
          aria-label={isSaved ? 'Remove album from library' : 'Save album to library'}
          title={isSaved ? 'Remove from library' : 'Save to library'}
          className={cn(
            'p-2.5 rounded-full transition-all hover:scale-110 active:scale-95',
            isSaved ? 'text-emerald' : 'text-content-secondary hover:text-white'
          )}
        >
          <Heart className={cn('w-7 h-7', isSaved && 'fill-current text-emerald')} />
        </button>

        {/* Add All Tracks to Queue */}
        <button
          onClick={handleAddAllToQueue}
          aria-label="Add all to queue"
          title="Add all to queue"
          className="p-2.5 rounded-full text-content-secondary hover:text-white hover:bg-surface-2 transition-colors"
        >
          <ListPlus className="w-6 h-6" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          aria-label="Share album link"
          title="Share album link"
          className="p-2.5 rounded-full text-content-secondary hover:text-white hover:bg-surface-2 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Tracklist Table */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <TracklistTable tracks={tracks} />

        {/* Copyright & Audio Specifications Section */}
        <div className="pt-6 border-t border-white/[0.06] text-xs text-content-muted space-y-2">
          <p className="font-semibold text-content-secondary">
            Release Date: October 24, {album.releaseYear}
          </p>
          <p>© {album.releaseYear} SONORA Music Group & {album.artistName}. Under exclusive license.</p>
          <p>℗ {album.releaseYear} SONORA Master Sound Labs. 24-bit / 96kHz Lossless Audio.</p>
        </div>
      </div>
    </div>
  );
};
