import React, { useState, useEffect } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useDominantColors } from '../../hooks/useDominantColors';

export const AmbientFluidCanvas: React.FC = () => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const { palette } = useDominantColors(currentTrack?.coverUrl);
  const [isVisible, setIsVisible] = useState(() => (typeof document !== 'undefined' ? !document.hidden : true));

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Organic Fluid Color Mesh Blobs */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: isPlaying ? 0.28 : 0.16 }}
      >
        {/* Blob 1: Primary Vibrant Bloom (Top Right) */}
        <div
          className="absolute -top-[15%] -right-[10%] w-[55vw] h-[55vw] max-w-[850px] max-h-[850px] rounded-full filter blur-[100px] md:blur-[140px] animate-ambient-drift-1 transition-colors duration-1000"
          style={{
            backgroundColor: palette.primary,
            transform: 'scale(calc(1 + var(--sonora-bass, 0) * 0.12))',
            willChange: 'transform',
          }}
        />

        {/* Blob 2: Secondary Harmonic Tone (Bottom Left) */}
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[900px] max-h-[900px] rounded-full filter blur-[110px] md:blur-[160px] animate-ambient-drift-2 transition-colors duration-1000"
          style={{
            backgroundColor: palette.secondary,
            transform: 'scale(calc(1 + var(--sonora-mid, 0) * 0.08))',
            willChange: 'transform',
          }}
        />

        {/* Blob 3: Deep Atmospheric Lows (Center Orbit) */}
        <div
          className="absolute top-[30%] left-[25%] w-[45vw] h-[45vw] max-w-[700px] max-h-[700px] rounded-full filter blur-[120px] md:blur-[180px] animate-ambient-drift-3 transition-colors duration-1000"
          style={{
            backgroundColor: palette.tertiary,
            transform: 'scale(calc(1 + var(--sonora-treble, 0) * 0.06))',
            willChange: 'transform',
          }}
        />

        {/* Blob 4: Accent Counter-Point (Top Left) */}
        <div
          className="absolute -top-[10%] left-[5%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full filter blur-[90px] md:blur-[130px] animate-ambient-drift-1 transition-colors duration-1000"
          style={{
            backgroundColor: palette.accent,
            opacity: 0.6,
          }}
        />
      </div>

      {/* 2. Deep Obsidian Canvas Vignette Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      {/* 3. Luxury Film Grain / Noise Overlay (Eliminates 8-bit banding completely) */}
      <div
        className="absolute inset-0 opacity-[0.032] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
};
