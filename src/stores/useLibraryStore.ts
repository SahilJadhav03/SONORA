import { create } from 'zustand';
import { Playlist, Track } from '../types/music';

// Safe localStorage loaders
const loadStoredArray = <T>(key: string, fallback: T[]): T[] => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
};

const saveStored = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

interface LibraryStoreState {
  likedTrackIds: string[];
  followedArtistIds: string[];
  savedAlbumIds: string[];
  savedPlaylistIds: string[];
  customPlaylists: Playlist[];
  pinnedItemIds: string[];

  // Likes & Follows
  toggleLikeTrack: (trackId: string) => boolean;
  isLiked: (trackId: string) => boolean;
  toggleFollowArtist: (artistId: string) => boolean;
  isFollowing: (artistId: string) => boolean;
  toggleSaveAlbum: (albumId: string) => boolean;
  isAlbumSaved: (albumId: string) => boolean;
  toggleSavePlaylist: (playlistId: string) => boolean;
  isPlaylistSaved: (playlistId: string) => boolean;

  // Complete Playlist CRUD
  createPlaylist: (
    title: string,
    description?: string,
    coverUrl?: string,
    accentColor?: string
  ) => Playlist;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylistTracks: (playlistId: string, newTracks: Track[]) => void;
  getCustomPlaylist: (id: string) => Playlist | undefined;
}

const initialCustomPlaylists: Playlist[] = [
  {
    id: 'playlist-vibes-1',
    title: 'Neon Odyssey',
    description: 'Late-night synthesizers, analog warmth and futuristic disco grooves.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    creatorName: 'You',
    tracksCount: 2,
    followersCount: 14,
    tracks: [],
    accentColor: '#00F59B',
    isSaved: true,
  },
];

export const useLibraryStore = create<LibraryStoreState>((set, get) => ({
  likedTrackIds: loadStoredArray('sonora_liked_tracks', ['track-1', 'track-3', 'track-5', 'track-8']),
  followedArtistIds: loadStoredArray('sonora_followed_artists', ['artist-1', 'artist-2']),
  savedAlbumIds: loadStoredArray('sonora_saved_albums', ['album-1', 'album-2']),
  savedPlaylistIds: loadStoredArray('sonora_saved_playlists', ['playlist-1', 'playlist-2', 'playlist-vibes-1']),
  customPlaylists: loadStoredArray('sonora_custom_playlists', initialCustomPlaylists),
  pinnedItemIds: ['liked-songs-pinned', 'playlist-1'],

  toggleLikeTrack: (trackId: string) => {
    const state = get();
    const alreadyLiked = state.likedTrackIds.includes(trackId);
    let next: string[];
    let result: boolean;

    if (alreadyLiked) {
      next = state.likedTrackIds.filter((id) => id !== trackId);
      result = false;
    } else {
      next = [...state.likedTrackIds, trackId];
      result = true;
    }

    saveStored('sonora_liked_tracks', next);
    set({ likedTrackIds: next });
    return result;
  },

  isLiked: (trackId: string) => {
    return get().likedTrackIds.includes(trackId);
  },

  toggleFollowArtist: (artistId: string) => {
    const state = get();
    const alreadyFollowing = state.followedArtistIds.includes(artistId);
    let next: string[];
    let result: boolean;

    if (alreadyFollowing) {
      next = state.followedArtistIds.filter((id) => id !== artistId);
      result = false;
    } else {
      next = [...state.followedArtistIds, artistId];
      result = true;
    }

    saveStored('sonora_followed_artists', next);
    set({ followedArtistIds: next });
    return result;
  },

  isFollowing: (artistId: string) => {
    return get().followedArtistIds.includes(artistId);
  },

  toggleSaveAlbum: (albumId: string) => {
    const state = get();
    const alreadySaved = state.savedAlbumIds.includes(albumId);
    let next: string[];
    let result: boolean;

    if (alreadySaved) {
      next = state.savedAlbumIds.filter((id) => id !== albumId);
      result = false;
    } else {
      next = [...state.savedAlbumIds, albumId];
      result = true;
    }

    saveStored('sonora_saved_albums', next);
    set({ savedAlbumIds: next });
    return result;
  },

  isAlbumSaved: (albumId: string) => {
    return get().savedAlbumIds.includes(albumId);
  },

  toggleSavePlaylist: (playlistId: string) => {
    const state = get();
    const alreadySaved = state.savedPlaylistIds.includes(playlistId);
    let next: string[];
    let result: boolean;

    if (alreadySaved) {
      next = state.savedPlaylistIds.filter((id) => id !== playlistId);
      result = false;
    } else {
      next = [...state.savedPlaylistIds, playlistId];
      result = true;
    }

    saveStored('sonora_saved_playlists', next);
    set({ savedPlaylistIds: next });
    return result;
  },

  isPlaylistSaved: (playlistId: string) => {
    return get().savedPlaylistIds.includes(playlistId);
  },

  createPlaylist: (
    title: string,
    description = 'Curated by you on SONORA',
    coverUrl = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    accentColor = '#00F59B'
  ) => {
    const id = `playlist-custom-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      title,
      description,
      coverUrl,
      creatorName: 'You',
      tracksCount: 0,
      followersCount: 1,
      tracks: [],
      accentColor,
      isSaved: true,
    };

    set((state) => {
      const nextCustom = [newPlaylist, ...state.customPlaylists];
      const nextSaved = [id, ...state.savedPlaylistIds];
      saveStored('sonora_custom_playlists', nextCustom);
      saveStored('sonora_saved_playlists', nextSaved);
      return {
        customPlaylists: nextCustom,
        savedPlaylistIds: nextSaved,
      };
    });

    return newPlaylist;
  },

  updatePlaylist: (id: string, updates: Partial<Playlist>) => {
    set((state) => {
      const nextCustom = state.customPlaylists.map((pl) =>
        pl.id === id ? { ...pl, ...updates } : pl
      );
      saveStored('sonora_custom_playlists', nextCustom);
      return { customPlaylists: nextCustom };
    });
  },

  deletePlaylist: (id: string) => {
    set((state) => {
      const nextCustom = state.customPlaylists.filter((pl) => pl.id !== id);
      const nextSaved = state.savedPlaylistIds.filter((plId) => plId !== id);
      saveStored('sonora_custom_playlists', nextCustom);
      saveStored('sonora_saved_playlists', nextSaved);
      return {
        customPlaylists: nextCustom,
        savedPlaylistIds: nextSaved,
      };
    });
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    let added = false;
    set((state) => {
      const nextCustom = state.customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const exists = pl.tracks.some((t) => t.id === track.id);
          if (exists) return pl;
          added = true;
          const updatedTracks = [...pl.tracks, track];
          return {
            ...pl,
            tracks: updatedTracks,
            tracksCount: updatedTracks.length,
          };
        }
        return pl;
      });
      if (added) {
        saveStored('sonora_custom_playlists', nextCustom);
      }
      return { customPlaylists: nextCustom };
    });
    return added;
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    set((state) => {
      const nextCustom = state.customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          const updatedTracks = pl.tracks.filter((t) => t.id !== trackId);
          return {
            ...pl,
            tracks: updatedTracks,
            tracksCount: updatedTracks.length,
          };
        }
        return pl;
      });
      saveStored('sonora_custom_playlists', nextCustom);
      return { customPlaylists: nextCustom };
    });
  },

  reorderPlaylistTracks: (playlistId: string, newTracks: Track[]) => {
    set((state) => {
      const nextCustom = state.customPlaylists.map((pl) => {
        if (pl.id === playlistId) {
          return {
            ...pl,
            tracks: newTracks,
            tracksCount: newTracks.length,
          };
        }
        return pl;
      });
      saveStored('sonora_custom_playlists', nextCustom);
      return { customPlaylists: nextCustom };
    });
  },

  getCustomPlaylist: (id: string) => {
    return get().customPlaylists.find((pl) => pl.id === id);
  },
}));
