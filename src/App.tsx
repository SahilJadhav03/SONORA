import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { PlaylistView } from './views/PlaylistView';
import { AlbumView } from './views/AlbumView';
import { ArtistView } from './views/ArtistView';
import { LibraryView } from './views/LibraryView';
import { NowPlayingView } from './views/NowPlayingView';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomeView />} />
          <Route path="search" element={<SearchView />} />
          <Route path="playlist/:id" element={<PlaylistView />} />
          <Route path="album/:id" element={<AlbumView />} />
          <Route path="artist/:id" element={<ArtistView />} />
          <Route path="library" element={<LibraryView />} />
          <Route path="now-playing" element={<NowPlayingView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
