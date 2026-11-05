import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Sparkles, User, Settings, Check, LogOut, ShieldCheck, Upload } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../stores/useUIStore';
import { LocalAudioImporter } from '../components/player/LocalAudioImporter';
import { ShowcaseTourPill } from '../components/common/ShowcaseTourPill';
import { cn } from '../utils/cn';

export const TopNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const addToast = useUIStore((s) => s.addToast);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    if (location.pathname === '/search') {
      navigate('/search');
    }
  };

  return (
    <header className="h-16 px-4 flex items-center justify-between gap-4 z-30 shrink-0 select-none">
      {/* Left: Brand + Navigation History */}
      <div className="flex items-center gap-3">
        {/* Brand Link */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group pr-2"
        >
          <img src="/logo.svg" alt="SONORA Logo" className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="font-display font-bold text-lg tracking-wider text-white hidden sm:block">
            SONORA
          </span>
        </div>

        {/* History Chevrons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-8 h-8 rounded-full bg-surface-1 hover:bg-surface-2 text-content-secondary hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="w-8 h-8 rounded-full bg-surface-1 hover:bg-surface-2 text-content-secondary hover:text-white flex items-center justify-center transition-colors border border-white/5"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Raycast-Style Sonic Search Trigger */}
      <div className="flex-1 max-w-md mx-auto">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between h-10 px-3.5 rounded-full glass-capsule border border-white/10 text-content-secondary hover:border-emerald/40 hover:text-white transition-all shadow-elevation-1 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="w-4 h-4 shrink-0 text-emerald" />
            <span className="text-xs sm:text-sm text-content-muted group-hover:text-content-primary truncate">
              Search music, lyrics, or type '&gt;' for commands...
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-content-tertiary group-hover:text-emerald group-hover:bg-emerald/10 border border-white/5 transition-colors">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Premium & User Actions */}
      <div className="flex items-center gap-2.5 relative" ref={profileMenuRef}>
        <ShowcaseTourPill />
        <LocalAudioImporter className="hidden lg:flex" />

        <button
          onClick={() => {
            addToast({
              type: 'info',
              message: 'Streaming at Hi-Res 24-bit / 96kHz Lossless FLAC',
            });
          }}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-white/10 text-xs font-semibold text-content-primary transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald" />
          <span>Explore Hi-Fi</span>
        </button>

        <button
          onClick={() => setIsProfileOpen((prev) => !prev)}
          aria-label="User profile"
          className="w-9 h-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-white/10 flex items-center justify-center text-content-primary transition-all hover:scale-105 shadow-elevation-1 focus:outline-none"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Profile Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 top-12 w-64 rounded-xl bg-surface-2/95 backdrop-blur-xl border border-white/10 shadow-elevation-3 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white font-display">Alex Sterling</p>
                <ShieldCheck className="w-4 h-4 text-emerald" />
              </div>
              <p className="text-xs text-content-muted mt-0.5">alex.sterling@sonora.audio</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald/10 border border-emerald/20 text-[10px] font-semibold text-emerald">
                <span>Lossless Hi-Fi Plan</span>
              </div>
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/library');
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-content-secondary hover:text-white hover:bg-surface-3 flex items-center gap-2.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-content-tertiary" />
                <span>Your Profile & Library</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  addToast({
                    type: 'success',
                    message: 'Audio Engine: 24-bit 96kHz Lossless Active',
                  });
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-content-secondary hover:text-white hover:bg-surface-3 flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-content-tertiary" />
                <span>Audio Engine Settings</span>
              </button>
            </div>

            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  addToast({
                    type: 'info',
                    message: 'Session refreshed securely.',
                  });
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-red-400 hover:bg-surface-3 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
