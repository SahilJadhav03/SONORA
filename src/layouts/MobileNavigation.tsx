import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Play, Pause, Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAudioStore } from '../stores/useAudioStore';
import { useUIStore } from '../stores/useUIStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

// High-frequency 2px progress bar isolated to prevent MobileNavigation parent re-renders
const MiniPlayerScrubber: React.FC = () => {
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      layoutId="now-playing-scrubber"
      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 rounded-b-2xl overflow-hidden pointer-events-none"
    >
      <div
        style={{ width: `${percentage}%` }}
        className="h-full bg-emerald transition-all duration-150"
      />
    </motion.div>
  );
};

export const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const skipNext = useAudioStore((s) => s.skipNext);
  const skipPrevious = useAudioStore((s) => s.skipPrevious);

  const isTheatreOpen = useUIStore((s) => s.isTheatreOpen);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);

  const isLiked = currentTrack ? useLibraryStore((s) => s.isLiked(currentTrack.id)) : false;
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);

  return (
    <>
      {/* 1. FLOATING GLASS PILL MINI-PLAYER WITH SHARED-ELEMENT MORPHING */}
      <AnimatePresence>
        {currentTrack && !isTheatreOpen && (
          <motion.div
            layoutId="now-playing-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.25, bottom: 0.05 }}
            onDragEnd={(_, { offset, velocity }) => {
              if (offset.y < -30 || velocity.y < -200) {
                setTheatreOpen(true);
              }
            }}
            onClick={() => setTheatreOpen(true)}
            className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 h-16 rounded-2xl bg-surface-2/90 backdrop-blur-2xl border border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center px-3 gap-3 md:hidden cursor-pointer select-none overflow-hidden"
          >
            {/* Audio-Reactive Bass Halo on Mini Pill */}
            <div
              className="absolute -inset-1 rounded-2xl filter blur-md pointer-events-none transition-all duration-75"
              style={{
                backgroundColor: currentTrack.accentColor || '#00F59B',
                opacity: 'calc(0.12 + var(--sonora-bass, 0) * 0.35)',
              }}
            />

            {/* Shared-Element Artwork */}
            <motion.img
              layoutId="now-playing-cover"
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              onError={handleImageError}
              className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm border border-white/10 relative z-10"
            />

            {/* Horizontal Swipeable Track Title & Artist (Swipe to Skip) */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, { offset, velocity }) => {
                if (offset.x < -45 || velocity.x < -200) {
                  skipNext();
                } else if (offset.x > 45 || velocity.x > 200) {
                  skipPrevious();
                }
              }}
              className="flex-1 min-w-0 cursor-grab active:cursor-grabbing relative z-10 py-1"
            >
              <motion.p
                layoutId="now-playing-title"
                className="text-xs font-bold text-white truncate font-display leading-tight"
              >
                {currentTrack.title}
              </motion.p>
              <motion.p
                layoutId="now-playing-artist"
                className="text-[11px] text-content-secondary truncate leading-tight mt-0.5"
              >
                {currentTrack.artistName}
              </motion.p>
            </motion.div>

            {/* Action Buttons (Strict min 44x44px touch targets) */}
            <div className="flex items-center gap-1 shrink-0 relative z-10">
              <button
                type="button"
                aria-label={isLiked ? 'Unlike track' : 'Like track'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikeTrack(currentTrack.id);
                }}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-content-secondary hover:text-emerald active:scale-95 transition-transform"
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current text-emerald')} />
              </button>

              <button
                type="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                className="min-w-[44px] min-h-[44px] rounded-full bg-white text-canvas flex items-center justify-center shadow-md active:scale-90 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Shared-Element 2px Scrubber Line along pill bottom */}
            <MiniPlayerScrubber />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PERSISTENT MOBILE BOTTOM TAB BAR WITH SAFE AREA INSET */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-[calc(3.75rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-surface-0/95 backdrop-blur-2xl border-t border-white/[0.08] flex items-center justify-around px-2 md:hidden select-none">
        <button
          type="button"
          onClick={() => navigate('/')}
          className={cn(
            'min-h-[44px] min-w-[64px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors',
            location.pathname === '/' ? 'text-emerald font-semibold' : 'text-content-secondary hover:text-white'
          )}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className={cn(
            'min-h-[44px] min-w-[64px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors',
            location.pathname === '/search' ? 'text-emerald font-semibold' : 'text-content-secondary hover:text-white'
          )}
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/library')}
          className={cn(
            'min-h-[44px] min-w-[64px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium transition-colors',
            location.pathname === '/library' ? 'text-emerald font-semibold' : 'text-content-secondary hover:text-white'
          )}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </button>
      </nav>
    </>
  );
};
