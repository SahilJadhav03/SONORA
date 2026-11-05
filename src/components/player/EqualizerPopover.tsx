import React from 'react';
import { Sliders, RotateCcw, X, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { EQPresetId } from '../../types/audio';
import { EQ_FREQUENCIES } from '../../services/audio/AudioEngine';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { cn } from '../../utils/cn';

interface EqualizerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const PRESETS: { id: EQPresetId; label: string }[] = [
  { id: 'flat', label: 'Flat' },
  { id: 'bass-boost', label: 'Bass Boost' },
  { id: 'vocal', label: 'Vocal Presence' },
  { id: 'late-night', label: 'Late Night' },
  { id: 'studio', label: 'Studio Reference' },
];

const BAND_LABELS = ['60 Hz', '230 Hz', '910 Hz', '3.6 kHz', '14 kHz'];
const BAND_ROLES = ['Sub Bass', 'Bass / Low', 'Mids', 'Presence', 'Air / Highs'];

export const EqualizerPopover: React.FC<EqualizerPopoverProps> = ({ isOpen, onClose, className }) => {
  const eqPreset = useAudioStore((s) => s.eqPreset);
  const eqGains = useAudioStore((s) => s.eqGains);
  const setEQPreset = useAudioStore((s) => s.setEQPreset);
  const setBandGain = useAudioStore((s) => s.setBandGain);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'absolute bottom-24 right-4 z-50 w-96 rounded-2xl bg-surface-1/95 backdrop-blur-2xl border border-white/10 shadow-elevation-3 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 select-none text-content-primary',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald" />
          <h3 className="font-display font-bold text-sm tracking-wide text-white">
            5-Band Audiophile EQ
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEQPreset('flat')}
            title="Reset to Flat"
            className="p-1 rounded-full text-content-tertiary hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close equalizer"
            className="p-1 rounded-full text-content-tertiary hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Spectrum Visualizer Bar in EQ */}
      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-0/60 border border-white/5">
        <AudioVisualizerCanvas width={320} height={36} barCount={32} />
        <span className="text-[10px] text-content-muted mt-1 font-mono tracking-wider">
          LIVE HARDWARE DSP SPECTRUM
        </span>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setEQPreset(p.id)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all',
              eqPreset === p.id
                ? 'bg-emerald text-canvas shadow-glow-emerald'
                : 'bg-surface-2 hover:bg-surface-3 text-content-secondary hover:text-white border border-white/5'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 5-Band Vertical Faders */}
      <div className="grid grid-cols-5 gap-2 pt-2 pb-1">
        {eqGains.map((gain, index) => (
          <div key={EQ_FREQUENCIES[index]} className="flex flex-col items-center space-y-2">
            {/* Gain readout */}
            <span
              className={cn(
                'text-[10px] font-mono font-semibold',
                gain > 0 ? 'text-emerald' : gain < 0 ? 'text-violet' : 'text-content-muted'
              )}
            >
              {gain > 0 ? `+${gain}` : gain}dB
            </span>

            {/* Vertical range input */}
            <div className="relative h-28 flex items-center justify-center">
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={gain}
                onChange={(e) => setBandGain(index, parseInt(e.target.value, 10))}
                className="w-24 h-1.5 -rotate-90 appearance-none bg-surface-3 rounded-full cursor-pointer accent-emerald focus:outline-none"
              />
            </div>

            {/* Frequency & Role labels */}
            <div className="text-center space-y-0.5">
              <p className="text-[11px] font-bold text-white font-mono">{BAND_LABELS[index]}</p>
              <p className="text-[9px] text-content-muted">{BAND_ROLES[index]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
