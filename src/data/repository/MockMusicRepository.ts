import { IMusicRepository, SearchResults } from './IMusicRepository';
import { Track, Album, Artist, Playlist, GenreCategory } from '../../types/music';
import { mockTracks, mockAlbums, mockArtists, mockPlaylists, mockGenreCategories } from '../mockData';
import { useLibraryStore } from '../../stores/useLibraryStore';

export class MockMusicRepository implements IMusicRepository {
  async getTracks(): Promise<Track[]> {
    return [...mockTracks];
  }

  async getTrackById(id: string): Promise<Track | undefined> {
    return mockTracks.find((t) => t.id === id);
  }

  async getAlbums(): Promise<Album[]> {
    return [...mockAlbums];
  }

  async getAlbumById(id: string): Promise<{ album: Album; tracks: Track[] } | undefined> {
    const album = mockAlbums.find((a) => a.id === id);
    if (!album) return undefined;
    const tracks = mockTracks.filter((t) => t.albumId === id);
    return { album, tracks };
  }

  async getArtists(): Promise<Artist[]> {
    return [...mockArtists];
  }

  async getArtistById(id: string): Promise<
    | {
        artist: Artist;
        topTracks: Track[];
        albums: Album[];
        relatedArtists: Artist[];
      }
    | undefined
  > {
    const artist = mockArtists.find((a) => a.id === id);
    if (!artist) return undefined;
    const topTracks = mockTracks.filter((t) => t.artistId === id);
    const albums = mockAlbums.filter((a) => a.artistId === id);
    const relatedArtists = (artist.relatedArtistIds || [])
      .map((relId) => mockArtists.find((a) => a.id === relId))
      .filter((a): a is Artist => Boolean(a));

    return { artist, topTracks, albums, relatedArtists };
  }

  async getPlaylists(): Promise<Playlist[]> {
    const custom = useLibraryStore.getState().customPlaylists || [];
    return [...custom, ...mockPlaylists];
  }

  async getPlaylistById(id: string): Promise<Playlist | undefined> {
    const custom = useLibraryStore.getState().customPlaylists || [];
    const foundCustom = custom.find((p) => p.id === id);
    if (foundCustom) return foundCustom;
    return mockPlaylists.find((p) => p.id === id);
  }

  async getGenres(): Promise<GenreCategory[]> {
    return [...mockGenreCategories];
  }

  async search(query: string): Promise<SearchResults> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { tracks: [], albums: [], artists: [], playlists: [] };
    }

    const customPlaylists = useLibraryStore.getState().customPlaylists || [];
    const allPlaylists = [...customPlaylists, ...mockPlaylists];

    const tracks = mockTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artistName.toLowerCase().includes(q) ||
        t.albumTitle.toLowerCase().includes(q) ||
        t.lyrics?.some((l) => l.text.toLowerCase().includes(q))
    );
    const albums = mockAlbums.filter(
      (a) => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q)
    );
    const artists = mockArtists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );
    const playlists = allPlaylists.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.creatorName.toLowerCase().includes(q)
    );

    // Pick best top result
    const topResult = tracks[0] || artists[0] || albums[0] || playlists[0];

    return {
      topResult,
      tracks,
      albums,
      artists,
      playlists,
    };
  }
}

export const musicRepository = new MockMusicRepository();
