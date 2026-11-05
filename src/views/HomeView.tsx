import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Flame, Radio, Music2, Heart } from 'lucide-react';
import { mockTracks, mockAlbums, mockArtists, mockPlaylists } from '../data/mockData';
import { QuickReplayTile } from '../components/cards/QuickReplayTile';
import { ComponentShelf } from '../components/cards/ComponentShelf';
import { TrackCard } from '../components/cards/TrackCard';
import { AlbumCard } from '../components/cards/AlbumCard';
import { ArtistCard } from '../components/cards/ArtistCard';
import { PlaylistCard } from '../components/cards/PlaylistCard';
import { TracklistTable } from '../components/table/TracklistTable';
import { useAudioStore } from '../stores/useAudioStore';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const playTrack = useAudioStore((s) => s.playTrack);

  // Time-aware personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickTracks = mockTracks.slice(0, 6);
  const recommendedTracks = mockTracks.slice(3, 8);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-10 pb-32 md:pb-12 max-w-7xl mx-auto">
      {/* 1. Header & Personalized Greeting */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald">
          <Sparkles className="w-4 h-4 fill-emerald" />
          <span className="text-xs font-semibold tracking-widest uppercase font-mono">
            Sonic Resonance • High-Fidelity
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-hover to-emerald">Voyager</span>
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary font-medium">
            Immersive Dark Audio Environment
          </p>
        </div>

        {/* 2. Recently Played: Quick 6-Grid */}
        <div className="pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary mb-3 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald" />
            Recently Played
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickTracks.map((track) => (
              <QuickReplayTile
                key={track.id}
                track={track}
                contextTracks={quickTracks}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Made For You Shelf */}
      <ComponentShelf
        title="Made For You"
        seeAllLabel="View mixes"
        onSeeAll={() => navigate('/search')}
      >
        {mockPlaylists.slice(0, 4).map((playlist) => (
          <div key={playlist.id} className="w-40 sm:w-48 shrink-0">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </ComponentShelf>

      {/* 4. Trending Albums Shelf */}
      <ComponentShelf
        title="Trending Albums"
        seeAllLabel="See discography"
        onSeeAll={() => navigate('/search?q=album')}
      >
        {mockAlbums.map((album) => (
          <div key={album.id} className="w-40 sm:w-48 shrink-0">
            <AlbumCard album={album} />
          </div>
        ))}
      </ComponentShelf>

      {/* 5. Recommended Music Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
              <Music2 className="w-5 h-5 text-emerald" />
              Recommended For Your Mood
            </h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Based on your recent listening to ambient and electronic frequencies
            </p>
          </div>
          <button
            onClick={() => playTrack(recommendedTracks[0], recommendedTracks)}
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white text-canvas hover:bg-emerald hover:text-canvas transition-all"
          >
            Play All
          </button>
        </div>

        <div className="p-2 sm:p-4 rounded-xl bg-surface-1/60 border border-white/[0.04]">
          <TracklistTable tracks={recommendedTracks} showHeader={true} />
        </div>
      </section>

      {/* 6. Popular Artists Shelf */}
      <ComponentShelf
        title="Popular Artists"
        seeAllLabel="Browse all"
        onSeeAll={() => navigate('/search')}
      >
        {mockArtists.map((artist) => (
          <div key={artist.id} className="w-36 sm:w-44 shrink-0">
            <ArtistCard artist={artist} />
          </div>
        ))}
      </ComponentShelf>

      {/* 7. Featured Curated Playlists Shelf */}
      <ComponentShelf
        title="Featured SONORA Playlists"
        seeAllLabel="Discover more"
        onSeeAll={() => navigate('/search')}
      >
        {mockPlaylists.slice(2).map((playlist) => (
          <div key={playlist.id} className="w-40 sm:w-48 shrink-0">
            <PlaylistCard playlist={playlist} />
          </div>
        ))}
      </ComponentShelf>
    </div>
  );
};
