import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Shuffle,
  Music2,
  Share2,
  Edit3,
  Trash2,
  Plus,
  GripVertical,
  X,
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { musicRepository } from '../data/repository/MockMusicRepository';
import { Playlist, Track } from '../types/music';
import { TracklistTable } from '../components/table/TracklistTable';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useUIStore } from '../stores/useUIStore';
import { useContextMenuStore } from '../stores/useContextMenuStore';
import { formatTime, formatNumber } from '../utils/formatters';
import { MorphingStickyHeader } from '../components/common/MorphingStickyHeader';
import { mockTracks } from '../data/mockData';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

export const PlaylistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | undefined>();

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);

  const customPlaylists = useLibraryStore((s) => s.customPlaylists);
  const isPlaylistSaved = id ? useLibraryStore((s) => s.isPlaylistSaved(id)) : false;
  const toggleSavePlaylist = useLibraryStore((s) => s.toggleSavePlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const removeTrackFromPlaylist = useLibraryStore((s) => s.removeTrackFromPlaylist);
  const reorderPlaylistTracks = useLibraryStore((s) => s.reorderPlaylistTracks);
  const addTrackToPlaylist = useLibraryStore((s) => s.addTrackToPlaylist);

  const showToast = useUIStore((s) => s.showToast);
  const addToast = useUIStore((s) => s.addToast);
  const openPlaylistModal = useUIStore((s) => s.openPlaylistModal);
  const openContextMenu = useContextMenuStore((s) => s.openContextMenu);

  const isCustom = Boolean(customPlaylists.some((p) => p.id === id));

  useEffect(() => {
    if (id) {
      // Check custom playlists first
      const custom = customPlaylists.find((p) => p.id === id);
      if (custom) {
        setPlaylist(custom);
      } else {
        musicRepository.getPlaylistById(id).then(setPlaylist);
      }
    }
  }, [id, customPlaylists]);

  if (!playlist) {
    return (
      <div className="p-12 text-center text-content-muted flex flex-col items-center justify-center min-h-[50vh]">
        <Music2 className="w-12 h-12 stroke-[1.5] mb-3 text-content-tertiary animate-pulse" />
        <p className="text-base font-medium">Loading playlist...</p>
      </div>
    );
  }

  const isPlaylistActive =
    Boolean(currentTrack && playlist.tracks.some((t) => t.id === currentTrack.id));
  const isPlaylistPlaying = Boolean(isPlaylistActive && isPlaying);

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);

  const handlePlayAll = () => {
    if (isPlaylistActive) {
      togglePlayPause();
    } else if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
      addToast({
        title: 'Playing Playlist',
        message: playlist.title,
        imageUrl: playlist.coverUrl,
        type: 'success',
      });
    }
  };

  const handleShufflePlay = () => {
    if (playlist.tracks.length > 0) {
      const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
      toggleShuffle();
      addToast({
        title: 'Shuffle Play Activated',
        message: `Shuffled ${playlist.tracks.length} tracks`,
        type: 'success',
      });
    }
  };

  const handleToggleSave = () => {
    if (!id) return;
    const nowSaved = toggleSavePlaylist(id);
    addToast({
      title: nowSaved ? 'Saved to Your Library' : 'Removed from Library',
      message: playlist.title,
      imageUrl: playlist.coverUrl,
      type: 'success',
    });
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        title: 'Link Copied',
        message: 'Direct playlist link copied to clipboard',
        imageUrl: playlist.coverUrl,
        type: 'info',
      });
    }
  };

  const handleDeletePlaylist = () => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      deletePlaylist(id);
      addToast({
        title: 'Playlist Deleted',
        message: `"${playlist.title}" was removed`,
        type: 'info',
      });
      navigate('/library');
    }
  };

  const handleReorderTracks = (newTracks: Track[]) => {
    if (!id) return;
    reorderPlaylistTracks(id, newTracks);
  };

  const handleAddSampleTracks = () => {
    if (!id) return;
    const samples = mockTracks.slice(0, 5);
    samples.forEach((t) => addTrackToPlaylist(id, t));
    addToast({
      title: 'Added 5 Tracks',
      message: 'Populated playlist with audio gems',
      type: 'success',
    });
  };

  return (
    <div className="flex flex-col pb-32 md:pb-12 relative select-none">
      {/* Scroll-Linked Contextual Sticky Header */}
      <MorphingStickyHeader
        title={playlist.title}
        subtitle={`Playlist • ${playlist.creatorName}`}
        imageUrl={playlist.coverUrl}
        isPlaying={isPlaylistPlaying}
        onPlayToggle={handlePlayAll}
      />

      {/* 1. Dynamic Hero Header with Ambient Gradient */}
      <div
        className="p-6 sm:p-8 lg:p-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${playlist.accentColor || '#00F59B'}33 0%, var(--sonora-surface-0) 100%)`,
        }}
      >
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          onError={handleImageError}
          className="w-48 h-48 sm:w-56 sm:h-56 lg:w-60 lg:h-60 rounded-xl object-cover shadow-elevation-3 shrink-0"
        />

        <div className="space-y-2.5 z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald font-mono">
              {isCustom ? 'Custom Playlist' : 'Public Playlist'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-none">
            {playlist.title}
          </h1>

          <p className="text-xs sm:text-sm text-content-secondary line-clamp-2 max-w-xl leading-relaxed">
            {playlist.description}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-content-secondary pt-1 font-medium">
            <span className="text-white font-semibold">{playlist.creatorName}</span>
            <span>•</span>
            <span className="tabular-nums">{formatNumber(playlist.followersCount)} saves</span>
            <span>•</span>
            <span className="tabular-nums">{playlist.tracks.length} songs</span>
            {playlist.tracks.length > 0 && (
              <>
                <span>•</span>
                <span className="text-content-tertiary tabular-nums">
                  about {formatTime(totalDuration)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Action Ribbon */}
      <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Main Play Button */}
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            aria-label={isPlaylistPlaying ? 'Pause playlist' : 'Play playlist'}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center shadow-glow-emerald hover:scale-105 active:scale-95 transition-all',
              playlist.tracks.length > 0
                ? 'bg-emerald text-canvas'
                : 'bg-surface-3 text-content-muted cursor-not-allowed'
            )}
          >
            {isPlaylistPlaying ? (
              <Pause className="w-6 h-6 fill-current text-canvas" />
            ) : (
              <Play className="w-6 h-6 fill-current text-canvas ml-0.5" />
            )}
          </button>

          {/* Shuffle Play Button */}
          {playlist.tracks.length > 0 && (
            <button
              onClick={handleShufflePlay}
              aria-label="Shuffle play"
              className="w-11 h-11 rounded-full bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-white flex items-center justify-center transition-colors border border-white/5"
              title="Shuffle Playlist"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          )}

          {/* Save / Like Playlist */}
          <button
            onClick={handleToggleSave}
            aria-label={isPlaylistSaved ? 'Remove from library' : 'Save to library'}
            className={cn(
              'p-2.5 rounded-full transition-all hover:scale-110',
              isPlaylistSaved ? 'text-emerald' : 'text-content-secondary hover:text-white'
            )}
            title={isPlaylistSaved ? 'Saved to Library' : 'Save to Library'}
          >
            <Heart className={cn('w-6 h-6', isPlaylistSaved && 'fill-current text-emerald')} />
          </button>

          {/* Custom Playlist Controls: Edit & Delete */}
          {isCustom && (
            <>
              <button
                onClick={() => openPlaylistModal('edit', playlist.id)}
                className="p-2.5 rounded-full bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-white transition-colors border border-white/5"
                title="Edit Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeletePlaylist}
                className="p-2.5 rounded-full bg-surface-2 hover:bg-red-500/20 text-content-secondary hover:text-red-400 transition-colors border border-white/5"
                title="Delete Playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleShare}
          aria-label="Share playlist link"
          className="p-2.5 rounded-full text-content-tertiary hover:text-white transition-colors"
          title="Share Playlist"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Tracklist: Interactive Drag-and-Drop Reorder or Table */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {playlist.tracks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface-1/40 border border-dashed border-white/10 text-center space-y-4">
            <Music2 className="w-12 h-12 text-content-tertiary mx-auto opacity-50" />
            <h3 className="text-lg font-bold font-display text-white">Your playlist is empty</h3>
            <p className="text-xs text-content-secondary max-w-sm mx-auto">
              Right-click any song in SONORA to add it here, or populate with recommended tracks to start listening.
            </p>
            <button
              onClick={handleAddSampleTracks}
              className="px-5 py-2.5 rounded-full bg-emerald text-canvas font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-glow-emerald"
            >
              + Add 5 Recommended Tracks
            </button>
          </div>
        ) : isCustom ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-semibold text-content-tertiary uppercase tracking-wider">
              <span>Track Title & Artist</span>
              <span>Duration • Actions</span>
            </div>

            <Reorder.Group
              axis="y"
              values={playlist.tracks}
              onReorder={handleReorderTracks}
              className="space-y-1"
            >
              {playlist.tracks.map((track, i) => (
                <Reorder.Item
                  key={track.id}
                  value={track}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openContextMenu(e.clientX, e.clientY, track);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-1/50 hover:bg-surface-2 transition-colors cursor-pointer group border border-white/5 select-none"
                >
                  <div
                    className="cursor-grab active:cursor-grabbing text-content-tertiary hover:text-white p-1"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  <span className="w-5 text-xs text-content-tertiary font-mono tabular-nums">
                    {i + 1}
                  </span>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    onError={handleImageError}
                    onClick={() => playTrack(track, playlist.tracks)}
                    className="w-10 h-10 rounded-md object-cover shadow shrink-0"
                  />

                  <div
                    onClick={() => playTrack(track, playlist.tracks)}
                    className="min-w-0 flex-1"
                  >
                    <p className="text-sm font-semibold text-white group-hover:text-emerald truncate">
                      {track.title}
                    </p>
                    <p className="text-xs text-content-secondary truncate">{track.artistName}</p>
                  </div>

                  <span className="text-xs font-mono tabular-nums text-content-tertiary">
                    {formatTime(track.duration)}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (id) removeTrackFromPlaylist(id, track.id);
                    }}
                    aria-label="Remove from playlist"
                    title="Remove track"
                    className="p-1.5 text-content-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 rounded-full hover:bg-white/5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        ) : (
          <TracklistTable tracks={playlist.tracks} showHeader={true} />
        )}
      </div>
    </div>
  );
};
