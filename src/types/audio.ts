import { Track } from './music';

export type RepeatMode = 'off' | 'all' | 'one';

export type EQPresetId = 'flat' | 'bass-boost' | 'vocal' | 'late-night' | 'studio' | 'custom';

export interface EQBand {
  frequency: number;
  type: BiquadFilterType;
  gain: number;
  q?: number;
}

export interface AudioFrequencyData {
  bass: number;     // 0.0 to 1.0
  mid: number;      // 0.0 to 1.0
  treble: number;   // 0.0 to 1.0
  overall: number;  // 0.0 to 1.0
}

export interface AudioPlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  history: Track[];
  originalQueue: Track[];
  eqPreset: EQPresetId;
  eqGains: [number, number, number, number, number]; // 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz
  waveformMode: 'progress' | 'waveform';
  isVisualizerOpen: boolean;
}
