import React from 'react';
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer';
import { cn } from '../../utils/cn';

interface AudioVisualizerCanvasProps {
  className?: string;
  barCount?: number;
  height?: number;
  width?: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  className,
  barCount = 36,
  height = 48,
  width = 240,
}) => {
  const { canvasRef } = useAudioVisualizer({ barCount });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn('pointer-events-none rounded transition-opacity duration-300', className)}
    />
  );
};
