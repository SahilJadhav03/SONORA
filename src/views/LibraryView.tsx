import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Plus,
  Search,
  LayoutGrid,
  List,
  Disc3,
  Sparkles,
  Zap,
  Moon,
  Compass,
  Music2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sliders,
  MoreHorizontal,
} from 'lucide-react';
import { mockTracks, mockAlbums, mockArtists, mockPlaylists } from '../data/mockData';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useAudioStore } from '../stores/useAudioStore';
import { useUIStore } from '../stores/useUIStore';
import { useContextMenuStore } from '../stores/useContextMenuStore';
import { SpotlightTiltCard } from '../components/common/SpotlightTiltCard';
import { EqualizerIndicator } from '../components/common/EqualizerIndicator';
import { LocalAudioImporter } from '../components/player/LocalAudioImporter';
import { handleImageError } from '../utils/imageFallback';
import { Track, Album, Artist, Playlist } from '../types/music';
import { formatTime, formatNumber } from '../utils/formatters';
import { cn } from '../utils/cn';

type SonicMood = 'All' | 'Chill' | 'High Energy' | 'Late Night' | 'Focus' | 'Bass Heavy' | 'Instrumental';
type ViewMode = 'grid' | 'compact' | 'coverflow';

const SONIC_PILLS: { id: SonicMood; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'All', label: 'All Audio', icon: Sparkles },
  { id: 'Chill', label: 'Chill', icon: Moon },
  { id: 'High Energy', label: 'High Energy', icon: Zap },
  { id: 'Late Night', label: 'Late Night', icon: Moon },
  { id: 'Focus', label: 'Focus', icon: Compass },
  { id: 'Bass Heavy', label: 'Bass Heavy', icon: Sliders },
  { id: 'Instrumental', label: 'Instrumental', icon: Music2 },
];

export const LibraryView: React.FC = () => {
  const navigate = useNavigate();

  const [activeMood, setActiveMood] = useState<SonicMood>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [coverflowIndex, setCoverflowIndex] = useState(0);

  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);
  const followedArtistIds = useLibraryStore((s) => s.followedArtistIds);
  const savedAlbumIds = useLibraryStore((s) => s.savedAlbumIds);
  const savedPlaylistIds = useLibraryStore((s) => s.savedPlaylistIds);
  const customPlaylists = useLibraryStore((s) => s.customPlaylists);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);

  const openPlaylistModal = useUIStore((s) => s.openPlaylistModal);
  const addToast = useUIStore((s) => s.addToast);
  const openContextMenu = useContextMenuStore((s) => s.openContextMenu);

  // Filtered liked tracks based on search & mood
  const allLikedTracks = mockTracks.filter((t) => likedTrackIds.includes(t.id));

  const filteredTracks = allLikedTracks.filter((t) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.artistName.toLowerCase().includes(q) ||
        t.albumTitle.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Sonic Mood Filter
    if (activeMood === 'All') return true;
    if (activeMood === 'Chill') return (t.bpm && t.bpm < 100) || t.artistName === 'Caelum Strings';
    if (activeMood === 'High Energy') return (t.bpm && t.bpm >= 122) || t.artistName === 'Velvet Horizon';
    if (activeMood === 'Late Night') return t.title.toLowerCase().includes('midnight') || (t.bpm && t.bpm === 118);
    if (activeMood === 'Focus') return t.artistName === 'Aetheric Mirage' || t.artistName === 'Caelum Strings';
    if (activeMood === 'Bass Heavy') return (t.bpm && t.bpm >= 120);
    if (activeMood === 'Instrumental') return t.artistName === 'Solar Resonance' || t.artistName === 'Caelum Strings';
    return true;
  });

  const allPlaylists = [
    ...customPlaylists,
    ...mockPlaylists.filter((p) => savedPlaylistIds.includes(p.id)),
  ];

  const handlePlayLikedSongs = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filteredTracks.length > 0) {
      playTrack(filteredTracks[0], filteredTracks);
      addToast({
        title: 'Playing Liked Songs',
        message: `${filteredTracks.length} tracks queued`,
        type: 'success',
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 pb-32 md:pb-12 max-w-7xl mx-auto select-none">
      {/* 1. Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Your Library
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            <span className="tabular-nums">{allLikedTracks.length}</span> liked tracks •{' '}
            <span className="tabular-nums">{allPlaylists.length}</span> playlists •{' '}
            <span className="tabular-nums">{followedArtistIds.length}</span> followed artists
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LocalAudioImporter className="px-4 py-2" />
          <button
            onClick={() => openPlaylistModal('create')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald text-canvas font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-glow-emerald shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Sonic Mood Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {SONIC_PILLS.map((pill) => {
          const IconComp = pill.icon;
          const isActive = activeMood === pill.id;

          return (
            <button
              key={pill.id}
              onClick={() => setActiveMood(pill.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border',
                isActive
                  ? 'bg-emerald text-canvas border-emerald shadow-glow-emerald scale-105'
                  : 'bg-surface-2 text-content-secondary border-white/5 hover:text-white hover:bg-surface-3'
              )}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Bar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter library tracks..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-surface-2 border border-white/10 text-xs text-white placeholder-content-muted focus:outline-none focus:border-emerald transition-colors"
          />
        </div>

        {/* View Switcher: Compact List vs Bento Grid vs Vinyl Coverflow */}
        <div className="flex items-center gap-1 bg-surface-2/80 p-1 rounded-xl border border-white/5 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('compact')}
            aria-label="Compact list view"
            title="Compact List (BPM & Duration)"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              viewMode === 'compact'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compact</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            aria-label="Bento grid view"
            title="Bento Grid"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              viewMode === 'grid'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bento Grid</span>
          </button>

          <button
            onClick={() => setViewMode('coverflow')}
            aria-label="Vinyl Coverflow view"
            title="Vinyl 3D Coverflow"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              viewMode === 'coverflow'
                ? 'bg-emerald text-canvas font-bold shadow-glow-emerald'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coverflow</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: VINYL COVERFLOW 3D PERSPECTIVE CAROUSEL           */}
      {/* ========================================================= */}
      {viewMode === 'coverflow' && (
        <div className="relative py-12 px-4 flex flex-col items-center justify-center overflow-hidden min-h-[460px] bg-surface-1/40 rounded-2xl border border-white/5">
          <div className="relative w-full max-w-4xl h-80 flex items-center justify-center perspective-[1000px]">
            {filteredTracks.slice(0, 7).map((track, idx) => {
              const offset = idx - coverflowIndex;
              const isActive = offset === 0;

              return (
                <motion.div
                  key={track.id}
                  onClick={() => setCoverflowIndex(idx)}
                  animate={{
                    x: offset * 180,
                    scale: isActive ? 1.08 : 0.85 - Math.min(Math.abs(offset), 3) * 0.1,
                    rotateY: offset === 0 ? 0 : offset > 0 ? -35 : 35,
                    zIndex: 10 - Math.abs(offset),
                    opacity: Math.abs(offset) > 3 ? 0 : 1 - Math.abs(offset) * 0.25,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  className="absolute cursor-pointer select-none group"
                >
                  <div className="relative w-56 h-56 rounded-xl shadow-[0_25px_50px_rgba(0,0,0,0.85)] border border-white/10 overflow-hidden bg-surface-2">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />

                    {/* Animated Vinyl Disc Slide-Out for active album */}
                    {isActive && (
                      <div
                        className={cn(
                          'absolute -top-6 -right-6 w-32 h-32 rounded-full border-4 border-black/80 bg-zinc-950 shadow-elevation-3 transition-transform duration-700 pointer-events-none flex items-center justify-center',
                          isPlaying ? 'animate-spin' : 'translate-x-3 translate-y-3'
                        )}
                        style={{ animationDuration: '6s' }}
                      >
                        <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-emerald/30 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-black" />
                        </div>
                      </div>
                    )}

                    {/* Play Overlay */}
                    {isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentTrack?.id === track.id) {
                            togglePlayPause();
                          } else {
                            playTrack(track, filteredTracks);
                          }
                        }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="w-14 h-14 rounded-full bg-emerald text-canvas flex items-center justify-center shadow-glow-emerald hover:scale-110 active:scale-95 transition-all">
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-6 h-6 fill-current text-canvas" />
                          ) : (
                            <Play className="w-6 h-6 fill-current text-canvas ml-0.5" />
                          )}
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Reflection Sheen */}
                  <div
                    className="w-56 h-16 mt-2 rounded-xl opacity-20 pointer-events-none transform scale-y-[-1] filter blur-sm"
                    style={{
                      backgroundImage: `url(${track.coverUrl})`,
                      backgroundSize: 'cover',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 100%)',
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Active Track Title & Navigation Chevrons */}
          {filteredTracks[coverflowIndex] && (
            <div className="mt-6 text-center space-y-1.5 z-20">
              <h3 className="text-xl font-bold font-display text-white">
                {filteredTracks[coverflowIndex].title}
              </h3>
              <p className="text-xs text-content-secondary">
                {filteredTracks[coverflowIndex].artistName} •{' '}
                <span className="text-emerald font-mono">{filteredTracks[coverflowIndex].bpm || 120} BPM</span> •{' '}
                <span className="font-mono">{filteredTracks[coverflowIndex].musicalKey || 'F# Minor'}</span>
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCoverflowIndex((prev) => Math.max(0, prev - 1))}
                  disabled={coverflowIndex === 0}
                  className="p-2 rounded-full bg-surface-2 hover:bg-surface-3 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-content-tertiary">
                  {coverflowIndex + 1} / {Math.min(7, filteredTracks.length)}
                </span>
                <button
                  onClick={() => setCoverflowIndex((prev) => Math.min(Math.min(6, filteredTracks.length - 1), prev + 1))}
                  disabled={coverflowIndex >= Math.min(6, filteredTracks.length - 1)}
                  className="p-2 rounded-full bg-surface-2 hover:bg-surface-3 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: COMPACT LIST VIEW (WITH BPM & KEY COLUMNS)        */}
      {/* ========================================================= */}
      {viewMode === 'compact' && (
        <div className="rounded-xl border border-white/5 bg-surface-1/40 overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-5 sm:col-span-4">Title & Artist</span>
            <span className="col-span-3 hidden sm:block">Album</span>
            <span className="col-span-2 text-center hidden md:block">BPM / Key</span>
            <span className="col-span-6 sm:col-span-2 text-right">Duration</span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isCurrent) togglePlayPause();
                    else playTrack(track, filteredTracks);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openContextMenu(e.clientX, e.clientY, track);
                  }}
                  className={cn(
                    'grid grid-cols-12 gap-2 px-4 py-2 items-center hover:bg-white/[0.06] transition-colors cursor-pointer group',
                    isCurrent && 'bg-white/[0.04]'
                  )}
                >
                  {/* # or Equalizer */}
                  <div className="col-span-1 flex items-center justify-center">
                    {isCurrentPlaying ? (
                      <EqualizerIndicator isPlaying={true} />
                    ) : (
                      <span className="text-xs font-mono text-content-tertiary group-hover:text-emerald">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      onError={handleImageError}
                      className="w-9 h-9 rounded object-cover shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={cn('text-xs sm:text-sm font-semibold truncate', isCurrent ? 'text-emerald' : 'text-white')}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-content-secondary truncate">{track.artistName}</p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-3 hidden sm:block min-w-0">
                    <p className="text-xs text-content-secondary truncate">{track.albumTitle}</p>
                  </div>

                  {/* Sonic DNA: BPM & Key */}
                  <div className="col-span-2 hidden md:flex items-center justify-center gap-1.5 text-xs font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-surface-2 text-emerald tabular-nums">
                      {track.bpm || 120} BPM
                    </span>
                    <span className="text-content-tertiary">
                      {track.musicalKey || 'F#m'}
                    </span>
                  </div>

                  {/* Duration & Quick More */}
                  <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2 text-xs font-mono tabular-nums text-content-tertiary">
                    <span>{formatTime(track.duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openContextMenu(e.clientX, e.clientY, track);
                      }}
                      className="p-1 rounded hover:bg-white/10 text-content-tertiary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: BENTO GRID VIEW (3D TILT CARDS)                   */}
      {/* ========================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-8">
          {/* Custom Playlists Shelf */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-white">Playlists</h2>
              <button
                onClick={() => openPlaylistModal('create')}
                className="text-xs text-emerald hover:underline font-semibold"
              >
                + New Playlist
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allPlaylists.map((pl) => (
                <SpotlightTiltCard
                  key={pl.id}
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                  className="p-3.5 flex flex-col"
                >
                  <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg shadow-elevation-1">
                    <img
                      src={pl.coverUrl}
                      alt={pl.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-sm font-semibold truncate text-white">{pl.title}</h4>
                  <p className="text-xs text-content-secondary truncate">
                    Playlist • <span className="tabular-nums">{pl.tracksCount}</span> songs
                  </p>
                </SpotlightTiltCard>
              ))}
            </div>
          </div>

          {/* Liked Tracks Bento Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-display text-white">Liked Tracks</h2>
              <button
                onClick={handlePlayLikedSongs}
                className="text-xs text-emerald hover:underline font-semibold"
              >
                Play All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredTracks.map((track) => {
                const isCurrent = currentTrack?.id === track.id;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <SpotlightTiltCard
                    key={track.id}
                    onClick={() => {
                      if (isCurrent) togglePlayPause();
                      else playTrack(track, filteredTracks);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      openContextMenu(e.clientX, e.clientY, track);
                    }}
                    className="p-3.5 flex flex-col group/card"
                  >
                    <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg shadow-elevation-1">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) togglePlayPause();
                          else playTrack(track, filteredTracks);
                        }}
                        className={cn(
                          'absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-glow-emerald',
                          isCurrentPlaying
                            ? 'opacity-100 translate-y-0 bg-emerald text-canvas'
                            : 'opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 bg-emerald text-canvas hover:scale-110 active:scale-95'
                        )}
                      >
                        {isCurrentPlaying ? (
                          <EqualizerIndicator isPlaying={true} />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    <h4 className="text-sm font-semibold truncate text-white">{track.title}</h4>
                    <p className="text-xs text-content-secondary truncate">{track.artistName}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-content-tertiary font-mono">
                      <span className="text-emerald">{track.bpm || 120} BPM</span>
                      <span>•</span>
                      <span>{formatTime(track.duration)}</span>
                    </div>
                  </SpotlightTiltCard>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
