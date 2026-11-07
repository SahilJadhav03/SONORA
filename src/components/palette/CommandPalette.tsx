import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Command,
  Play,
  Sliders,
  Heart,
  FolderPlus,
  Palette,
  Mic2,
  Trash2,
  Shuffle,
  Maximize2,
  Library,
  Upload,
  User,
  Disc,
  ListMusic,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { useUIStore, THEME_ACCENTS } from '../../stores/useUIStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { mockTracks, mockAlbums, mockArtists, mockPlaylists } from '../../data/mockData';
import { Track, Album, Artist, Playlist } from '../../types/music';
import { ThemeAccent } from '../../types/ui';
import { searchAllMusic } from '../../services/musicApi';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

interface QuickAction {
  id: string;
  type: 'action';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  handler: () => void;
  accent?: string;
}

type PaletteItem =
  | QuickAction
  | (Track & { type: 'track'; matchLyricSnippet?: string })
  | (Artist & { type: 'artist' })
  | (Album & { type: 'album' })
  | (Playlist & { type: 'playlist' });

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const isCommandPaletteOpen = useUIStore((s) => s.isCommandPaletteOpen);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);
  const setRightPanelMode = useUIStore((s) => s.setRightPanelMode);
  const setThemeAccent = useUIStore((s) => s.setThemeAccent);
  const themeAccent = useUIStore((s) => s.themeAccent);
  const openPlaylistModal = useUIStore((s) => s.openPlaylistModal);
  const addToast = useUIStore((s) => s.addToast);
  const addSearchHistory = useUIStore((s) => s.addSearchHistory);

  const playTrack = useAudioStore((s) => s.playTrack);
  const playNextTrack = useAudioStore((s) => s.playNextTrack);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);
  const toggleSingMode = useAudioStore((s) => s.toggleSingMode);
  const clearQueue = useAudioStore((s) => s.clearQueue);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);

  const customPlaylists = useLibraryStore((s) => s.customPlaylists);
  const likedTrackIds = useLibraryStore((s) => s.likedTrackIds);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [liveTracks, setLiveTracks] = useState<Track[]>([]);
  const localTracks = useAudioStore((s) => s.localTracks);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setLiveTracks([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Query live streaming tracks from Audius and iTunes on user typing
  useEffect(() => {
    const clean = query.trim();
    if (!clean || clean.startsWith('>')) {
      setLiveTracks([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchAllMusic(clean, 'all', 6);
        setLiveTracks(results);
      } catch {}
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Command palette actions
  const quickActions: QuickAction[] = [
    {
      id: 'action-eq',
      type: 'action',
      title: '> Toggle 5-Band Equalizer',
      subtitle: 'Open or close the audiophile EQ canvas',
      icon: Sliders,
      handler: () => toggleEQ(),
    },
    {
      id: 'action-play-liked',
      type: 'action',
      title: '> Play Liked Songs',
      subtitle: `Start continuous playback of your ${likedTrackIds.length} liked tracks`,
      icon: Heart,
      handler: () => {
        const liked = mockTracks.filter((t) => likedTrackIds.includes(t.id));
        if (liked.length > 0) {
          playTrack(liked[0], liked);
          addToast({
            title: 'Playing Liked Songs',
            message: `${liked.length} tracks in queue`,
            type: 'success',
          });
        }
      },
    },
    {
      id: 'action-create-playlist',
      type: 'action',
      title: '> Create Playlist',
      subtitle: 'Open custom cover generator & playlist builder',
      icon: FolderPlus,
      handler: () => openPlaylistModal('create'),
    },
    {
      id: 'action-sing-mode',
      type: 'action',
      title: '> Toggle Sing Mode',
      subtitle: 'Attenuate vocal frequencies for karaoke sing-along',
      icon: Mic2,
      handler: () => toggleSingMode(),
    },
    {
      id: 'action-theme-emerald',
      type: 'action',
      title: '> Switch Theme: Electric Emerald',
      subtitle: 'Vibrant neon green luxury aesthetic',
      icon: Palette,
      accent: '#00F59B',
      handler: () => setThemeAccent('emerald'),
    },
    {
      id: 'action-theme-violet',
      type: 'action',
      title: '> Switch Theme: Electric Violet',
      subtitle: 'Sophisticated deep purple & neon violet',
      icon: Palette,
      accent: '#A855F7',
      handler: () => setThemeAccent('violet'),
    },
    {
      id: 'action-theme-amber',
      type: 'action',
      title: '> Switch Theme: Cyber Amber',
      subtitle: 'Warm high-contrast analog amber aesthetic',
      icon: Palette,
      accent: '#F59E0B',
      handler: () => setThemeAccent('amber'),
    },
    {
      id: 'action-theme-rose',
      type: 'action',
      title: '> Switch Theme: Rose Quartz',
      subtitle: 'Lush velvet pink & ruby highlights',
      icon: Palette,
      accent: '#FB7185',
      handler: () => setThemeAccent('rose'),
    },
    {
      id: 'action-shuffle-all',
      type: 'action',
      title: '> Shuffle All Tracks',
      subtitle: 'Randomize and play entire music vault',
      icon: Shuffle,
      handler: () => {
        const shuffled = [...mockTracks].sort(() => Math.random() - 0.5);
        playTrack(shuffled[0], shuffled);
        toggleShuffle();
        addToast({ title: 'Vault Shuffled', message: 'Playing all tracks on shuffle', type: 'success' });
      },
    },
    {
      id: 'action-theatre',
      type: 'action',
      title: '> Open Full-Screen Theatre (F)',
      subtitle: 'Immersive full-bleed player with beat halo',
      icon: Maximize2,
      handler: () => setTheatreOpen(true),
    },
    {
      id: 'action-showcase-tour',
      type: 'action',
      title: '> Launch Signature Showcase Tour',
      subtitle: 'Instant one-click demo for recruiters, evaluators & judges',
      icon: Sparkles,
      accent: '#00F59B',
      handler: () => {
        try {
          localStorage.removeItem('sonora_tour_dismissed');
        } catch {}
        setRightPanelMode('lyrics');
        addToast({
          title: '✨ Showcase Tour Active',
          message: 'Explore lyrics, 5-band EQ (E), and full-screen theatre (F)',
          type: 'success',
        });
      },
    },
    {
      id: 'action-library',
      type: 'action',
      title: '> Open Library',
      subtitle: 'View your playlists, saved albums, and artists',
      icon: Library,
      handler: () => navigate('/library'),
    },
    {
      id: 'action-clear-queue',
      type: 'action',
      title: '> Clear Queue',
      subtitle: 'Remove all pending upcoming tracks',
      icon: Trash2,
      handler: () => {
        clearQueue();
        addToast({ title: 'Queue Cleared', message: 'All upcoming tracks cleared', type: 'info' });
      },
    },
  ];

  // Filter items
  const cleanQ = query.trim().toLowerCase();
  const isActionOnly = cleanQ.startsWith('>');

  let filteredItems: PaletteItem[] = [];

  if (isActionOnly) {
    const actionSearch = cleanQ.slice(1).trim();
    filteredItems = quickActions.filter((a) =>
      a.title.toLowerCase().includes(actionSearch) || a.subtitle.toLowerCase().includes(actionSearch)
    );
  } else if (cleanQ) {
    // 0. Primary Action: Jump to full Discover Multi-Source Search
    const searchInDiscoverAction: QuickAction = {
      id: 'action-search-discover',
      type: 'action',
      title: `Search "${query.trim()}" in Discover`,
      subtitle: 'Stream full tracks on Audius, Apple Music previews, and lyrics',
      icon: Search,
      handler: () => {
        setCommandPaletteOpen(false);
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      },
    };

    // 1. Actions matching
    const matchingActions = quickActions.filter(
      (a) => a.title.toLowerCase().includes(cleanQ) || a.subtitle.toLowerCase().includes(cleanQ)
    );

    // 2. Tracks matching: Live Audius/Apple tracks, local tracks, and curated mock tracks
    const matchingTracks: PaletteItem[] = [];

    // Add live public API tracks (Audius & iTunes)
    liveTracks.forEach((t) => {
      matchingTracks.push({
        ...t,
        type: 'track' as const,
      });
    });

    // Add local uploaded tracks
    localTracks.forEach((t) => {
      if (
        t.title.toLowerCase().includes(cleanQ) ||
        t.artistName.toLowerCase().includes(cleanQ) ||
        t.albumTitle.toLowerCase().includes(cleanQ)
      ) {
        matchingTracks.push({
          ...t,
          type: 'track' as const,
        });
      }
    });

    // Add curated mock tracks
    mockTracks.forEach((t) => {
      const inTitle = t.title.toLowerCase().includes(cleanQ);
      const inArtist = t.artistName.toLowerCase().includes(cleanQ);
      const matchingLine = t.lyrics?.find((l) => l.text.toLowerCase().includes(cleanQ));

      if (inTitle || inArtist || matchingLine) {
        matchingTracks.push({
          ...t,
          type: 'track' as const,
          matchLyricSnippet: matchingLine?.text,
        });
      }
    });

    // 3. Artists
    const matchingArtists: PaletteItem[] = mockArtists
      .filter((a) => a.name.toLowerCase().includes(cleanQ) || a.genres.some((g) => g.toLowerCase().includes(cleanQ)))
      .map((a) => ({ ...a, type: 'artist' as const }));

    // 4. Albums
    const matchingAlbums: PaletteItem[] = mockAlbums
      .filter((a) => a.title.toLowerCase().includes(cleanQ) || a.artistName.toLowerCase().includes(cleanQ))
      .map((a) => ({ ...a, type: 'album' as const }));

    // 5. Playlists
    const allPlaylists = [...customPlaylists, ...mockPlaylists];
    const matchingPlaylists: PaletteItem[] = allPlaylists
      .filter((p) => p.title.toLowerCase().includes(cleanQ))
      .map((p) => ({ ...p, type: 'playlist' as const }));

    filteredItems = [
      searchInDiscoverAction,
      ...matchingActions,
      ...matchingTracks,
      ...matchingArtists,
      ...matchingAlbums,
      ...matchingPlaylists,
    ];
  } else {
    // Default initial items when search is empty: popular actions + top tracks
    filteredItems = [
      ...quickActions.slice(0, 5),
      ...mockTracks.slice(0, 4).map((t) => ({ ...t, type: 'track' as const })),
    ];
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (!selected) return;

      if (e.shiftKey && selected.type === 'track') {
        // Shift + Enter: Play Next in Queue
        playNextTrack(selected);
        setCommandPaletteOpen(false);
        addToast({
          title: 'Playing Next',
          message: `"${selected.title}" queued next`,
          imageUrl: selected.coverUrl,
          type: 'success',
        });
        return;
      }

      executeItem(selected);
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  const executeItem = (item: PaletteItem) => {
    if (query.trim()) addSearchHistory(query.trim());

    if (item.type === 'action') {
      item.handler();
      setCommandPaletteOpen(false);
    } else if (item.type === 'track') {
      playTrack(item);
      setCommandPaletteOpen(false);
      addToast({
        title: 'Playing Track',
        message: `${item.title} • ${item.artistName}`,
        imageUrl: item.coverUrl,
        type: 'success',
      });
    } else if (item.type === 'artist') {
      navigate(`/artist/${item.id}`);
      setCommandPaletteOpen(false);
    } else if (item.type === 'album') {
      navigate(`/album/${item.id}`);
      setCommandPaletteOpen(false);
    } else if (item.type === 'playlist') {
      navigate(`/playlist/${item.id}`);
      setCommandPaletteOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-surface-1/95 backdrop-blur-3xl border border-white/10 shadow-[0_28px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.14)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-emerald shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tracks, artists, albums, lyrics, or type '>' for actions..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-content-muted focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-xs text-content-tertiary hover:text-white px-1.5 py-0.5 rounded bg-white/5"
            >
              Clear
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-content-tertiary">
                ESC
              </kbd>
            </div>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto sonora-scrollbar p-2 space-y-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-content-muted text-xs">
              No results found for "{query}". Try typing <span className="text-emerald font-mono">&gt;</span> for quick actions.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={`${item.type}-${'id' in item ? item.id : idx}`}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-emerald/15 border-emerald/30 shadow-sm text-white'
                      : 'border-transparent text-content-secondary hover:bg-surface-2/60 hover:text-white'
                  )}
                >
                  {/* Left Icon / Thumbnail */}
                  <div className="flex items-center gap-3 min-w-0">
                    {item.type === 'action' && (
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                        style={{ backgroundColor: item.accent ? `${item.accent}25` : 'rgba(255,255,255,0.06)' }}
                      >
                        <item.icon className="w-4 h-4 text-emerald" />
                      </div>
                    )}

                    {item.type === 'track' && (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        onError={handleImageError}
                        className="w-9 h-9 rounded-md object-cover shadow border border-white/10 shrink-0"
                      />
                    )}

                    {item.type === 'artist' && (
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        onError={handleImageError}
                        className="w-9 h-9 rounded-full object-cover shadow border border-white/10 shrink-0"
                      />
                    )}

                    {item.type === 'album' && (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        onError={handleImageError}
                        className="w-9 h-9 rounded-md object-cover shadow border border-white/10 shrink-0"
                      />
                    )}

                    {item.type === 'playlist' && (
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        onError={handleImageError}
                        className="w-9 h-9 rounded-md object-cover shadow border border-white/10 shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate font-display">
                          {item.type === 'action' && item.title}
                          {item.type === 'track' && item.title}
                          {item.type === 'artist' && item.name}
                          {item.type === 'album' && item.title}
                          {item.type === 'playlist' && item.title}
                        </p>
                        {item.type === 'track' && item.sourceBadge && (
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold tracking-wider shrink-0 border',
                              item.source === 'audius'
                                ? 'bg-emerald/15 text-emerald border-emerald/30'
                                : item.source === 'itunes'
                                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                                : item.source === 'local'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-white/10 text-content-secondary border-white/10'
                            )}
                          >
                            {item.sourceBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-content-secondary truncate">
                        {item.type === 'action' && item.subtitle}
                        {item.type === 'track' && `${item.artistName} • ${item.albumTitle}`}
                        {item.type === 'artist' && `Artist • ${item.genres.slice(0, 2).join(', ')}`}
                        {item.type === 'album' && `Album • ${item.artistName} (${item.releaseYear})`}
                        {item.type === 'playlist' && `Playlist • ${item.creatorName} (${item.tracksCount} tracks)`}
                      </p>
                      {item.type === 'track' && item.matchLyricSnippet && (
                        <p className="text-[10px] text-emerald truncate flex items-center gap-1 mt-0.5">
                          <Mic2 className="w-2.5 h-2.5 shrink-0" />
                          <span>Lyric: "{item.matchLyricSnippet}"</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badge / Key Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-content-tertiary capitalize">
                      {item.type}
                    </span>
                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald">
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-surface-2/40 flex items-center justify-between text-[11px] text-content-tertiary">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">↵</kbd>
              <span>Select / Play</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">⇧↵</kbd>
              <span>Play Next</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono text-white text-[10px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
          </div>
          <span className="text-[10px] text-emerald font-medium">SONORA Command Engine</span>
        </div>
      </div>
    </div>
  );
};
