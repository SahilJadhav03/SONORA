import { useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../services/audio/AudioEngine';
import { useAudioStore } from '../stores/useAudioStore';

interface VisualizerOptions {
  barCount?: number;
  barColor?: string;
  glowColor?: string;
  minHeight?: number;
  maxHeight?: number;
  gap?: number;
  rounded?: boolean;
}

export const useAudioVisualizer = (options: VisualizerOptions = {}) => {
  const {
    barCount = 32,
    barColor = '#00F59B',
    glowColor = 'rgba(0, 245, 155, 0.4)',
    minHeight = 4,
    gap = 2,
    rounded = true,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear previous frame
    ctx.clearRect(0, 0, width, height);

    const freqData = audioEngine.getFrequencyData();
    const metrics = audioEngine.getFrequencyMetrics();

    // Export CSS variables for global ambient pulsing without triggering React re-renders!
    document.documentElement.style.setProperty('--sonora-bass', metrics.bass.toFixed(3));
    document.documentElement.style.setProperty('--sonora-mid', metrics.mid.toFixed(3));
    document.documentElement.style.setProperty('--sonora-treble', metrics.treble.toFixed(3));

    // Calculate bar dimensions
    const totalGap = gap * (barCount - 1);
    const barWidth = Math.max(2, (width - totalGap) / barCount);

    // Create luxury gradient
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#00F59B'); // Electric emerald
    gradient.addColorStop(0.6, '#38BDF8'); // Sky blue
    gradient.addColorStop(1, '#8B5CF6'); // Atmospheric violet

    ctx.fillStyle = gradient;
    ctx.shadowBlur = metrics.overall > 0.4 ? 12 : 6;
    ctx.shadowColor = glowColor;

    for (let i = 0; i < barCount; i++) {
      // Sample logarithmic/perceptual frequency spacing
      const dataIndex = Math.floor(Math.pow(i / barCount, 1.4) * (freqData.length * 0.75));
      const value = freqData[dataIndex] || 0;

      // Scale height
      const normalized = value / 255;
      const barHeight = Math.max(minHeight, normalized * (height - 8));
      const x = i * (barWidth + gap);
      const y = height - barHeight;

      if (rounded) {
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 3);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    }

    animFrameId.current = requestAnimationFrame(drawFrame);
  }, [barCount, gap, minHeight, glowColor, rounded]);

  useEffect(() => {
    if (isPlaying) {
      animFrameId.current = requestAnimationFrame(drawFrame);
    } else {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      // Paint gentle idle baseline frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          const totalGap = gap * (barCount - 1);
          const barWidth = Math.max(2, (canvas.width - totalGap) / barCount);
          for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + gap);
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - minHeight, barWidth, minHeight, [1.5, 1.5, 0, 0]);
            ctx.fill();
          }
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (animFrameId.current) {
          cancelAnimationFrame(animFrameId.current);
          animFrameId.current = null;
        }
        // Zero out ambient CSS reactive energy variables to save GPU cycles while tab is in background
        document.documentElement.style.setProperty('--sonora-bass', '0');
        document.documentElement.style.setProperty('--sonora-mid', '0');
        document.documentElement.style.setProperty('--sonora-treble', '0');
      } else if (isPlaying && !animFrameId.current) {
        animFrameId.current = requestAnimationFrame(drawFrame);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };
  }, [isPlaying, drawFrame, barCount, gap, minHeight]);

  return { canvasRef };
};
