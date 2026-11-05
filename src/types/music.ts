export interface LyricWord {
  time: number; // in seconds
  word: string;
}

export interface LyricLine {
  time: number; // in seconds
  timeMs?: number; // legacy millisecond timestamp support
  text: string;
  words?: LyricWord[];
}

export interface Track {
  id: string;
  title: string;
  duration: number; // in seconds
  audioUrl: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  coverUrl: string;
  explicit?: boolean;
  playsCount: number;
  lyrics?: LyricLine[];
  accentColor?: string;
  // Audiophile & Sonic DNA metadata
  bpm?: number;
  musicalKey?: string;
  audioQuality?: string; // e.g. "LOSSLESS 24-BIT / 96kHz"
  producer?: string;
  composer?: string;
  releaseDate?: string;
}

export interface Album {
  id: string;
  title: string;
  coverUrl: string;
  releaseYear: number;
  releaseDate?: string;
  artistId: string;
  artistName: string;
  type: 'album' | 'single' | 'ep';
  tracksCount: number;
  accentColor?: string;
  description?: string;
  copyright?: string;
  isSaved?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  headerBannerUrl: string;
  verified: boolean;
  monthlyListeners: number;
  bio: string;
  genres: string[];
  relatedArtistIds?: string[];
  followersCount?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  creatorName: string;
  tracksCount: number;
  followersCount: number;
  tracks: Track[];
  accentColor?: string;
  isSaved?: boolean;
}

export interface GenreCategory {
  id: string;
  title: string;
  color: string;
  coverUrl: string;
  slug: string;
}
