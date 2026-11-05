import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';
import { LeftSidebar } from './LeftSidebar';
import { LayoutResizer } from '../components/common/LayoutResizer';
import { RightCompanionPanel } from './RightCompanionPanel';
import { BottomPlayerBar } from './BottomPlayerBar';
import { MobileNavigation } from './MobileNavigation';
import { AudioController } from '../components/player/AudioController';
import { ToastContainer } from '../components/feedback/ToastContainer';
import { EqualizerPopover } from '../components/player/EqualizerPopover';
import { AmbientFluidCanvas } from '../components/common/AmbientFluidCanvas';
import { CommandPalette } from '../components/palette/CommandPalette';
import { TrackContextMenu } from '../components/common/TrackContextMenu';
import { PlaylistEditModal } from '../components/modals/PlaylistEditModal';
import { NowPlayingTheatre } from '../components/theatre/NowPlayingTheatre';
import { useAudioStore } from '../stores/useAudioStore';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

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
          <Outlet />
        </main>

        {/* Contextual Right Companion Panel (Now Playing / Lyrics / Queue) */}
        <div className="hidden lg:flex shrink-0 h-full">
          <RightCompanionPanel />
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
      <RightCompanionPanel mobile={true} />

      {/* 5. Headless Audio Engine Controller */}
      <AudioController />

      {/* 6. Floating Action Feedback Toast Container */}
      <ToastContainer />

      {/* 7. Raycast-Style Sonic Command Palette */}
      <CommandPalette />

      {/* 8. Global Right-Click Track Context Menu */}
      <TrackContextMenu />

      {/* 9. Playlist Creator & Details Modal */}
      <PlaylistEditModal />

      {/* 10. Apple Music / Spotify Shared-Element Immersive Theatre View */}
      <NowPlayingTheatre />
    </div>
  );
};
