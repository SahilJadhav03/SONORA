import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { LeftSidebar } from './LeftSidebar';
import { LayoutResizer } from '../components/common/LayoutResizer';
import { BottomPlayerBar } from './BottomPlayerBar';
import { MobileNavigation } from './MobileNavigation';
import { AudioController } from '../components/player/AudioController';
import { ToastContainer } from '../components/feedback/ToastContainer';
import { EqualizerPopover } from '../components/player/EqualizerPopover';
import { AmbientFluidCanvas } from '../components/common/AmbientFluidCanvas';
import { TrackContextMenu } from '../components/common/TrackContextMenu';
import { RouteLoadingFallback, DrawerLoadingFallback } from '../components/feedback/RouteLoadingFallback';
import { useAudioStore } from '../stores/useAudioStore';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

// Lazy-load secondary drawers & heavy modals to keep main entry bundle ultralight
const RightCompanionPanel = React.lazy(() =>
  import('./RightCompanionPanel').then((m) => ({ default: m.RightCompanionPanel }))
);
const CommandPalette = React.lazy(() =>
  import('../components/palette/CommandPalette').then((m) => ({ default: m.CommandPalette }))
);
const NowPlayingTheatre = React.lazy(() =>
  import('../components/theatre/NowPlayingTheatre').then((m) => ({ default: m.NowPlayingTheatre }))
);
const PlaylistEditModal = React.lazy(() =>
  import('../components/modals/PlaylistEditModal').then((m) => ({ default: m.PlaylistEditModal }))
);

export const AppShell: React.FC = () => {
  useGlobalShortcuts();
  const isEQOpen = useAudioStore((s) => s.isEQOpen);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas text-content-primary p-2 gap-2 select-none relative">
      {/* 0. Apple Music-Style Dynamic Ambient Fluid Color Mesh */}
      <AmbientFluidCanvas />

      {/* 1. Global Navigation Top Bar */}
      <TopNavBar />

      {/* 2. Middle Grid: Sidebar + Resizer + Main Scroll Area + Right Panel */}
      <div className="flex-1 flex overflow-hidden gap-2">
        {/* Left Sidebar (Desktop / Tablet only) */}
        <div className="hidden md:flex shrink-0 h-full">
          <LeftSidebar />
        </div>

        {/* Draggable Resizer (Desktop only) */}
        <div className="hidden md:flex items-center h-full">
          <LayoutResizer />
        </div>

        {/* Central Dynamic View Container */}
        <main
          id="main-view"
          tabIndex={-1}
          className="flex-1 h-full rounded-lg bg-surface-0 overflow-y-auto sonora-scrollbar border border-white/[0.04] relative flex flex-col focus:outline-none shadow-elevation-1"
        >
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Contextual Right Companion Panel (Now Playing / Lyrics / Queue) */}
        <div className="hidden lg:flex shrink-0 h-full">
          <Suspense fallback={<DrawerLoadingFallback />}>
            <RightCompanionPanel />
          </Suspense>
        </div>
      </div>

      {/* 3. Bottom Player Bar (Desktop) */}
      <div className="hidden md:block relative">
        <BottomPlayerBar />
        {/* 5-Band Equalizer Floating Panel */}
        <EqualizerPopover isOpen={isEQOpen} onClose={toggleEQ} />
      </div>

      {/* 4. Mobile Navigation & Docked Mini Player (Mobile Viewports) */}
      <MobileNavigation />
      <Suspense fallback={null}>
        <RightCompanionPanel mobile={true} />
      </Suspense>

      {/* 5. Headless Audio Engine Controller */}
      <AudioController />

      {/* 6. Floating Action Feedback Toast Container */}
      <ToastContainer />

      {/* 7. Raycast-Style Sonic Command Palette */}
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>

      {/* 8. Global Right-Click Track Context Menu */}
      <TrackContextMenu />

      {/* 9. Playlist Creator & Details Modal */}
      <Suspense fallback={null}>
        <PlaylistEditModal />
      </Suspense>

      {/* 10. Apple Music / Spotify Shared-Element Immersive Theatre View */}
      <Suspense fallback={null}>
        <NowPlayingTheatre />
      </Suspense>
    </div>
  );
};
