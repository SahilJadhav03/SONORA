import React from 'react';
import { Mic2, ListMusic, Maximize2, Sliders, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useAudioStore } from '../../stores/useAudioStore';
import { VolumeControl } from './VolumeControl';
import { cn } from '../../utils/cn';

export const UtilityControls: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const rightPanelMode = useUIStore((s) => s.rightPanelMode);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanelMode);
  const isTheatreOpen = useUIStore((s) => s.isTheatreOpen);
  const setTheatreOpen = useUIStore((s) => s.setTheatreOpen);
  const isEQOpen = useAudioStore((s) => s.isEQOpen);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);

  return (
    <div className={cn('flex items-center justify-end gap-1 sm:gap-2', className)}>
      {/* 5-Band Equalizer Popover Toggle */}
      <button
        onClick={toggleEQ}
        aria-label="Toggle Equalizer"
        className={cn(
          'p-2 rounded-full transition-colors hover:text-white hidden sm:block',
          isEQOpen ? 'text-emerald' : 'text-content-secondary'
        )}
        title="5-Band Audiophile EQ"
      >
        <Sliders className="w-4 h-4" />
      </button>

      {/* Spotify Contextual Bento Drawer Toggle */}
      <button
        onClick={() => toggleRightPanel('info')}
        aria-label="Now Playing Bento Drawer"
        className={cn(
          'p-2 rounded-full transition-colors hover:text-white',
          rightPanelMode === 'info' || rightPanelMode === 'now-playing'
            ? 'text-emerald'
            : 'text-content-secondary'
        )}
        title="Now Playing Bento Drawer (I)"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/* Lyrics Toggle */}
      <button
        onClick={() => toggleRightPanel('lyrics')}
        aria-label="Toggle Lyrics"
        className={cn(
          'p-2 rounded-full transition-colors hover:text-white',
          rightPanelMode === 'lyrics' ? 'text-emerald' : 'text-content-secondary'
        )}
        title="Time-Synced Lyrics (L)"
      >
        <Mic2 className="w-4 h-4" />
      </button>

      {/* Queue Toggle */}
      <button
        onClick={() => toggleRightPanel('queue')}
        aria-label="Toggle Queue"
        className={cn(
          'p-2 rounded-full transition-colors hover:text-white',
          rightPanelMode === 'queue' ? 'text-emerald' : 'text-content-secondary'
        )}
        title="Queue (Q)"
      >
        <ListMusic className="w-4 h-4" />
      </button>

      {/* Full Screen Immersive Theatre View */}
      <button
        onClick={() => setTheatreOpen(true)}
        aria-label="Now playing immersive theatre"
        className={cn(
          'p-2 rounded-full transition-colors hover:text-white hidden lg:block',
          isTheatreOpen ? 'text-emerald' : 'text-content-secondary'
        )}
        title="Immersive Theatre Mode (F)"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Volume Control */}
      <VolumeControl className="ml-1 sm:ml-2" />
    </div>
  );
};
