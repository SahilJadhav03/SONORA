import React from 'react';
import { cn } from '../../utils/cn';

interface EqualizerIndicatorProps {
  className?: string;
  isPlaying?: boolean;
}

export const EqualizerIndicator: React.FC<EqualizerIndicatorProps> = ({
  className,
  isPlaying = true,
}) => {
  return (
    <div
      className={cn(
        'flex items-end justify-center gap-[2.5px] w-4 h-4 text-emerald',
        className
      )}
      aria-label="Playing audio indicator"
    >
      <span
        className={cn(
          'w-[3px] bg-emerald rounded-full transition-all',
          isPlaying ? 'animate-eq-1' : 'h-1.5'
        )}
      />
      <span
        className={cn(
          'w-[3px] bg-emerald rounded-full transition-all',
          isPlaying ? 'animate-eq-2' : 'h-3'
        )}
      />
      <span
        className={cn(
          'w-[3px] bg-emerald rounded-full transition-all',
          isPlaying ? 'animate-eq-3' : 'h-1'
        )}
      />
    </div>
  );
};
