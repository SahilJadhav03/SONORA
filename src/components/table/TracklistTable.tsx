import React from 'react';
import { Clock } from 'lucide-react';
import { Track } from '../../types/music';
import { TracklistRow } from './TracklistRow';
import { cn } from '../../utils/cn';

interface TracklistTableProps {
  tracks: Track[];
  showHeader?: boolean;
  className?: string;
}

export const TracklistTable: React.FC<TracklistTableProps> = ({
  tracks,
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn('w-full select-none', className)}>
      {/* Sticky Table Header */}
      {showHeader && (
        <div className="sticky top-0 z-10 flex items-center px-4 py-2 border-b border-white/[0.08] text-xs font-semibold text-content-tertiary uppercase tracking-wider mb-2 bg-surface-1/90 backdrop-blur-md">
          <span className="w-8 shrink-0 text-center">#</span>
          <span className="flex-1 min-w-0 pr-4">Title</span>
          <span className="w-1/3 hidden md:block min-w-0 pr-4">Album</span>
          <div className="flex items-center justify-end w-20 shrink-0 pr-2">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="space-y-0.5">
        {tracks.map((track, idx) => (
          <TracklistRow
            key={track.id}
            track={track}
            index={idx}
            contextTracks={tracks}
          />
        ))}
      </div>
    </div>
  );
};
