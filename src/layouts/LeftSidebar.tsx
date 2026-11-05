import React, { useState } from 'react';
import { Home, Compass, Library, Plus, Pin, Music, Disc, Users, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { mockPlaylists, mockArtists } from '../data/mockData';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

export const LeftSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const toggleCollapse = useUIStore((s) => s.toggleSidebarCollapse);
  const addToast = useUIStore((s) => s.addToast);

  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const customPlaylists = useLibraryStore((s) => s.customPlaylists);

  const [filter, setFilter] = useState<'all' | 'playlists' | 'artists'>('all');
  const allPlaylists = [...customPlaylists, ...mockPlaylists];

  const handleCreatePlaylist = () => {
    const count = customPlaylists.length + 1;
    const newPlaylist = createPlaylist(`My Playlist #${count}`);
    addToast({
      type: 'success',
      message: `Created "${newPlaylist.title}" in your library`,
    });
    navigate(`/playlist/${newPlaylist.id}`);
  };

  const navLinks = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Discover', icon: Compass, path: '/search' },
  ];

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-surface-0 rounded-lg overflow-hidden border border-white/[0.04] transition-all duration-300 select-none shadow-elevation-1'
      )}
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Primary Navigation Hub */}
      <div className="p-3 space-y-1 border-b border-white/[0.06]">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3.5 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200',
                isActive
                  ? 'bg-surface-2 text-emerald shadow-sm'
                  : 'text-content-secondary hover:text-white hover:bg-surface-1'
              )}
              title={item.label}
            >
              <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-emerald')} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      {/* "Your Library" Header */}
      <div className="p-3 flex items-center justify-between gap-2 border-b border-white/[0.06]">
        <div
          onClick={toggleCollapse}
          className="flex items-center gap-2.5 text-content-secondary hover:text-white cursor-pointer px-1 py-1 rounded transition-colors"
          title="Toggle Library Rail"
        >
          <Library className="w-5 h-5 shrink-0 text-content-tertiary" />
          {!isCollapsed && (
            <span className="font-display font-bold text-sm tracking-wide">
              Your Library
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreatePlaylist}
              aria-label="Create playlist"
              className="p-1.5 rounded-full text-content-tertiary hover:text-white hover:bg-surface-2 transition-colors"
              title="Create playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-full text-content-tertiary hover:text-white hover:bg-surface-2 transition-colors"
              title="Collapse to Rail"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Expand sidebar"
            className="p-1 rounded-full text-content-tertiary hover:text-white"
            title="Expand Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Capsule Pills (Hidden if collapsed) */}
      {!isCollapsed && (
        <div className="px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/[0.04]">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0',
              filter === 'all'
                ? 'bg-white text-canvas font-semibold'
                : 'bg-surface-2 text-content-secondary hover:text-white'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('playlists')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0',
              filter === 'playlists'
                ? 'bg-white text-canvas font-semibold'
                : 'bg-surface-2 text-content-secondary hover:text-white'
            )}
          >
            Playlists
          </button>
          <button
            onClick={() => setFilter('artists')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0',
              filter === 'artists'
                ? 'bg-white text-canvas font-semibold'
                : 'bg-surface-2 text-content-secondary hover:text-white'
            )}
          >
            Artists
          </button>
        </div>
      )}

      {/* Scrollable Library Items List */}
      <div className="flex-1 overflow-y-auto sonora-scrollbar p-2 space-y-1">
        {/* Playlists */}
        {(filter === 'all' || filter === 'playlists') &&
          allPlaylists.map((playlist, idx) => (
            <div
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-2/70 cursor-pointer transition-colors group"
              title={playlist.title}
            >
              <img
                src={playlist.coverUrl}
                alt={playlist.title}
                onError={handleImageError}
                className="w-11 h-11 rounded object-cover shrink-0 shadow-sm"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate text-content-primary group-hover:text-white font-display">
                      {playlist.title}
                    </p>
                    {idx === 0 && <Pin className="w-3 h-3 text-emerald shrink-0 fill-emerald" />}
                  </div>
                  <p className="text-xs text-content-secondary truncate">
                    Playlist • {playlist.creatorName}
                  </p>
                </div>
              )}
            </div>
          ))}

        {/* Artists */}
        {(filter === 'all' || filter === 'artists') &&
          mockArtists.map((artist) => (
            <div
              key={artist.id}
              onClick={() => navigate(`/artist/${artist.id}`)}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-surface-2/70 cursor-pointer transition-colors group"
              title={artist.name}
            >
              <img
                src={artist.avatarUrl}
                alt={artist.name}
                onError={handleImageError}
                className="w-11 h-11 rounded-full object-cover shrink-0 shadow-sm"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-content-primary group-hover:text-white font-display">
                    {artist.name}
                  </p>
                  <p className="text-xs text-content-secondary truncate capitalize">
                    Artist
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </aside>
  );
};
