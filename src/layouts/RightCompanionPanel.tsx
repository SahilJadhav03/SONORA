import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  X,
  Mic2,
  ListMusic,
  Info,
  Heart,
  BadgeCheck,
  Users,
  Play,
  Trash2,
  Zap,
  Music2,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useContextMenuStore } from '../stores/useContextMenuStore';
import { mockArtists, mockTracks } from '../data/mockData';
import { formatNumber, formatTime } from '../utils/formatters';
import { TimeSyncedLyrics } from '../components/lyrics/TimeSyncedLyrics';
import { EqualizerIndicator } from '../components/common/EqualizerIndicator';
import { AudioVisualizerCanvas } from '../components/player/AudioVisualizerCanvas';
import { handleImageError } from '../utils/imageFallback';
import { RightPanelMode } from '../types/ui';
import { cn } from '../utils/cn';

interface RightCompanionPanelProps {
  mobile?: boolean;
}

export const RightCompanionPanel: React.FC<RightCompanionPanelProps> = ({ mobile = false }) => {
  const navigate = useNavigate();
  const rightPanelMode = useUIStore((s) => s.rightPanelMode);
  const setRightPanelMode = useUIStore((s) => s.setRightPanelMode);
  const addToast = useUIStore((s) => s.addToast);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const queue = useAudioStore((s) => s.queue);
  const reorderQueue = useAudioStore((s) => s.reorderQueue);
  const removeFromQueue = useAudioStore((s) => s.removeFromQueue);
  const clearQueue = useAudioStore((s) => s.clearQueue);
  const playTrack = useAudioStore((s) => s.playTrack);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const openContextMenu = useContextMenuStore((s) => s.openContextMenu);

  const isLiked = currentTrack ? useLibraryStore((s) => s.isLiked(currentTrack.id)) : false;
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const isFollowing = useLibraryStore((s) => s.isFollowing);
  const toggleFollowArtist = useLibraryStore((s) => s.toggleFollowArtist);

  const [isBioExpanded, setIsBioExpanded] = useState(false);

  if (rightPanelMode === 'none') return null;

  // Resolve artist profile for the "About the Artist" Bento card
  const artist = currentTrack
    ? mockArtists.find((a) => a.id === currentTrack.artistId) || {
        id: currentTrack.artistId,
        name: currentTrack.artistName,
        avatarUrl: currentTrack.coverUrl,
        headerBannerUrl: currentTrack.coverUrl,
        verified: true,
        monthlyListeners: 12450000,
        followersCount: 3820000,
        bio: `${currentTrack.artistName} is an acclaimed recording artist and sonic innovator featured on SONORA.`,
        genres: ['Electronic', 'Modern Ambient'],
      }
    : null;

  const followingArtist = artist ? isFollowing(artist.id) : false;

  const handleToggleFollow = () => {
    if (!artist) return;
    const nextFollowing = toggleFollowArtist(artist.id);
    addToast({
      type: 'success',
      message: nextFollowing
        ? `Following ${artist.name}`
        : `Unfollowed ${artist.name}`,
    });
  };

  const handleToggleLike = () => {
    if (!currentTrack) return;
    const nextLiked = toggleLikeTrack(currentTrack.id);
    addToast({
      type: 'success',
      message: nextLiked
        ? `Added "${currentTrack.title}" to Liked Songs`
        : `Removed "${currentTrack.title}" from Liked Songs`,
    });
  };

  // Determine active tab: normalize 'now-playing' to 'info'
  const activeTab: 'info' | 'lyrics' | 'queue' =
    rightPanelMode === 'lyrics'
      ? 'lyrics'
      : rightPanelMode === 'queue'
      ? 'queue'
      : 'info';

  const tabs: { id: 'info' | 'lyrics' | 'queue'; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Overview', icon: <Info className="w-3.5 h-3.5" /> },
    { id: 'lyrics', label: 'Lyrics', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { id: 'queue', label: `Queue (${queue.length})`, icon: <ListMusic className="w-3.5 h-3.5" /> },
  ];

  const content = (
    <aside className="h-full w-full flex flex-col bg-surface-0 rounded-xl overflow-hidden border border-white/[0.06] shadow-elevation-2 select-none">
      {/* 1. Spotify-Style Bento Tab Header */}
      <div className="p-2.5 px-3 flex items-center justify-between border-b border-white/[0.06] bg-surface-1/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1 bg-surface-2/70 p-1 rounded-lg border border-white/5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRightPanelMode(tab.id as RightPanelMode)}
                className={cn(
                  'relative px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 z-10',
                  isActive ? 'text-white font-bold' : 'text-content-secondary hover:text-white'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="bento-active-pill"
                    className="absolute inset-0 bg-white/10 rounded-md border border-white/10 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setRightPanelMode('none')}
          aria-label="Close now playing drawer"
          className="p-1.5 rounded-full text-content-tertiary hover:text-white hover:bg-surface-2 transition-colors ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Main Scrollable Drawer Content */}
      <div className="flex-1 overflow-y-auto sonora-scrollbar p-3.5 space-y-4">
        {/* ======================================================== */}
        {/* TAB 1: SPOTIFY CONTEXTUAL BENTO GRID OVERVIEW            */}
        {/* ======================================================== */}
        {activeTab === 'info' && currentTrack && (
          <div className="space-y-4">
            {/* CARD 1: LIVING CANVAS HERO HEADER */}
            <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden border border-white/[0.08] shadow-elevation-2 group">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                onError={handleImageError}
                className="w-full h-full object-cover animate-ken-burns scale-110"
              />
              {/* Dynamic Gradient Shroud */}
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent" />

              {/* Pulsing Live Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white">
                <span className="w-2 h-2 rounded-full bg-emerald animate-ping" />
                <span className="text-emerald">Live Canvas</span>
                <EqualizerIndicator isPlaying={isPlaying} />
              </div>

              {/* Floating Track Info Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3
                    onClick={() => navigate(`/album/${currentTrack.albumId}`)}
                    className="text-base font-bold font-display text-white truncate cursor-pointer hover:underline"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </h3>
                  <p
                    onClick={() => navigate(`/artist/${currentTrack.artistId}`)}
                    className="text-xs text-content-secondary truncate cursor-pointer hover:text-white hover:underline"
                  >
                    {currentTrack.artistName}
                  </p>
                </div>

                <button
                  onClick={handleToggleLike}
                  aria-label={isLiked ? 'Unlike' : 'Like'}
                  className={cn(
                    'p-2 rounded-full backdrop-blur-md border transition-all shrink-0',
                    isLiked
                      ? 'bg-emerald text-canvas border-emerald shadow-glow-emerald'
                      : 'bg-black/50 text-white border-white/10 hover:scale-110'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                </button>
              </div>
            </div>

            {/* CARD 2: ABOUT THE ARTIST BENTO CARD */}
            {artist && (
              <div className="p-4 rounded-xl bg-surface-1/70 border border-white/[0.06] backdrop-blur-md shadow-elevation-1 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
                    About The Artist
                  </span>
                  <button
                    onClick={() => navigate(`/artist/${artist.id}`)}
                    className="text-[11px] text-emerald hover:underline flex items-center gap-0.5"
                  >
                    View Artist <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Banner & Avatar Profile */}
                <div className="flex items-center gap-3">
                  <img
                    src={artist.avatarUrl}
                    alt={artist.name}
                    onError={handleImageError}
                    className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold font-display text-white truncate">
                        {artist.name}
                      </h4>
                      {artist.verified && (
                        <BadgeCheck className="w-4 h-4 text-emerald fill-emerald/20 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-content-secondary flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-content-tertiary" />
                      <span className="tabular-nums">
                        {formatNumber(artist.monthlyListeners)}
                      </span>{' '}
                      monthly listeners
                    </p>
                  </div>

                  <button
                    onClick={handleToggleFollow}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 border',
                      followingArtist
                        ? 'border-emerald text-emerald bg-emerald/10'
                        : 'border-white/20 text-white bg-white/5 hover:bg-white/10'
                    )}
                  >
                    {followingArtist ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Bio Snippet */}
                <p className="text-xs text-content-secondary leading-relaxed">
                  {isBioExpanded ? artist.bio : `${artist.bio.slice(0, 110)}...`}
                  {artist.bio.length > 110 && (
                    <button
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="ml-1 text-white font-medium hover:underline text-xs inline"
                    >
                      {isBioExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </p>
              </div>
            )}

            {/* CARD 3: SONG CREDITS & SONIC DNA */}
            <div className="p-4 rounded-xl bg-surface-1/70 border border-white/[0.06] backdrop-blur-md shadow-elevation-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
                  Sonic DNA & Credits
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/20 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {currentTrack.audioQuality || 'LOSSLESS 24-BIT / 96kHz'}
                </span>
              </div>

              {/* DNA Attributes 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-2/60 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-content-tertiary flex items-center gap-1 uppercase font-semibold">
                    <Zap className="w-3 h-3 text-emerald" /> Tempo
                  </span>
                  <span className="text-sm font-bold text-white mt-1 tabular-nums">
                    {currentTrack.bpm || 122} <span className="text-xs font-normal text-content-secondary">BPM</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-2/60 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-content-tertiary flex items-center gap-1 uppercase font-semibold">
                    <Music2 className="w-3 h-3 text-violet-400" /> Musical Key
                  </span>
                  <span className="text-sm font-bold text-white mt-1">
                    {currentTrack.musicalKey || 'F# Minor'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-2/60 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-content-tertiary flex items-center gap-1 uppercase font-semibold">
                    <Calendar className="w-3 h-3 text-sky-400" /> Released
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 truncate">
                    {currentTrack.releaseDate || '2025'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-2/60 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-content-tertiary flex items-center gap-1 uppercase font-semibold">
                    <Layers className="w-3 h-3 text-amber-400" /> Streams
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 tabular-nums truncate">
                    {formatNumber(currentTrack.playsCount)}
                  </span>
                </div>
              </div>

              {/* Production Credits */}
              <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <span className="text-content-tertiary">Producer:</span>
                  <span className="text-white font-medium text-right truncate max-w-[200px]">
                    {currentTrack.producer || currentTrack.artistName}
                  </span>
                </div>
                <div className="flex justify-between text-content-secondary">
                  <span className="text-content-tertiary">Composer:</span>
                  <span className="text-white font-medium text-right truncate max-w-[200px]">
                    {currentTrack.composer || currentTrack.artistName}
                  </span>
                </div>
              </div>

              {/* Mini Spectrum Visualizer */}
              <div className="pt-2 border-t border-white/5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-content-tertiary tracking-wider">
                    Live Spectrum Monitor
                  </span>
                  <span className="text-[10px] text-emerald font-mono">60 FPS FFT</span>
                </div>
                <AudioVisualizerCanvas width={290} height={32} barCount={26} className="w-full" />
              </div>
            </div>

            {/* CARD 4: NEXT IN QUEUE SNAPSHOT */}
            <div className="p-4 rounded-xl bg-surface-1/70 border border-white/[0.06] backdrop-blur-md shadow-elevation-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary">
                  Next In Queue
                </span>
                <button
                  onClick={() => setRightPanelMode('queue')}
                  className="text-[11px] text-emerald hover:underline flex items-center gap-0.5"
                >
                  View All ({queue.length}) <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {queue.length > 0 ? (
                <div
                  onClick={() => playTrack(queue[0], queue)}
                  className="flex items-center gap-3 p-2 rounded-lg bg-surface-2/60 hover:bg-surface-2 transition-all cursor-pointer group border border-white/5"
                >
                  <img
                    src={queue[0].coverUrl}
                    alt={queue[0].title}
                    onError={handleImageError}
                    className="w-11 h-11 rounded-md object-cover shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-emerald">
                      {queue[0].title}
                    </p>
                    <p className="text-[11px] text-content-secondary truncate">
                      {queue[0].artistName}
                    </p>
                  </div>
                  <button
                    aria-label={`Play ${queue[0].title}`}
                    className="w-8 h-8 rounded-full bg-emerald text-canvas flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-glow-emerald"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-surface-2/40 border border-white/5 text-center text-xs text-content-muted">
                  Queue is empty. Select any song to play next.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: APPLE MUSIC TIME-SYNCED DEPTH LYRICS              */}
        {/* ======================================================== */}
        {activeTab === 'lyrics' && (
          <div className="h-full min-h-[460px] flex flex-col">
            <TimeSyncedLyrics variant="compact" />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COMPLETE QUEUE MANAGER                            */}
        {/* ======================================================== */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Currently Playing Card */}
            {currentTrack && (
              <div>
                <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
                  Now Playing
                </h4>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-1 border border-emerald/20 shadow-sm">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    onError={handleImageError}
                    className="w-10 h-10 rounded object-cover shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-emerald truncate">
                      {currentTrack.title}
                    </p>
                    <p className="text-xs text-content-secondary truncate">
                      {currentTrack.artistName}
                    </p>
                  </div>
                  <EqualizerIndicator isPlaying={isPlaying} />
                </div>
              </div>
            )}

            {/* Next in Queue */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider">
                  Next In Queue ({queue.length})
                </h4>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs text-content-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="p-6 rounded-lg bg-surface-1/40 border border-white/5 text-center text-xs text-content-muted">
                  Queue is empty. Click tracks to enqueue them.
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={queue}
                  onReorder={reorderQueue}
                  className="space-y-1.5"
                >
                  {queue.map((track, i) => (
                    <Reorder.Item
                      key={track.id}
                      value={track}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openContextMenu(e.clientX, e.clientY, track);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-1/70 hover:bg-surface-2 transition-colors cursor-pointer group border border-white/5 select-none"
                    >
                      <div
                        className="cursor-grab active:cursor-grabbing text-content-tertiary hover:text-white p-0.5"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        onError={handleImageError}
                        onClick={() => playTrack(track, queue)}
                        className="w-8 h-8 rounded object-cover shadow shrink-0"
                      />

                      <div
                        onClick={() => playTrack(track, queue)}
                        className="min-w-0 flex-1"
                      >
                        <p className="text-xs font-medium text-content-primary group-hover:text-white truncate">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-content-secondary truncate">
                          {track.artistName}
                        </p>
                      </div>

                      <span className="text-[11px] font-mono tabular-nums text-content-tertiary">
                        {formatTime(track.duration)}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(i);
                        }}
                        aria-label="Remove from queue"
                        title="Remove from queue"
                        className="p-1 text-content-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>

            {/* Recommended additions */}
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2">
                Recommended For You
              </h4>
              <div className="space-y-1">
                {mockTracks
                  .filter((t) => t.id !== currentTrack?.id && !queue.some((q) => q.id === t.id))
                  .slice(0, 3)
                  .map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2 transition-colors"
                    >
                      <div
                        onClick={() => playTrack(track)}
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          onError={handleImageError}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-content-secondary truncate">
                            {track.artistName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToQueue(track)}
                        className="text-[11px] px-2 py-1 rounded bg-white/5 hover:bg-emerald hover:text-canvas text-content-secondary transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  // If mobile viewport drawer mode
  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setRightPanelMode('none')}
        />
        <div className="relative z-10 w-full h-[85vh] max-h-[750px] bg-surface-0 rounded-t-2xl shadow-elevation-3 overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  // Desktop sidebar panel
  return <div className="h-full w-[350px]">{content}</div>;
};
