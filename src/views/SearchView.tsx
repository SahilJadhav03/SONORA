import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Play,
  Sparkles,
  Filter,
  History,
  Command,
  Moon,
  Zap,
  Compass,
  Sliders,
  Music2,
  Globe,
  Radio,
  Music,
  HardDrive,
  Loader2,
  Upload,
} from 'lucide-react';
import { musicRepository } from '../data/repository/MockMusicRepository';
import { SearchResults } from '../data/repository/IMusicRepository';
import { GenreCategory, Track, Artist, Album, Playlist, MusicSourceFilter } from '../types/music';
import {
  searchAllMusic,
  searchAudiusTracks,
  searchItunesCatalog,
  fetchAudiusTrending,
} from '../services/musicApi';
import { CategoryCard } from '../components/cards/CategoryCard';
import { TracklistTable } from '../components/table/TracklistTable';
import { AlbumCard } from '../components/cards/AlbumCard';
import { ArtistCard } from '../components/cards/ArtistCard';
import { PlaylistCard } from '../components/cards/PlaylistCard';
import { EmptyState } from '../components/feedback/EmptyState';
import { LocalAudioImporter } from '../components/player/LocalAudioImporter';
import { useAudioStore } from '../stores/useAudioStore';
import { useUIStore } from '../stores/useUIStore';
import { useContextMenuStore } from '../stores/useContextMenuStore';
import { handleImageError } from '../utils/imageFallback';
import { cn } from '../utils/cn';

type FilterType = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';
type SonicMood = 'All' | 'Chill' | 'High Energy' | 'Late Night' | 'Focus' | 'Bass Heavy' | 'Instrumental';

const SOURCE_PILLS: {
  id: MusicSourceFilter;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All Sources', badge: 'Multi-Source', icon: Globe },
  { id: 'audius', label: 'Full Tracks (Audius)', badge: '320kbps MP3', icon: Radio },
  { id: 'itunes', label: 'Global Catalog (Apple)', badge: 'Apple Music', icon: Music },
  { id: 'local', label: 'My Local Files', badge: 'Lossless Vault', icon: HardDrive },
];

const SONIC_PILLS: { id: SonicMood; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'All', label: 'All Moods', icon: Sparkles },
  { id: 'Chill', label: 'Chill', icon: Moon },
  { id: 'High Energy', label: 'High Energy', icon: Zap },
  { id: 'Late Night', label: 'Late Night', icon: Moon },
  { id: 'Focus', label: 'Focus', icon: Compass },
  { id: 'Bass Heavy', label: 'Bass Heavy', icon: Sliders },
  { id: 'Instrumental', label: 'Instrumental', icon: Music2 },
];

export const SearchView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  const [categories, setCategories] = useState<GenreCategory[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [activeMood, setActiveMood] = useState<SonicMood>('All');
  const [sourceFilter, setSourceFilter] = useState<MusicSourceFilter>('all');
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [audiusTrending, setAudiusTrending] = useState<Track[]>([]);

  // Sync search input with URL param changes
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleInputChange = (val: string) => {
    setSearchInput(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  };

  const localTracks = useAudioStore((s) => s.localTracks);
  const playTrack = useAudioStore((s) => s.playTrack);
  const searchHistory = useUIStore((s) => s.searchHistory);
  const removeSearchHistoryItem = useUIStore((s) => s.removeSearchHistoryItem);
  const clearSearchHistory = useUIStore((s) => s.clearSearchHistory);
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const openContextMenu = useContextMenuStore((s) => s.openContextMenu);

  const [results, setResults] = useState<SearchResults>({
    tracks: [],
    albums: [],
    artists: [],
    playlists: [],
  });

  const searchSuggestions = [
    'Aetheric Mirage',
    'Electronic & Synth',
    'Deep Ambient',
    'Kira Sterling',
    'Post-Rock',
    'Velvet Horizon',
    'Disco Mirage',
  ];

  useEffect(() => {
    musicRepository.getGenres().then(setCategories);
  }, []);

  // Fetch Audius trending when Audius tab is selected
  useEffect(() => {
    if (sourceFilter === 'audius' && audiusTrending.length === 0) {
      fetchAudiusTrending(24).then(setAudiusTrending);
    }
  }, [sourceFilter, audiusTrending.length]);

  // Main debounced search effect across public APIs and local repository
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tracks: [], albums: [], artists: [], playlists: [] });
      setIsSearchingRemote(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingRemote(true);
      const cleanQ = query.trim().toLowerCase();

      try {
        // 1. Curated mock repository search
        const repoResults = await musicRepository.search(query);

        // 2. Filter local imported files
        const matchingLocalTracks = localTracks.filter(
          (t) =>
            t.title.toLowerCase().includes(cleanQ) ||
            t.artistName.toLowerCase().includes(cleanQ) ||
            t.albumTitle.toLowerCase().includes(cleanQ)
        );

        // 3. Multi-source public API queries
        let remoteTracks: Track[] = [];

        if (sourceFilter === 'audius') {
          remoteTracks = await searchAudiusTracks(query, 30);
        } else if (sourceFilter === 'itunes') {
          remoteTracks = await searchItunesCatalog(query, 30);
        } else if (sourceFilter === 'local') {
          remoteTracks = [];
        } else {
          // 'all': parallel query Audius + iTunes
          remoteTracks = await searchAllMusic(query, 'all', 30);
        }

        // 4. Merge tracks based on active source filter
        let mergedTracks: Track[] = [];
        if (sourceFilter === 'local') {
          mergedTracks = matchingLocalTracks;
        } else if (sourceFilter === 'audius' || sourceFilter === 'itunes') {
          mergedTracks = remoteTracks;
        } else {
          // 'all': prioritize local matches, then live remote tracks, then curated mock tracks
          mergedTracks = [...matchingLocalTracks, ...remoteTracks, ...repoResults.tracks];
        }

        // Deduplicate tracks by id
        const seenIds = new Set<string>();
        const uniqueTracks = mergedTracks.filter((t) => {
          if (seenIds.has(t.id)) return false;
          seenIds.add(t.id);
          return true;
        });

        setResults({
          tracks: uniqueTracks,
          albums: sourceFilter === 'local' ? [] : repoResults.albums,
          artists: sourceFilter === 'local' ? [] : repoResults.artists,
          playlists: sourceFilter === 'local' ? [] : repoResults.playlists,
          topResult: uniqueTracks[0] || repoResults.topResult,
        });
      } catch (err) {
        console.warn('Search query error:', err);
      } finally {
        setIsSearchingRemote(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, sourceFilter, localTracks]);

  const handleQueryChange = (newQ: string) => {
    setSearchInput(newQ);
    if (newQ.trim()) {
      setSearchParams({ q: newQ.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryClick = (cat: GenreCategory) => {
    handleQueryChange(cat.title);
  };

  // Filter tracks by active sonic mood if selected
  const moodFilteredTracks = results.tracks.filter((t) => {
    if (activeMood === 'All') return true;
    if (activeMood === 'Chill') return (t.bpm && t.bpm < 100) || t.artistName === 'Caelum Strings';
    if (activeMood === 'High Energy') return (t.bpm && t.bpm >= 122) || t.artistName === 'Velvet Horizon';
    if (activeMood === 'Late Night') return t.title.toLowerCase().includes('midnight') || (t.bpm && t.bpm === 118);
    if (activeMood === 'Focus') return t.artistName === 'Aetheric Mirage' || t.artistName === 'Caelum Strings';
    if (activeMood === 'Bass Heavy') return (t.bpm && t.bpm >= 120);
    if (activeMood === 'Instrumental') return t.artistName === 'Solar Resonance' || t.artistName === 'Caelum Strings';
    return true;
  });

  const hasResults =
    moodFilteredTracks.length > 0 ||
    results.albums.length > 0 ||
    results.artists.length > 0 ||
    results.playlists.length > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 pb-32 md:pb-12 max-w-7xl mx-auto select-none">
      {/* 0. Primary High-Craft Search Bar */}
      <div className="relative w-full max-w-2xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-emerald pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search millions of songs, artists, albums, or lyrics..."
            className="w-full h-12 pl-12 pr-24 rounded-2xl bg-surface-1/90 border border-white/10 text-white placeholder-content-muted text-sm sm:text-base focus:outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20 transition-all shadow-elevation-1"
            autoFocus
          />
          {searchInput && (
            <button
              onClick={handleClear}
              className="absolute right-12 p-1.5 rounded-full text-content-tertiary hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="absolute right-3 px-2 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-emerald/15 hover:text-emerald text-content-tertiary border border-white/5 transition-colors cursor-pointer"
            title="Open Command Palette (⌘K)"
          >
            ⌘K
          </button>
        </div>
      </div>

      {/* 1. Command Palette Fast-Action Pill & Suggestions */}
      <div className="space-y-4">
        {/* Raycast Quick-Launcher Banner */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center justify-between p-3 px-4 rounded-xl bg-surface-1/80 hover:bg-surface-2/90 border border-white/5 hover:border-emerald/40 transition-all cursor-pointer shadow-elevation-1 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald">
              <Command className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald transition-colors font-display">
                Sonic Command Palette (Raycast Engine)
              </p>
              <p className="text-[11px] text-content-secondary">
                Press <span className="font-mono text-emerald">⌘K</span> or click to jump anywhere, filter lyrics, or trigger actions
              </p>
            </div>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded text-xs font-mono bg-white/10 text-content-secondary group-hover:text-white border border-white/5">
            ⌘K
          </kbd>
        </div>

        {/* Recent Search History (When query is empty) */}
        {!query && searchHistory.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-content-tertiary uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Recent Searches
              </span>
              <button
                onClick={clearSearchHistory}
                className="text-[11px] text-content-tertiary hover:text-red-400 transition-colors"
              >
                Clear History
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {searchHistory.map((term) => (
                <div
                  key={term}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 hover:bg-surface-3 text-xs text-content-secondary hover:text-white transition-all shrink-0 border border-white/5"
                >
                  <span
                    onClick={() => handleQueryChange(term)}
                    className="cursor-pointer"
                  >
                    {term}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearchHistoryItem(term);
                    }}
                    className="p-0.5 rounded-full hover:bg-white/10 text-content-tertiary hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music Source Filter Pills (Persistent Multi-Source Navigator) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-bold text-content-tertiary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald" />
            Source:
          </span>
          {SOURCE_PILLS.map((pill) => {
            const IconComp = pill.icon;
            const isActive = sourceFilter === pill.id;

            return (
              <button
                key={pill.id}
                onClick={() => setSourceFilter(pill.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border',
                  isActive
                    ? 'bg-emerald text-canvas border-emerald shadow-glow-emerald font-bold'
                    : 'bg-surface-2 text-content-secondary border-white/5 hover:text-white hover:bg-surface-3'
                )}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{pill.label}</span>
                <span
                  className={cn(
                    'text-[9px] px-1.5 py-0.2 rounded-full font-mono font-medium',
                    isActive ? 'bg-canvas/20 text-canvas' : 'bg-white/10 text-content-tertiary'
                  )}
                >
                  {pill.badge}
                </span>
              </button>
            );
          })}

          {isSearchingRemote && (
            <div className="flex items-center gap-1.5 text-xs text-emerald shrink-0 ml-2 animate-pulse font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching Public Streams...</span>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs font-semibold text-content-tertiary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald" />
            Explore:
          </span>
          {searchSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleQueryChange(suggestion)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0',
                query.toLowerCase() === suggestion.toLowerCase()
                  ? 'bg-emerald text-canvas font-semibold shadow-glow-emerald'
                  : 'bg-surface-2 text-content-secondary hover:text-white hover:bg-surface-3'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Interactive Sonic Mood Pills (When query is present) */}
        {query && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-content-tertiary uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-emerald" />
                Sonic Filter:
              </span>
              {SONIC_PILLS.map((pill) => {
                const IconComp = pill.icon;
                const isActive = activeMood === pill.id;

                return (
                  <button
                    key={pill.id}
                    onClick={() => setActiveMood(pill.id)}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 border',
                      isActive
                        ? 'bg-emerald text-canvas border-emerald shadow-glow-emerald'
                        : 'bg-surface-2 text-content-secondary border-white/5 hover:text-white hover:bg-surface-3'
                    )}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Standard Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              <Filter className="w-3.5 h-3.5 text-content-tertiary shrink-0 mr-1" />
              {(['all', 'songs', 'artists', 'albums', 'playlists'] as FilterType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all shrink-0',
                    filterType === tab
                      ? 'bg-white text-canvas shadow-sm font-bold'
                      : 'bg-surface-2 text-content-secondary hover:text-white hover:bg-surface-3'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Empty Query State: Contextual by Source Filter */}
      {!query ? (
        sourceFilter === 'local' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
                  <HardDrive className="w-6 h-6 text-emerald" />
                  My Local Audio Vault
                </h1>
                <p className="text-xs sm:text-sm text-content-secondary mt-1">
                  Decoded in browser memory with zero server uploads, 5-band EQ DSP, and live LRCLIB synced lyrics
                </p>
              </div>
              <LocalAudioImporter className="self-start sm:self-auto" />
            </div>

            {localTracks.length > 0 ? (
              <div className="p-2 sm:p-4 rounded-xl bg-surface-1/60 border border-white/[0.04]">
                <TracklistTable tracks={localTracks} showHeader={true} />
              </div>
            ) : (
              <div className="border border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-surface-1/30 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-lg font-bold text-white font-display">
                    No Local Masters Imported Yet
                  </h3>
                  <p className="text-xs text-content-secondary">
                    Drop your FLAC, WAV, or MP3 files anywhere on the screen, or select multiple files from your disk.
                  </p>
                </div>
                <LocalAudioImporter>Select Audio Files</LocalAudioImporter>
              </div>
            )}
          </div>
        ) : sourceFilter === 'audius' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
                  <Radio className="w-6 h-6 text-emerald" />
                  Trending on Audius • Full 320kbps Streams
                </h1>
                <p className="text-xs sm:text-sm text-content-secondary mt-1">
                  Free, full-length streaming straight from the decentralized Audius network
                </p>
              </div>
              {audiusTrending.length > 0 && (
                <button
                  onClick={() => playTrack(audiusTrending[0], audiusTrending)}
                  className="px-4 py-1.5 rounded-full bg-emerald text-canvas text-xs font-bold shadow-glow-emerald hover:scale-105 transition-all"
                >
                  Play All
                </button>
              )}
            </div>

            {audiusTrending.length > 0 ? (
              <div className="p-2 sm:p-4 rounded-xl bg-surface-1/60 border border-white/[0.04]">
                <TracklistTable tracks={audiusTrending} showHeader={true} />
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-emerald font-mono text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Audius Discovery Provider...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                {sourceFilter === 'itunes' ? 'Apple Music Global Catalog' : 'Browse All Categories & Genres'}
              </h1>
              <p className="text-xs sm:text-sm text-content-secondary mt-1">
                {sourceFilter === 'itunes'
                  ? 'Search millions of songs, official 1000x1000 album covers, and 30-sec lossless AAC previews'
                  : 'Explore sonic frequencies crafted for every state of mind'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => handleCategoryClick(cat)}
                />
              ))}
            </div>
          </div>
        )
      ) : hasResults ? (
        /* 3. Search Results with Filter Mode */
        <div className="space-y-10">
          {/* Top Result + Songs (when filter is 'all' or 'songs') */}
          {(filterType === 'all' || filterType === 'songs') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Result Card */}
              {results.topResult && filterType === 'all' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-display text-white">Top Result</h3>
                  <div
                    onClick={() => {
                      if ('duration' in results.topResult!) {
                        playTrack(results.topResult as Track);
                      } else if ('type' in results.topResult!) {
                        navigate(`/album/${results.topResult.id}`);
                      } else if ('monthlyListeners' in results.topResult!) {
                        navigate(`/artist/${results.topResult.id}`);
                      } else if ('creatorName' in results.topResult!) {
                        navigate(`/playlist/${results.topResult.id}`);
                      }
                    }}
                    onContextMenu={(e) => {
                      if ('duration' in results.topResult!) {
                        e.preventDefault();
                        openContextMenu(e.clientX, e.clientY, results.topResult as Track);
                      }
                    }}
                    className="group p-5 rounded-xl bg-surface-1 hover:bg-surface-2 transition-all duration-300 border border-white/[0.04] cursor-pointer flex flex-col justify-between h-[230px] relative overflow-hidden shadow-elevation-1"
                  >
                    <img
                      src={
                        'coverUrl' in results.topResult
                          ? results.topResult.coverUrl
                          : (results.topResult as Artist).avatarUrl
                      }
                      alt={'title' in results.topResult ? results.topResult.title : results.topResult.name}
                      onError={handleImageError}
                      className="w-24 h-24 rounded-lg object-cover shadow-elevation-2"
                    />
                    <div>
                      <h4 className="text-2xl font-black font-display text-white truncate group-hover:text-emerald transition-colors">
                        {'title' in results.topResult ? results.topResult.title : results.topResult.name}
                      </h4>
                      <p className="text-sm text-content-secondary mt-1">
                        {'artistName' in results.topResult
                          ? `Song • ${results.topResult.artistName}`
                          : 'monthlyListeners' in results.topResult
                          ? 'Artist'
                          : 'releaseYear' in results.topResult
                          ? `Album • ${(results.topResult as unknown as Album).artistName}`
                          : 'Playlist'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if ('duration' in results.topResult!) {
                          playTrack(results.topResult as Track);
                        } else if ('type' in results.topResult!) {
                          navigate(`/album/${results.topResult.id}`);
                        } else if ('monthlyListeners' in results.topResult!) {
                          navigate(`/artist/${results.topResult.id}`);
                        } else if ('creatorName' in results.topResult!) {
                          navigate(`/playlist/${results.topResult.id}`);
                        }
                      }}
                      className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-emerald text-canvas flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-glow-emerald hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Matching Songs */}
              <div className={cn(filterType === 'all' ? 'lg:col-span-2' : 'lg:col-span-3', 'space-y-3')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-display text-white">
                    Songs {activeMood !== 'All' && <span className="text-xs text-emerald font-normal font-mono">({activeMood})</span>}
                  </h3>
                </div>

                <TracklistTable
                  tracks={moodFilteredTracks.slice(0, filterType === 'all' ? 4 : 20)}
                  showHeader={false}
                />
              </div>
            </div>
          )}

          {/* Artists Matches */}
          {(filterType === 'all' || filterType === 'artists') && results.artists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Albums Matches */}
          {(filterType === 'all' || filterType === 'albums') && results.albums.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* Playlists Matches */}
          {(filterType === 'all' || filterType === 'playlists') && results.playlists.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-display text-white">Playlists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isSearchingRemote ? (
        /* Remote Loading State */
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald animate-spin">
            <Loader2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-white">
              Searching Global & Decentralized Catalogs...
            </h3>
            <p className="text-xs text-content-secondary max-w-sm">
              Connecting Audius 320kbps full streams, Apple Music lossless catalog, and local masters
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          icon={SearchIcon}
          title={`No results found for "${query}"`}
          description="Check the spelling of your keywords or try searching for another artist, song, or genre."
          actionLabel="Clear Search"
          onAction={() => handleQueryChange('')}
        />
      )}
    </div>
  );
};
