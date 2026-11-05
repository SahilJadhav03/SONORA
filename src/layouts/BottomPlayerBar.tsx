import React from 'react';
import { PlayerTrackInfo } from '../components/player/PlayerTrackInfo';
import { PlayerControls } from '../components/player/PlayerControls';
import { TimelineScrubber } from '../components/player/TimelineScrubber';
import { UtilityControls } from '../components/player/UtilityControls';
import { cn } from '../utils/cn';

export const BottomPlayerBar: React.FC = () => {
  return (
    <footer className="h-20 bg-surface-0 border-t border-white/[0.06] px-4 flex items-center justify-between gap-4 z-40 select-none shadow-elevation-2">
      {/* Left: Track Information */}
      <div className="w-[30%] min-w-[180px] max-w-[320px] flex items-center">
        <PlayerTrackInfo />
      </div>

      {/* Center: Controls & Scrubber */}
      <div className="flex-1 max-w-xl flex flex-col items-center justify-center gap-1.5">
        <PlayerControls />
        <TimelineScrubber className="w-full" />
      </div>

      {/* Right: Volume & Utility Toggles */}
      <div className="w-[30%] min-w-[180px] max-w-[320px] flex items-center justify-end">
        <UtilityControls />
      </div>
    </footer>
  );
};
