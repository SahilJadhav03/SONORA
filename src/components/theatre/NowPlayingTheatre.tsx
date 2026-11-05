import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  Mic2,
  ListMusic,
  Activity,
  Maximize2,
  Minimize2,
  Sliders,
  Sparkles,
  Share2,
  Volume2,
  VolumeX,
  GripVertical,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { useUIStore } from '../../stores/useUIStore';
import { TimeSyncedLyrics } from '../lyrics/TimeSyncedLyrics';
import { AudioVisualizerCanvas } from '../player/AudioVisualizerCanvas';
import { TimelineScrubber } from '../player/TimelineScrubber';
import { PlayerControls } from '../player/PlayerControls';
import { VolumeControl } from '../player/VolumeControl';
import { formatTime, formatNumber } from '../../utils/formatters';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

type TheatreTab = 'lyrics' | 'visualizer' | 'queue';

export const NowPlayingTheatre: React.FC = () => {
  const navigate = useNavigate();
  const isTheatreOpen = useUIStore((s) => s.isTheatreOpen);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);
  const isEQOpen = useAudioStore((s) => s.isEQOpen);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const queue = useAudioStore((s) => s.queue);
  const reorderQueue = useAudioStore((s) => s.reorderQueue);
  const removeFromQueue = useAudioStore((s) => s.removeFromQueue);
  const playTrack = useAudioStore((s) => s.playTrack);
  const isSingMode = useAudioStore((s) => s.isSingMode);
  const toggleSingMode = useAudioStore((s) => s.toggleSingMode);

  const isLiked = currentTrack ? useLibraryStore((s) => s.isLiked(currentTrack.id)) : false;
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<TheatreTab>('lyrics');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  // 4-Second Inactivity Auto-Hide ("TV / Living Room Mode")
  useEffect(() => {
    if (!isTheatreOpen) return;

    const resetIdleTimer = () => {
      setIsIdle(false);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, 4000);
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
    };
  }, [isTheatreOpen]);

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleClose = () => {
    setTheatreOpen(false);
    if (window.location.pathname === '/now-playing') {
      navigate(-1);
    }
  };

  if (!isTheatreOpen || !currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        layoutId="now-playing-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragEnd={(_, { offset, velocity }) => {
          if (offset.y > 100 || velocity.y > 300) {
            handleClose();
          }
        }}
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-canvas text-white select-none overflow-hidden',
          isIdle ? 'cursor-none' : ''
        )}
      >
        {/* Dynamic Blurred Artwork Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${currentTrack.accentColor || '#00F59B'}40 0%, transparent 70%)`,
          }}
        />

        {/* ======================================================== */}
        {/* TOP BAR CHROME (Auto-fades on idle)                      */}
        {/* ======================================================== */}
        <header
          className={cn(
            'relative z-20 h-16 px-4 sm:px-8 flex items-center justify-between border-b border-white/[0.06] bg-surface-0/60 backdrop-blur-xl transition-opacity duration-500',
            isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          {/* Mobile Pull Handle / Back Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              aria-label="Minimize player"
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-content-secondary hover:text-white transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-bold tracking-widest text-content-tertiary">
                Playing From
              </span>
              <p className="text-xs font-semibold text-white truncate max-w-xs">
                {currentTrack.albumTitle}
              </p>
            </div>
          </div>

          {/* Center Tabs Switcher */}
          <div className="flex items-center gap-1 bg-surface-2/80 p-1 rounded-full border border-white/10 shadow-sm">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={cn(
                'px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all',
                activeTab === 'lyrics'
                  ? 'bg-emerald text-canvas font-bold shadow-glow-emerald'
                  : 'text-content-secondary hover:text-white'
              )}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={() => setActiveTab('visualizer')}
              className={cn(
                'px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all',
                activeTab === 'visualizer'
                  ? 'bg-emerald text-canvas font-bold shadow-glow-emerald'
                  : 'text-content-secondary hover:text-white'
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Spectrum</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                'px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all',
                activeTab === 'queue'
                  ? 'bg-emerald text-canvas font-bold shadow-glow-emerald'
                  : 'text-content-secondary hover:text-white'
              )}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleEQ}
              aria-label="Toggle EQ"
              className={cn(
                'p-2 rounded-full transition-colors hidden sm:block',
                isEQOpen ? 'text-emerald bg-emerald/10' : 'text-content-secondary hover:text-white hover:bg-white/10'
              )}
              title="5-Band Equalizer"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="p-2 rounded-full hover:bg-white/10 text-content-secondary hover:text-white transition-colors"
              title="Living Room / TV Mode"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Mobile Pull Handle Indicator */}
        <div className="w-full flex justify-center pt-2 md:hidden">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {/* ======================================================== */}
        {/* CENTRAL HERO GRID (Left: Artwork, Right: Focal Tab)      */}
        {/* ======================================================== */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden">
          {/* LEFT COLUMN: Large Floating Album Artwork + Beat Halo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center lg:text-left space-y-6">
            <div className="relative group w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px] shrink-0">
              {/* Audio-Reactive Bass Energy Halo */}
              <div
                className="absolute -inset-4 rounded-2xl filter blur-2xl pointer-events-none transition-all duration-75"
                style={{
                  backgroundColor: currentTrack.accentColor || '#00F59B',
                  transform: 'scale(calc(1 + var(--sonora-bass, 0) * 0.24))',
                  opacity: 'calc(0.3 + var(--sonora-bass, 0) * 0.6)',
                }}
              />

              {/* Shared Element Animated Artwork */}
              <motion.img
                layoutId="now-playing-cover"
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                onError={handleImageError}
                className="w-full h-full rounded-2xl object-cover shadow-[0_30px_70px_rgba(0,0,0,0.85)] border border-white/15 relative z-10"
              />
            </div>

            {/* Metadata and Quick Actions */}
            <div className="w-full max-w-sm space-y-2 z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <motion.h2
                    layoutId="now-playing-title"
                    className="text-2xl sm:text-3xl font-extrabold font-display text-white truncate tracking-tight"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </motion.h2>
                  <motion.p
                    layoutId="now-playing-artist"
                    onClick={() => {
                      navigate(`/artist/${currentTrack.artistId}`);
                      handleClose();
                    }}
                    className="text-sm sm:text-base text-content-secondary truncate hover:text-white cursor-pointer mt-0.5"
                  >
                    {currentTrack.artistName}
                  </motion.p>
                </div>

                <button
                  onClick={() => toggleLikeTrack(currentTrack.id)}
                  aria-label={isLiked ? 'Remove from Liked' : 'Save to Liked'}
                  className={cn(
                    'p-2.5 rounded-full backdrop-blur-md border transition-all shrink-0',
                    isLiked
                      ? 'bg-emerald text-canvas border-emerald shadow-glow-emerald'
                      : 'bg-white/5 text-content-secondary border-white/10 hover:text-white hover:scale-110'
                  )}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current text-emerald')} />
                </button>
              </div>

              {/* Badges: Audio Master & Sonic DNA */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald/15 text-emerald border border-emerald/25 flex items-center gap-1 font-mono">
                  <Sparkles className="w-2.5 h-2.5" />
                  {currentTrack.audioQuality || 'LOSSLESS 24-BIT / 96kHz'}
                </span>
                {currentTrack.bpm && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-content-secondary border border-white/10">
                    {currentTrack.bpm} BPM
                  </span>
                )}
                {currentTrack.musicalKey && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-content-secondary border border-white/10">
                    {currentTrack.musicalKey}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Focal Mode (Lyrics / Spectrum / Queue) */}
          <div className="lg:col-span-7 h-full max-h-[480px] w-full flex flex-col justify-center overflow-hidden">
            {/* TAB 1: TIME-SYNCED GLOW LYRICS */}
            {activeTab === 'lyrics' && (
              <div className="h-full w-full flex flex-col">
                <TimeSyncedLyrics variant="theatre" showSingModeToggle={true} />
              </div>
            )}

            {/* TAB 2: FULL-WIDTH AUDIO SPECTRUM VISUALIZER */}
            {activeTab === 'visualizer' && (
              <div className="h-full flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-1/40 border border-white/10 backdrop-blur-xl text-center space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Real-Time FFT Audio Visualizer
                  </h3>
                  <p className="text-xs text-content-secondary mt-1">
                    Rendering 60fps Web Audio API AnalyserNode frequency bins
                  </p>
                </div>

                <div className="w-full max-w-xl py-6 flex justify-center">
                  <AudioVisualizerCanvas width={480} height={110} barCount={44} className="w-full" />
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md w-full text-xs font-mono">
                  <div className="p-3 rounded-xl bg-surface-2/60 border border-white/5">
                    <span className="text-[10px] text-content-tertiary block">BASS RESPONSE</span>
                    <span className="text-sm font-bold text-emerald">Sub 60-250Hz</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2/60 border border-white/5">
                    <span className="text-[10px] text-content-tertiary block">VOCAL MIDRANGE</span>
                    <span className="text-sm font-bold text-violet-400">910-3.6kHz</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-2/60 border border-white/5">
                    <span className="text-[10px] text-content-tertiary block">TREBLE AIR</span>
                    <span className="text-sm font-bold text-sky-400">14kHz+ Shelf</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: UP NEXT QUEUE */}
            {activeTab === 'queue' && (
              <div className="h-full flex flex-col p-6 rounded-2xl bg-surface-1/40 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-content-tertiary">
                    Upcoming Tracks ({queue.length})
                  </span>
                  <span className="text-[11px] text-emerald font-mono">Drag to Reorder</span>
                </div>

                <div className="flex-1 overflow-y-auto sonora-scrollbar space-y-1.5 py-3">
                  {queue.length === 0 ? (
                    <div className="py-12 text-center text-xs text-content-muted">
                      Queue is currently empty.
                    </div>
                  ) : (
                    <Reorder.Group axis="y" values={queue} onReorder={reorderQueue} className="space-y-1.5">
                      {queue.map((track, i) => (
                        <Reorder.Item
                          key={track.id}
                          value={track}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 transition-colors cursor-pointer group border border-white/5"
                        >
                          <div className="cursor-grab active:cursor-grabbing text-content-tertiary hover:text-white p-0.5">
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            onError={handleImageError}
                            onClick={() => playTrack(track, queue)}
                            className="w-10 h-10 rounded-md object-cover shadow shrink-0"
                          />
                          <div onClick={() => playTrack(track, queue)} className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white group-hover:text-emerald truncate">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-content-secondary truncate">{track.artistName}</p>
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-content-tertiary">
                            {formatTime(track.duration)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(i);
                            }}
                            className="p-1 text-content-tertiary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM PLAYBACK DECK (Auto-fades on idle)                */}
        {/* ======================================================== */}
        <footer
          className={cn(
            'relative z-20 w-full max-w-4xl mx-auto px-6 py-4 flex flex-col items-center gap-3 transition-opacity duration-500 pb-[calc(1rem+env(safe-area-inset-bottom))]',
            isIdle ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          {/* Shared Element Scrubber */}
          <motion.div layoutId="now-playing-scrubber" className="w-full">
            <TimelineScrubber className="w-full" />
          </motion.div>

          {/* Primary Controls */}
          <div className="w-full flex items-center justify-between gap-4">
            {/* Left Mute / Audio DNA */}
            <div className="w-1/4 hidden sm:flex items-center gap-2">
              <button
                onClick={toggleSingMode}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5',
                  isSingMode
                    ? 'bg-gradient-to-r from-violet-600 to-emerald text-white border-transparent shadow-glow-emerald'
                    : 'bg-white/5 text-content-secondary border-white/10 hover:text-white'
                )}
                title="Apple Music Sing Mode (Vocal Attenuation)"
              >
                <Mic2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sing Mode</span>
              </button>
            </div>

            {/* Center Controls */}
            <div className="flex-1 flex justify-center">
              <PlayerControls />
            </div>

            {/* Right Volume Control */}
            <div className="w-1/4 hidden sm:flex items-center justify-end">
              <VolumeControl />
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
