import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { MagneticButton } from '../common/MagneticButton';
import { cn } from '../../utils/cn';

export const PlayerControls: React.FC<{ className?: string }> = ({ className }) => {
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const skipNext = useAudioStore((s) => s.skipNext);
  const skipPrevious = useAudioStore((s) => s.skipPrevious);
  const isShuffle = useAudioStore((s) => s.isShuffle);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const repeatMode = useAudioStore((s) => s.repeatMode);
  const toggleRepeat = useAudioStore((s) => s.toggleRepeat);

  return (
    <div className={cn('flex items-center gap-3 sm:gap-4', className)}>
      {/* Magnetic Shuffle Button */}
      <MagneticButton
        pullDistance={4}
        onClick={toggleShuffle}
        aria-label="Toggle shuffle"
        className={cn(
          'relative p-1.5 transition-colors rounded-full hover:text-white',
          isShuffle ? 'text-emerald' : 'text-content-secondary'
        )}
      >
        <Shuffle className="w-4 h-4" />
        {isShuffle && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald" />
        )}
      </MagneticButton>

      {/* Magnetic Skip Previous */}
      <MagneticButton
        pullDistance={4}
        onClick={skipPrevious}
        aria-label="Previous track"
        className="p-1.5 text-content-secondary hover:text-white transition-colors"
      >
        <SkipBack className="w-5 h-5 fill-current" />
      </MagneticButton>

      {/* Primary Magnetic Play / Pause Circle */}
      <MagneticButton
        pullDistance={6}
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-canvas hover:scale-105 active:scale-95 transition-all duration-150 flex items-center justify-center shadow-elevation-1 hover:shadow-glow-emerald"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current text-canvas" />
        ) : (
          <Play className="w-5 h-5 fill-current text-canvas ml-0.5" />
        )}
      </MagneticButton>

      {/* Magnetic Skip Next */}
      <MagneticButton
        pullDistance={4}
        onClick={skipNext}
        aria-label="Next track"
        className="p-1.5 text-content-secondary hover:text-white transition-colors"
      >
        <SkipForward className="w-5 h-5 fill-current" />
      </MagneticButton>

      {/* Magnetic Repeat Button */}
      <MagneticButton
        pullDistance={4}
        onClick={toggleRepeat}
        aria-label={`Repeat mode: ${repeatMode}`}
        className={cn(
          'relative p-1.5 transition-colors rounded-full hover:text-white',
          repeatMode !== 'off' ? 'text-emerald' : 'text-content-secondary'
        )}
      >
        {repeatMode === 'one' ? (
          <Repeat1 className="w-4 h-4" />
        ) : (
          <Repeat className="w-4 h-4" />
        )}
        {repeatMode !== 'off' && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald" />
        )}
      </MagneticButton>
    </div>
  );
};
