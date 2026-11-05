import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  ListPlus,
  ListMusic,
  PlusCircle,
  Heart,
  User,
  Disc,
  Share2,
  FolderPlus,
  ChevronRight,
} from 'lucide-react';
import { useContextMenuStore } from '../../stores/useContextMenuStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useUIStore } from '../../stores/useUIStore';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

export const TrackContextMenu: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, x, y, track, closeContextMenu } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

  const playTrack = useAudioStore((s) => s.playTrack);
  const playNextTrack = useAudioStore((s) => s.playNextTrack);
  const addToQueue = useAudioStore((s) => s.addToQueue);

  const customPlaylists = useLibraryStore((s) => s.customPlaylists);
  const addTrackToPlaylist = useLibraryStore((s) => s.addTrackToPlaylist);
  const isLiked = track ? useLibraryStore((s) => s.isLiked(track.id)) : false;
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);

  const addToast = useUIStore((s) => s.addToast);
  const openPlaylistModal = useUIStore((s) => s.openPlaylistModal);

  // Close on click outside or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeContextMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeContextMenu]);

  if (!isOpen || !track) return null;

  const handlePlayNow = () => {
    playTrack(track);
    closeContextMenu();
    addToast({
      title: 'Playing Now',
      message: track.title,
      imageUrl: track.coverUrl,
      type: 'success',
    });
  };

  const handlePlayNext = () => {
    playNextTrack(track);
    closeContextMenu();
    addToast({
      title: 'Playing Next',
      message: `"${track.title}" added to the top of queue`,
      imageUrl: track.coverUrl,
      type: 'success',
    });
  };

  const handleAddToQueue = () => {
    addToQueue(track);
    closeContextMenu();
    addToast({
      title: 'Added to Queue',
      message: track.title,
      imageUrl: track.coverUrl,
      type: 'info',
    });
  };

  const handleToggleLike = () => {
    const next = toggleLikeTrack(track.id);
    closeContextMenu();
    addToast({
      title: next ? 'Saved to Liked Songs' : 'Removed from Liked Songs',
      message: track.title,
      imageUrl: track.coverUrl,
      type: 'success',
    });
  };

  const handleAddToSpecificPlaylist = (playlistId: string, playlistTitle: string) => {
    const added = addTrackToPlaylist(playlistId, track);
    closeContextMenu();
    addToast({
      title: added ? 'Added to Playlist' : 'Already in Playlist',
      message: `"${track.title}" -> ${playlistTitle}`,
      imageUrl: track.coverUrl,
      type: added ? 'success' : 'info',
    });
  };

  const handleCreateAndAdd = () => {
    closeContextMenu();
    openPlaylistModal('create');
  };

  const handleGoToArtist = () => {
    navigate(`/artist/${track.artistId}`);
    closeContextMenu();
  };

  const handleGoToAlbum = () => {
    navigate(`/album/${track.albumId}`);
    closeContextMenu();
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/album/${track.albumId}`;
    navigator.clipboard?.writeText(url);
    closeContextMenu();
    addToast({
      title: 'Link Copied',
      message: `Direct link for "${track.title}" copied to clipboard`,
      imageUrl: track.coverUrl,
      type: 'success',
    });
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 w-56 rounded-xl bg-surface-1/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)] p-1.5 text-xs text-content-primary select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header Info */}
      <div className="flex items-center gap-2.5 p-2 mb-1 border-b border-white/5">
        <img
          src={track.coverUrl}
          alt={track.title}
          onError={handleImageError}
          className="w-8 h-8 rounded-md object-cover shadow border border-white/10 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-white truncate">{track.title}</p>
          <p className="text-[10px] text-content-secondary truncate">{track.artistName}</p>
        </div>
      </div>

      {/* Main Actions */}
      <button
        onClick={handlePlayNow}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <Play className="w-3.5 h-3.5 text-emerald fill-emerald/30" />
        <span>Play Now</span>
      </button>

      <button
        onClick={handlePlayNext}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <ListPlus className="w-3.5 h-3.5 text-content-secondary" />
        <span>Play Next in Queue</span>
      </button>

      <button
        onClick={handleAddToQueue}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <ListMusic className="w-3.5 h-3.5 text-content-secondary" />
        <span>Add to Queue</span>
      </button>

      {/* Add to Playlist Submenu Trigger */}
      <div
        className="relative"
        onMouseEnter={() => setIsSubmenuOpen(true)}
        onMouseLeave={() => setIsSubmenuOpen(false)}
      >
        <button
          onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <PlusCircle className="w-3.5 h-3.5 text-content-secondary" />
            <span>Add to Playlist</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-content-tertiary" />
        </button>

        {/* Submenu Dropdown */}
        {isSubmenuOpen && (
          <div className="absolute left-full top-0 ml-1 w-52 rounded-xl bg-surface-1/95 backdrop-blur-2xl border border-white/10 shadow-elevation-3 p-1.5 space-y-0.5 animate-in fade-in duration-150">
            <button
              onClick={handleCreateAndAdd}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald/10 text-emerald hover:bg-emerald hover:text-canvas transition-colors text-left font-semibold"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New Playlist...</span>
            </button>

            <div className="max-h-48 overflow-y-auto sonora-scrollbar pt-1 border-t border-white/5 space-y-0.5">
              {customPlaylists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddToSpecificPlaylist(pl.id, pl.title)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left truncate"
                >
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    onError={handleImageError}
                    className="w-5 h-5 rounded object-cover shrink-0"
                  />
                  <span className="truncate">{pl.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-white/5 my-1" />

      <button
        onClick={handleToggleLike}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <Heart className={cn('w-3.5 h-3.5', isLiked ? 'text-emerald fill-emerald' : 'text-content-secondary')} />
        <span>{isLiked ? 'Remove from Liked' : 'Save to Liked Songs'}</span>
      </button>

      <button
        onClick={handleGoToArtist}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <User className="w-3.5 h-3.5 text-content-secondary" />
        <span>Go to Artist</span>
      </button>

      <button
        onClick={handleGoToAlbum}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <Disc className="w-3.5 h-3.5 text-content-secondary" />
        <span>Go to Album</span>
      </button>

      <div className="h-px bg-white/5 my-1" />

      <button
        onClick={handleCopyShareLink}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-surface-3 hover:text-white transition-colors text-left"
      >
        <Share2 className="w-3.5 h-3.5 text-content-secondary" />
        <span>Copy Share Link</span>
      </button>
    </div>
  );
};
