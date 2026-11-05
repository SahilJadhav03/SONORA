import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Volume1,
  Mic2,
  ListMusic,
  Disc,
  Share2,
  Sparkles,
  Info,
  Trash2,
  Plus,
  Maximize2,
  Minimize2,
  Sliders,
} from 'lucide-react';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useUIStore } from '../stores/useUIStore';
import { formatTime } from '../utils/formatters';
import { EqualizerIndicator } from '../components/common/EqualizerIndicator';
import { AudioVisualizerCanvas } from '../components/player/AudioVisualizerCanvas';
import { TimelineScrubber } from '../components/player/TimelineScrubber';
import { TimeSyncedLyrics } from '../components/lyrics/TimeSyncedLyrics';
import { mockTracks } from '../data/mockData';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

type ActiveTab = 'visual' | 'lyrics' | 'queue' | 'info';

export const NowPlayingView: React.FC = () => {
  const navigate = useNavigate();

  // Audio store selectors
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const skipNext = useAudioStore((s) => s.skipNext);
  const skipPrevious = useAudioStore((s) => s.skipPrevious);
  const isShuffle = useAudioStore((s) => s.isShuffle);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const repeatMode = useAudioStore((s) => s.repeatMode);
  const toggleRepeat = useAudioStore((s) => s.toggleRepeat);
  const volume = useAudioStore((s) => s.volume);
  const setVolume = useAudioStore((s) => s.setVolume);
  const isMuted = useAudioStore((s) => s.isMuted);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const queue = useAudioStore((s) => s.queue);
  const clearQueue = useAudioStore((s) => s.clearQueue);
  const removeFromQueue = useAudioStore((s) => s.removeFromQueue);
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const playTrack = useAudioStore((s) => s.playTrack);
  const isEQOpen = useAudioStore((s) => s.isEQOpen);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);

  // Library & UI store
  const isLiked = currentTrack ? useLibraryStore((s) => s.isLiked(currentTrack.id)) : false;
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const addToast = useUIStore((s) => s.addToast);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);

  useEffect(() => {
    setTheatreOpen(true);
  }, [setTheatreOpen]);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('visual');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleShare = () => {
    if (currentTrack) {
      navigator.clipboard?.writeText(window.location.href);
      addToast({
        type: 'success',
        message: `Link to "${currentTrack.title}" copied to clipboard`,
      });
    }
  };

  if (!currentTrack) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-content-muted gap-4">
        <Disc className="w-16 h-16 text-content-tertiary animate-spin" />
        <h3 className="text-xl font-bold font-display text-white">No Track Loaded</h3>
        <p className="text-sm max-w-sm">Choose any track, album, or playlist from SONORA to begin playback.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-emerald text-canvas font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-glow-emerald"
        >
          Explore Music
        </button>
      </div>
    );
  }

  const recommendedTracks = mockTracks.filter((t) => t.id !== currentTrack.id && !queue.some((q) => q.id === t.id)).slice(0, 4);

  return (
    <div className="relative min-h-full flex flex-col pb-28 md:pb-12 overflow-hidden select-none">
      {/* 1. Dynamic Ambient Blurred Artwork Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125 transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url(${currentTrack.coverUrl})`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentTrack.accentColor || '#00F59B'}33 0%, transparent 70%)`,
        }}
      />

      {/* 2. Top Navigation & Experience Selector Bar */}
      <header className="relative z-10 px-6 sm:px-10 py-5 flex items-center justify-between border-b border-white/[0.06] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="text-xs font-semibold text-content-secondary hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="text-content-muted">•</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">Now Playing Hi-Fi</span>
          </div>
        </div>

        {/* View mode switcher tabs */}
        <div className="flex items-center p-1 rounded-full bg-surface-1/80 border border-white/10 shadow-elevation-1">
          <button
            onClick={() => setActiveTab('visual')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all',
              activeTab === 'visual'
                ? 'bg-emerald text-canvas shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cover Art</span>
          </button>

          <button
            onClick={() => setActiveTab('lyrics')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all',
              activeTab === 'lyrics'
                ? 'bg-emerald text-canvas shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all',
              activeTab === 'queue'
                ? 'bg-emerald text-canvas shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue ({queue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all',
              activeTab === 'info'
                ? 'bg-emerald text-canvas shadow-sm'
                : 'text-content-secondary hover:text-white'
            )}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Specs</span>
          </button>
        </div>

        {/* Fullscreen & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share track"
            title="Share track"
            className="p-2 rounded-full text-content-secondary hover:text-white hover:bg-surface-2 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            aria-label="Toggle Fullscreen"
            title="Toggle Fullscreen"
            className="p-2 rounded-full text-content-secondary hover:text-white hover:bg-surface-2 transition-colors hidden sm:block"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3. Central Dynamic Canvas Content */}
      <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center">
        {/* TAB 1: VISUAL COVER ART MODE */}
        {activeTab === 'visual' && (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 my-auto">
            {/* Massive Album Artwork with Beat-Reactive Ambient Halo */}
            <div className="relative shrink-0">
              <div
                className="absolute -inset-4 sm:-inset-6 rounded-3xl filter blur-2xl pointer-events-none transition-all duration-75"
                style={{
                  backgroundColor: currentTrack.accentColor || '#00F59B',
                  transform: 'scale(calc(1 + var(--sonora-bass, 0) * 0.2))',
                  opacity: 'calc(0.25 + var(--sonora-bass, 0) * 0.55)',
                }}
              />
              <div className="relative group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-elevation-3 border border-white/10 z-10">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  onError={handleImageError}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105',
                    isPlaying && 'scale-[1.01]'
                  )}
                />
                {/* Subtle ambient corner badge */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-surface-0/80 backdrop-blur-md border border-white/10 text-xs font-medium text-white flex items-center gap-2">
                  <EqualizerIndicator isPlaying={isPlaying} />
                  <span>Lossless 24-bit / 96kHz</span>
                </div>
              </div>
            </div>

            {/* Track Info & Quick Actions Column */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 max-w-md">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald">
                    {currentTrack.albumTitle}
                  </span>
                  {currentTrack.explicit && (
                    <span className="px-1.5 py-0.5 rounded-xs bg-white/20 text-[10px] font-bold text-white uppercase">
                      Explicit
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
                  {currentTrack.title}
                </h1>
                <p
                  onClick={() => navigate(`/artist/${currentTrack.artistId}`)}
                  className="text-lg sm:text-xl font-medium text-content-secondary hover:text-white hover:underline cursor-pointer transition-colors"
                >
                  {currentTrack.artistName}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const liked = toggleLikeTrack(currentTrack.id);
                    addToast({
                      type: liked ? 'success' : 'info',
                      message: liked ? `Saved "${currentTrack.title}" to Liked Songs` : `Removed from Liked Songs`,
                    });
                  }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all hover:scale-105 active:scale-95',
                    isLiked
                      ? 'border-emerald/40 bg-emerald/10 text-emerald'
                      : 'border-white/20 hover:border-white text-white'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current text-emerald')} />
                  <span>{isLiked ? 'Liked' : 'Favorite'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('lyrics')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm font-semibold text-content-primary hover:text-white transition-all hover:scale-105"
                >
                  <Mic2 className="w-4 h-4 text-emerald" />
                  <span>Lyrics</span>
                </button>

                <button
                  onClick={() => setActiveTab('queue')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-white/10 text-sm font-semibold text-content-primary hover:text-white transition-all hover:scale-105"
                >
                  <ListMusic className="w-4 h-4 text-emerald" />
                  <span>Queue</span>
                </button>

                <button
                  onClick={toggleEQ}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all hover:scale-105',
                    isEQOpen ? 'border-emerald text-emerald bg-emerald/10' : 'bg-surface-2 hover:bg-surface-3 border-white/10 text-white'
                  )}
                >
                  <Sliders className="w-4 h-4 text-emerald" />
                  <span>EQ</span>
                </button>
              </div>

              {/* Real-time Hardware FFT Spectrum Bar */}
              <div className="pt-3 w-full max-w-sm flex flex-col items-center lg:items-start">
                <span className="text-[10px] uppercase font-mono tracking-widest text-content-muted mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald" />
                  <span>Real-Time Hardware FFT Spectrum</span>
                </span>
                <AudioVisualizerCanvas width={340} height={40} barCount={36} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPLE MUSIC TIME-SYNCED GLOW LYRICS (THEATRE MODE) */}
        {activeTab === 'lyrics' && (
          <div className="max-w-3xl mx-auto w-full h-[460px] my-auto flex flex-col items-center">
            <TimeSyncedLyrics variant="theatre" showSingModeToggle={true} />
          </div>
        )}

        {/* TAB 3: QUEUE MANAGER & RECOMMENDATIONS */}
        {activeTab === 'queue' && (
          <div className="max-w-2xl mx-auto w-full my-auto space-y-6">
            {/* Currently Playing Card */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-content-tertiary mb-2">
                Currently Playing
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-emerald/30 shadow-elevation-1">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  onError={handleImageError}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald truncate font-display">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-content-secondary truncate">{currentTrack.artistName}</p>
                </div>
                <EqualizerIndicator isPlaying={isPlaying} />
              </div>
            </div>

            {/* Next in Queue */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-content-tertiary">
                  Next In Queue ({queue.length})
                </h3>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="text-xs text-content-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Queue</span>
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="p-6 rounded-xl bg-surface-1/50 border border-white/5 text-center text-xs text-content-muted">
                  Queue is empty. Select from recommended tracks below.
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto sonora-scrollbar space-y-1.5 p-1">
                  {queue.map((track, i) => (
                    <div
                      key={`${track.id}-${i}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-1/60 hover:bg-surface-2 transition-colors group cursor-pointer"
                    >
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        onError={handleImageError}
                        className="w-9 h-9 rounded object-cover"
                        onClick={() => playTrack(track, queue)}
                      />
                      <div className="flex-1 min-w-0" onClick={() => playTrack(track, queue)}>
                        <p className="text-xs font-semibold text-white truncate">{track.title}</p>
                        <p className="text-[11px] text-content-secondary truncate">{track.artistName}</p>
                      </div>
                      <span className="text-xs font-mono text-content-muted mr-2">
                        {formatTime(track.duration)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(i);
                        }}
                        aria-label="Remove from queue"
                        className="p-1 text-content-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Next Tracks */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-wider text-content-tertiary mb-2">
                Recommended For You
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendedTracks.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-1/40 hover:bg-surface-2/60 transition-colors border border-white/5"
                  >
                    <div
                      onClick={() => playTrack(rec)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <img
                        src={rec.coverUrl}
                        alt={rec.title}
                        onError={handleImageError}
                        className="w-8 h-8 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">{rec.title}</p>
                        <p className="text-[10px] text-content-muted truncate">{rec.artistName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addToQueue(rec);
                        addToast({
                          type: 'success',
                          message: `Added "${rec.title}" to queue`,
                        });
                      }}
                      aria-label="Add to queue"
                      title="Add to queue"
                      className="p-1.5 rounded-full hover:bg-surface-3 text-content-secondary hover:text-emerald transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HI-RES AUDIO SPECS & CREDITS */}
        {activeTab === 'info' && (
          <div className="max-w-xl mx-auto w-full my-auto p-6 rounded-2xl bg-surface-1/60 border border-white/10 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2 text-emerald">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold font-display text-white">Audio Specifications</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-2/60 border border-white/5 space-y-1">
                <span className="text-content-muted">Codec & Format</span>
                <p className="font-semibold text-white">FLAC Lossless</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/60 border border-white/5 space-y-1">
                <span className="text-content-muted">Sample Rate & Bit Depth</span>
                <p className="font-semibold text-emerald font-mono">96.0 kHz / 24-bit</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/60 border border-white/5 space-y-1">
                <span className="text-content-muted">Dynamic Range</span>
                <p className="font-semibold text-white font-mono">144 dB Master</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-2/60 border border-white/5 space-y-1">
                <span className="text-content-muted">Bitrate</span>
                <p className="font-semibold text-white font-mono">3,072 kbps VBR</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-content-secondary">
              <p>
                <strong className="text-white">Mastering Lab:</strong> SONORA Acoustic Labs Zurich
              </p>
              <p>
                <strong className="text-white">Source:</strong> Original 24-bit studio multi-track master
              </p>
              <p>
                <strong className="text-white">Album:</strong> {currentTrack.albumTitle}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Scrubber & Master Playback Controls */}
      <footer className="relative z-10 max-w-3xl mx-auto w-full px-6 sm:px-8 pt-4 pb-2 space-y-3">
        {/* Dual-Mode Interactive Scrubber (Progress / Waveform) */}
        <TimelineScrubber className="w-full" showModeToggle={true} />

        {/* Master Control Buttons */}
        <div className="flex items-center justify-between sm:justify-center gap-4 sm:gap-8 pt-1">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            title="Toggle shuffle (S)"
            className={cn(
              'relative p-2 transition-colors rounded-full hover:text-white',
              isShuffle ? 'text-emerald' : 'text-content-secondary'
            )}
          >
            <Shuffle className="w-5 h-5" />
            {isShuffle && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald" />
            )}
          </button>

          {/* Skip Previous */}
          <button
            onClick={skipPrevious}
            aria-label="Previous track"
            title="Previous track"
            className="p-2 text-content-secondary hover:text-white transition-transform active:scale-90"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Big Play / Pause Circle */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald text-canvas hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-glow-emerald"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current text-canvas" />
            ) : (
              <Play className="w-7 h-7 fill-current text-canvas ml-1" />
            )}
          </button>

          {/* Skip Next */}
          <button
            onClick={skipNext}
            aria-label="Next track"
            title="Next track"
            className="p-2 text-content-secondary hover:text-white transition-transform active:scale-90"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            aria-label={`Repeat mode: ${repeatMode}`}
            title={`Repeat mode: ${repeatMode}`}
            className={cn(
              'relative p-2 transition-colors rounded-full hover:text-white',
              repeatMode !== 'off' ? 'text-emerald' : 'text-content-secondary'
            )}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald" />
            )}
          </button>

          {/* Volume Control (Desktop inline) */}
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-white/10">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              className="p-1.5 text-content-secondary hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume slider"
              className="w-20 h-1 bg-surface-3 rounded-full appearance-none accent-emerald cursor-pointer"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};
