import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Mic2,
  Sliders,
  Command,
  Maximize2,
  Palette,
  X,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useUIStore, THEME_ACCENTS } from '../../stores/useUIStore';
import { mockTracks } from '../../data/mockData';
import { ThemeAccent } from '../../types/ui';
import { cn } from '../../utils/cn';

export const ShowcaseTourPill: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('sonora_tour_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playTrack = useAudioStore((s) => s.playTrack);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);
  const isEQOpen = useAudioStore((s) => s.isEQOpen);

  const setRightPanelMode = useUIStore((s) => s.setRightPanelMode);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);
  const themeAccent = useUIStore((s) => s.themeAccent);
  const setThemeAccent = useUIStore((s) => s.setThemeAccent);
  const addToast = useUIStore((s) => s.addToast);

  // Close popover on outside click or escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const ensureTrackPlaying = () => {
    if (!currentTrack && mockTracks.length > 0) {
      playTrack(mockTracks[0], mockTracks);
    }
  };

  const handleLaunchLyrics = () => {
    ensureTrackPlaying();
    setRightPanelMode('lyrics');
    setIsOpen(false);
    addToast({
      title: 'Time-Synced Depth Lyrics Active',
      message: 'Click any line to seek with spring auto-scroll & Sing Mode',
      type: 'success',
    });
  };

  const handleLaunchEQ = () => {
    if (!isEQOpen) toggleEQ();
    setIsOpen(false);
    addToast({
      title: '5-Band Audiophile Equalizer',
      message: 'Hardware biquad filters: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz',
      type: 'info',
    });
  };

  const handleLaunchPalette = () => {
    setIsOpen(false);
    setCommandPaletteOpen(true);
  };

  const handleLaunchTheatre = () => {
    ensureTrackPlaying();
    setIsOpen(false);
    setTheatreOpen(true);
    addToast({
      title: 'Full-Screen Theatre Visualizer (F)',
      message: 'Living room display with auto-hiding chrome after 4s',
      type: 'success',
    });
  };

  const handleCycleTheme = () => {
    const accents: ThemeAccent[] = ['emerald', 'violet', 'amber', 'rose'];
    const nextIdx = (accents.indexOf(themeAccent) + 1) % accents.length;
    const nextTheme = accents[nextIdx];
    setThemeAccent(nextTheme);
    const meta = THEME_ACCENTS[nextTheme];
    addToast({
      title: `Switched Accent to ${meta.name}`,
      message: 'All dynamic shaders, glows, and badges updated instantly',
      type: 'success',
    });
  };

  const handlePermanentlyDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsOpen(false);
    try {
      localStorage.setItem('sonora_tour_dismissed', 'true');
    } catch {}
    addToast({
      message: 'Showcase tour dismissed. You can reopen anytime via ⌘K > Showcase Tour.',
      type: 'info',
    });
  };

  if (isDismissed) return null;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Signature Tour Trigger Glass Pill */}
      <div className="flex items-center gap-1 bg-surface-2/70 hover:bg-surface-2 p-0.5 rounded-full border border-emerald/30 shadow-glow-emerald transition-all hover:scale-105 group">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald tracking-wide select-none cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald animate-pulse" />
          <span>Explore Features</span>
        </button>

        <button
          onClick={handlePermanentlyDismiss}
          aria-label="Dismiss tour"
          title="Dismiss tour button"
          className="w-5 h-5 rounded-full hover:bg-white/10 text-content-tertiary hover:text-white flex items-center justify-center transition-colors mr-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Floating Showcase Tour Modal */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-surface-1/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] p-4 z-50 animate-in fade-in zoom-in-95 duration-150 select-none text-content-primary">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald" />
                <h3 className="font-display font-bold text-sm text-white tracking-wide">
                  SONORA Showcase Tour
                </h3>
              </div>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Instant one-click demo for evaluators & judges
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close showcase"
              className="p-1 rounded-full text-content-tertiary hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Signature Feature Action Cards */}
          <div className="space-y-1.5 py-3">
            {/* 1. Time-Synced Glow Lyrics */}
            <button
              onClick={handleLaunchLyrics}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-white/5 hover:border-emerald/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald/15 text-emerald flex items-center justify-center shrink-0 border border-emerald/20">
                  <Mic2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-emerald transition-colors">
                    Apple Music Glow Lyrics
                  </p>
                  <p className="text-[11px] text-content-secondary truncate">
                    Depth-of-field blur, smooth spring seek & Sing Mode
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-white transition-colors shrink-0 ml-2" />
            </button>

            {/* 2. 5-Band Audiophile EQ */}
            <button
              onClick={handleLaunchEQ}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-white/5 hover:border-emerald/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">
                    5-Band Hardware EQ (E)
                  </p>
                  <p className="text-[11px] text-content-secondary truncate">
                    Web Audio biquad filters + real-time FFT analyzer
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-white transition-colors shrink-0 ml-2" />
            </button>

            {/* 3. Cmd+K Sonic Palette */}
            <button
              onClick={handleLaunchPalette}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-white/5 hover:border-emerald/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20">
                  <Command className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                    Sonic Command Palette (⌘K)
                  </p>
                  <p className="text-[11px] text-content-secondary truncate">
                    Fuzzy search tracks, albums, and executive action triggers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-white transition-colors shrink-0 ml-2" />
            </button>

            {/* 4. Full-Screen Theatre Visualizer */}
            <button
              onClick={handleLaunchTheatre}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-white/5 hover:border-emerald/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Immersive Theatre View (F)
                  </p>
                  <p className="text-[11px] text-content-secondary truncate">
                    Shared-element morphing + 4s auto-hide living room mode
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-white transition-colors shrink-0 ml-2" />
            </button>

            {/* 5. Dynamic Accent Themes */}
            <button
              onClick={handleCycleTheme}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-white/5 hover:border-emerald/30 transition-all text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                    Switch Accent Theme: {THEME_ACCENTS[themeAccent].name}
                  </p>
                  <p className="text-[11px] text-content-secondary truncate">
                    Click to cycle Electric Emerald, Violet, Cyber Amber, Rose
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-content-tertiary group-hover:text-white transition-colors shrink-0 ml-2" />
            </button>
          </div>

          {/* Footer note */}
          <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-content-tertiary">
            <span>Awwwards Portfolio Showcase</span>
            <button
              onClick={handlePermanentlyDismiss}
              className="hover:text-content-secondary hover:underline"
            >
              Dismiss from header
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
