import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { HomeView } from './views/HomeView';
import { RouteLoadingFallback } from './components/feedback/RouteLoadingFallback';

// Route-based code splitting: Keep HomeView in main entry for instant first paint,
// lazy load secondary views with layout-matching glass skeleton fallbacks
const SearchView = React.lazy(() => import('./views/SearchView').then((m) => ({ default: m.SearchView })));
const PlaylistView = React.lazy(() => import('./views/PlaylistView').then((m) => ({ default: m.PlaylistView })));
const AlbumView = React.lazy(() => import('./views/AlbumView').then((m) => ({ default: m.AlbumView })));
const ArtistView = React.lazy(() => import('./views/ArtistView').then((m) => ({ default: m.ArtistView })));
const LibraryView = React.lazy(() => import('./views/LibraryView').then((m) => ({ default: m.LibraryView })));
const NowPlayingView = React.lazy(() => import('./views/NowPlayingView').then((m) => ({ default: m.NowPlayingView })));

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<HomeView />} />
          <Route
            path="search"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <SearchView />
              </Suspense>
            }
          />
          <Route
            path="playlist/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <PlaylistView />
              </Suspense>
            }
          />
          <Route
            path="album/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <AlbumView />
              </Suspense>
            }
          />
          <Route
            path="artist/:id"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ArtistView />
              </Suspense>
            }
          />
          <Route
            path="library"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <LibraryView />
              </Suspense>
            }
          />
          <Route
            path="now-playing"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <NowPlayingView />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
