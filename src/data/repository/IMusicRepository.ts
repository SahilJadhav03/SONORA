import { Track, Album, Artist, Playlist, GenreCategory } from '../../types/music';

export interface SearchResults {
  topResult?: Track | Album | Artist | Playlist;
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
}

export interface IMusicRepository {
  getTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | undefined>;
  getAlbums(): Promise<Album[]>;
  getAlbumById(id: string): Promise<{ album: Album; tracks: Track[] } | undefined>;
  getArtists(): Promise<Artist[]>;
  getArtistById(id: string): Promise<
    | {
        artist: Artist;
        topTracks: Track[];
        albums: Album[];
        relatedArtists: Artist[];
      }
    | undefined
  >;
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | undefined>;
  getGenres(): Promise<GenreCategory[]>;
  search(query: string): Promise<SearchResults>;
}
