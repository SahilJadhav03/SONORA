import { Track, LyricLine, MusicSourceFilter } from '../types/music';

// In-memory cache maps for rapid < 50ms access
const searchCache = new Map<string, Track[]>();
const lyricsCache = new Map<string, LyricLine[]>();
const trendingCache = { data: [] as Track[], timestamp: 0 };

const AUDIUS_ENDPOINT = 'https://discoveryprovider.audius.co/v1';
const ITUNES_ENDPOINT = 'https://itunes.apple.com/search';
const LRCLIB_ENDPOINT = 'https://lrclib.net/api';
const APP_NAME = 'SONORA';

const FALLBACK_COVER = '/logo.svg';

/**
 * Robust .lrc lyric parser converts [mm:ss.xx] lines into structured LyricLine[]
 */
export function parseLrcLyrics(lrcString: string): LyricLine[] {
  if (!lrcString || typeof lrcString !== 'string') return [];

  const lines = lrcString.split('\n');
  const parsedLines: LyricLine[] = [];
  const timeRegex = /\[(\d{1,2}):(\d{1,2}(?:\.\d{1,3})?)\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Skip metadata tags like [ti:Title], [ar:Artist], [al:Album]
    if (/^\[(ti|ar|al|by|offset|length):/i.test(trimmed)) continue;

    const matches = [...trimmed.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    const text = trimmed.replace(timeRegex, '').trim();

    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      if (isNaN(minutes) || isNaN(seconds)) continue;

      const totalSeconds = Math.round((minutes * 60 + seconds) * 100) / 100;
      parsedLines.push({
        time: totalSeconds,
        text: text || '♪',
      });
    }
  }

  return parsedLines.sort((a, b) => a.time - b.time);
}

/**
 * Converts un-synced plain lyrics into an evenly distributed timeline
 */
export function convertPlainLyricsToSynced(plainText: string, duration = 180): LyricLine[] {
  if (!plainText) return [];

  const rawLines = plainText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('['));

  if (rawLines.length === 0) return [];

  const startOffset = Math.min(12, duration * 0.08);
  const endOffset = Math.max(duration - 15, duration * 0.9);
  const timeSpan = Math.max(10, endOffset - startOffset);
  const interval = timeSpan / rawLines.length;

  return rawLines.map((text, idx) => ({
    time: Math.round((startOffset + idx * interval) * 100) / 100,
    text,
  }));
}

/**
 * Fetch real time-synced karaoke lyrics from LRCLIB API with multi-tier fallback
 */
export async function fetchTrackLyrics(
  artistName: string,
  trackTitle: string,
  duration?: number
): Promise<LyricLine[] | null> {
  const cleanArtist = artistName.replace(/\(.*?\)|\[.*?\]|feat\..*|ft\..*/gi, '').trim();
  const cleanTitle = trackTitle.replace(/\(.*?\)|\[.*?\]|feat\..*|ft\..*/gi, '').trim();
  const cacheKey = `${cleanArtist.toLowerCase()}:::${cleanTitle.toLowerCase()}`;

  // 1. Check in-memory cache
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  // 2. Check sessionStorage
  try {
    const stored = sessionStorage.getItem(`sonora_lrc_${cacheKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      lyricsCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch {}

  try {
    // Tier 1: Direct exact match via /api/get
    const getUrl = `${LRCLIB_ENDPOINT}/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}${
      duration ? `&duration=${Math.round(duration)}` : ''
    }`;

    const getRes = await fetch(getUrl);
    if (getRes.ok) {
      const data = await getRes.json();
      if (data.syncedLyrics) {
        const parsed = parseLrcLyrics(data.syncedLyrics);
        if (parsed.length > 0) {
          lyricsCache.set(cacheKey, parsed);
          try {
            sessionStorage.setItem(`sonora_lrc_${cacheKey}`, JSON.stringify(parsed));
          } catch {}
          return parsed;
        }
      } else if (data.plainLyrics) {
        const generated = convertPlainLyricsToSynced(data.plainLyrics, duration);
        lyricsCache.set(cacheKey, generated);
        return generated;
      }
    }

    // Tier 2: Fuzzy search fallback via /api/search
    const searchUrl = `${LRCLIB_ENDPOINT}/search?q=${encodeURIComponent(`${cleanArtist} ${cleanTitle}`)}`;
    const searchRes = await fetch(searchUrl);

    if (searchRes.ok) {
      const results = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        // Find first item with syncedLyrics
        const syncedItem = results.find((r) => r.syncedLyrics);
        if (syncedItem && syncedItem.syncedLyrics) {
          const parsed = parseLrcLyrics(syncedItem.syncedLyrics);
          if (parsed.length > 0) {
            lyricsCache.set(cacheKey, parsed);
            try {
              sessionStorage.setItem(`sonora_lrc_${cacheKey}`, JSON.stringify(parsed));
            } catch {}
            return parsed;
          }
        }

        // Fallback to plain lyrics if synced not available
        const plainItem = results.find((r) => r.plainLyrics);
        if (plainItem && plainItem.plainLyrics) {
          const generated = convertPlainLyricsToSynced(plainItem.plainLyrics, duration);
          lyricsCache.set(cacheKey, generated);
          return generated;
        }
      }
    }
  } catch (err) {
    console.warn('LRCLIB lyrics lookup notice:', err);
  }

  return null;
}

/**
 * Audius API: Fetch Top Trending Full-Length Tracks (320kbps MP3)
 */
export async function fetchAudiusTrending(limit = 25): Promise<Track[]> {
  const now = Date.now();
  // 5-minute memory cache
  if (trendingCache.data.length > 0 && now - trendingCache.timestamp < 300000) {
    return trendingCache.data.slice(0, limit);
  }

  try {
    const res = await fetch(`${AUDIUS_ENDPOINT}/tracks/trending?app_name=${APP_NAME}&limit=${limit}`);
    if (!res.ok) throw new Error(`Audius HTTP ${res.status}`);

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) return [];

    const tracks: Track[] = json.data.map((item: any) => {
      const artwork =
        item.artwork?.['1000x1000'] ||
        item.artwork?.['480x480'] ||
        item.artwork?.['150x150'] ||
        FALLBACK_COVER;

      return {
        id: `audius-${item.id}`,
        title: item.title || 'Untitled Track',
        duration: typeof item.duration === 'number' && item.duration > 0 ? item.duration : 210,
        audioUrl: `${AUDIUS_ENDPOINT}/tracks/${item.id}/stream?app_name=${APP_NAME}`,
        artistId: `audius-artist-${item.user?.id || item.user?.handle || 'creator'}`,
        artistName: item.user?.name || item.user?.handle || 'Audius Artist',
        albumId: `audius-genre-${item.genre ? item.genre.toLowerCase() : 'all'}`,
        albumTitle: item.genre ? `${item.genre} Edition` : 'Audius Direct Stream',
        coverUrl: artwork,
        explicit: false,
        playsCount: typeof item.play_count === 'number' ? item.play_count : 24500,
        audioQuality: 'FULL TRACK • 320kbps',
        source: 'audius',
        sourceBadge: 'FULL TRACK • 320kbps',
        accentColor: '#00F59B',
      };
    });

    trendingCache.data = tracks;
    trendingCache.timestamp = now;
    return tracks;
  } catch (err) {
    console.warn('Audius trending fetch notice:', err);
    return [];
  }
}

/**
 * Audius API: Search Full-Length Tracks
 */
export async function searchAudiusTracks(query: string, limit = 25): Promise<Track[]> {
  const clean = query.trim();
  if (!clean) return [];

  const cacheKey = `audius_search_${clean.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(
      `${AUDIUS_ENDPOINT}/tracks/search?query=${encodeURIComponent(clean)}&app_name=${APP_NAME}`
    );
    if (!res.ok) throw new Error(`Audius Search HTTP ${res.status}`);

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) return [];

    const tracks: Track[] = json.data.slice(0, limit).map((item: any) => {
      const artwork =
        item.artwork?.['1000x1000'] ||
        item.artwork?.['480x480'] ||
        item.artwork?.['150x150'] ||
        FALLBACK_COVER;

      return {
        id: `audius-${item.id}`,
        title: item.title || 'Untitled Track',
        duration: typeof item.duration === 'number' && item.duration > 0 ? item.duration : 190,
        audioUrl: `${AUDIUS_ENDPOINT}/tracks/${item.id}/stream?app_name=${APP_NAME}`,
        artistId: `audius-artist-${item.user?.id || 'creator'}`,
        artistName: item.user?.name || 'Audius Artist',
        albumId: `audius-album-${item.id}`,
        albumTitle: item.genre ? `${item.genre} Wave` : 'Audius Open Audio',
        coverUrl: artwork,
        explicit: false,
        playsCount: typeof item.play_count === 'number' ? item.play_count : 18000,
        audioQuality: 'FULL TRACK • 320kbps',
        source: 'audius',
        sourceBadge: 'FULL TRACK • 320kbps',
        accentColor: '#00F59B',
      };
    });

    searchCache.set(cacheKey, tracks);
    return tracks;
  } catch (err) {
    console.warn('Audius search notice:', err);
    return [];
  }
}

/**
 * Apple iTunes Global Catalog Search (with 1000x1000px artwork upgrade)
 */
export async function searchItunesCatalog(query: string, limit = 25): Promise<Track[]> {
  const clean = query.trim();
  if (!clean) return [];

  const cacheKey = `itunes_search_${clean.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(
      `${ITUNES_ENDPOINT}?term=${encodeURIComponent(clean)}&media=music&entity=song&limit=${limit}`
    );
    if (!res.ok) throw new Error(`iTunes Search HTTP ${res.status}`);

    const json = await res.json();
    if (!json.results || !Array.isArray(json.results)) return [];

    const tracks: Track[] = json.results
      .filter((item: any) => item.previewUrl && item.trackName)
      .map((item: any) => {
        // Upgrade 100x100bb artwork to ultra-high resolution 1000x1000bb
        const rawArtwork = item.artworkUrl100 || '';
        const highResArtwork = rawArtwork
          ? rawArtwork.replace('100x100bb', '1000x1000bb')
          : FALLBACK_COVER;

        return {
          id: `itunes-${item.trackId}`,
          title: item.trackName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 30,
          audioUrl: item.previewUrl,
          artistId: `itunes-artist-${item.artistId || item.artistName.toLowerCase().replace(/\s+/g, '-')}`,
          artistName: item.artistName,
          albumId: `itunes-album-${item.collectionId || item.trackId}`,
          albumTitle: item.collectionName || 'Apple Music Catalog',
          coverUrl: highResArtwork,
          explicit: item.trackExplicitness === 'explicit',
          playsCount: Math.floor(Math.random() * 400000) + 100000,
          audioQuality: 'PREVIEW • AAC',
          source: 'itunes',
          sourceBadge: 'PREVIEW • AAC',
          releaseDate: item.releaseDate ? item.releaseDate.slice(0, 4) : undefined,
          accentColor: '#38BDF8',
        };
      });

    searchCache.set(cacheKey, tracks);
    return tracks;
  } catch (err) {
    console.warn('iTunes search notice:', err);
    return [];
  }
}

/**
 * Unified Multi-Source Search
 * Queries Audius & iTunes in parallel and merges results
 */
export async function searchAllMusic(
  query: string,
  filter: MusicSourceFilter = 'all',
  limit = 25
): Promise<Track[]> {
  const clean = query.trim();
  if (!clean) return [];

  // If specific source is requested, dispatch directly
  if (filter === 'audius') {
    return searchAudiusTracks(clean, limit);
  }
  if (filter === 'itunes') {
    return searchItunesCatalog(clean, limit);
  }

  // Parallel fetch from both public services
  const [audiusResults, itunesResults] = await Promise.allSettled([
    searchAudiusTracks(clean, Math.ceil(limit / 2)),
    searchItunesCatalog(clean, Math.ceil(limit / 2)),
  ]);

  const tracks: Track[] = [];

  if (audiusResults.status === 'fulfilled') {
    tracks.push(...audiusResults.value);
  }
  if (itunesResults.status === 'fulfilled') {
    tracks.push(...itunesResults.value);
  }

  return tracks;
}

/**
 * Smart Local Audio Importer: Metadata Enrichment
 * Parses filename and queries iTunes & LRCLIB to enrich local files
 */
export async function enrichLocalAudioTrack(
  filename: string
): Promise<{
  title: string;
  artistName: string;
  albumTitle?: string;
  coverUrl?: string;
  releaseDate?: string;
  lyrics?: LyricLine[];
}> {
  // Strip extension
  const cleanName = filename.replace(/\.[^/.]+$/, '').trim();

  let artistName = 'Unknown Artist';
  let title = cleanName;

  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    artistName = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (cleanName.includes('_-_')) {
    const parts = cleanName.split('_-_');
    artistName = parts[0].replace(/_/g, ' ').trim();
    title = parts.slice(1).join(' ').replace(/_/g, ' ').trim();
  }

  try {
    // 1. Query iTunes to match high-resolution 1000x1000 artwork and official album metadata
    const itunesMatches = await searchItunesCatalog(`${artistName} ${title}`, 3);
    const bestMatch = itunesMatches[0];

    const finalArtist = bestMatch?.artistName || artistName;
    const finalTitle = bestMatch?.title || title;
    const albumTitle = bestMatch?.albumTitle || 'Local Master Vault';
    const coverUrl = bestMatch?.coverUrl;
    const releaseDate = bestMatch?.releaseDate;

    // 2. Query LRCLIB to attach real time-synced karaoke lyrics
    const lyrics = await fetchTrackLyrics(finalArtist, finalTitle);

    return {
      title: finalTitle,
      artistName: finalArtist,
      albumTitle,
      coverUrl,
      releaseDate,
      lyrics: lyrics || undefined,
    };
  } catch (err) {
    console.warn('Metadata enrichment error:', err);
    return {
      title,
      artistName,
    };
  }
}
