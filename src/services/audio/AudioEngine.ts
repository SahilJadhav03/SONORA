import { EQPresetId, AudioFrequencyData } from '../../types/audio';

export const EQ_FREQUENCIES = [60, 230, 910, 3600, 14000] as const;

export const EQ_PRESETS: Record<EQPresetId, [number, number, number, number, number]> = {
  flat: [0, 0, 0, 0, 0],
  'bass-boost': [6, 4, 0, 0, -1],
  vocal: [-2, 1, 4, 3, 0],
  'late-night': [-3, -1, 0, -2, -5],
  studio: [1, -1, 1, 2, 1],
  custom: [0, 0, 0, 0, 0],
};

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private audioEl: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private vocalFilter: BiquadFilterNode | null = null;
  private isSingMode = false;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  // Fallback synthetic ambient engine if remote media is offline/blocked
  private synthGainNode: GainNode | null = null;
  private synthOscillators: OscillatorNode[] = [];
  private isUsingSynthFallback = false;

  private isInitialized = false;
  private currentUrl = '';
  private targetVolume = 0.8;
  private isMuted = false;

  // Heartbeat ticker for guaranteed timeline progress
  private tickerInterval: number | null = null;
  private virtualTime = 0;
  private virtualDuration = 214;
  private isEnginePlaying = false;

  // Raw frequency buffer
  private freqDataBuffer: Uint8Array<ArrayBuffer> | null = null;

  // Event callbacks
  public onTimeUpdate: ((currentTime: number) => void) | null = null;
  public onDurationChange: ((duration: number) => void) | null = null;
  public onEnded: (() => void) | null = null;
  public onError: ((error: unknown) => void) | null = null;
  public onPlayStateChange: ((isPlaying: boolean) => void) | null = null;

  private constructor() {
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = 'anonymous';
    this.audioEl.preload = 'auto';

    this.bindAudioEvents();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public getCurrentUrl(): string {
    return this.currentUrl;
  }

  /**
   * Lazily initialize Web Audio context graph on user gesture to obey autoplay policy
   */
  public ensureContextInitialized(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.isInitialized && this.ctx) {
      this.buildAudioGraph();
      this.isInitialized = true;
    }

    return this.ctx;
  }

  private buildAudioGraph(): void {
    if (!this.ctx) return;

    try {
      // 1. Connect MediaElementSourceNode (strictly once per HTMLMediaElement)
      if (!this.sourceNode) {
        this.sourceNode = this.ctx.createMediaElementSource(this.audioEl);
      }

      // 2. 5-Band Equalizer Filter Chain
      const f60 = this.ctx.createBiquadFilter();
      f60.type = 'lowshelf';
      f60.frequency.value = 60;
      f60.gain.value = 0;

      const f230 = this.ctx.createBiquadFilter();
      f230.type = 'peaking';
      f230.frequency.value = 230;
      f230.Q.value = 1.0;
      f230.gain.value = 0;

      const f910 = this.ctx.createBiquadFilter();
      f910.type = 'peaking';
      f910.frequency.value = 910;
      f910.Q.value = 1.0;
      f910.gain.value = 0;

      const f3600 = this.ctx.createBiquadFilter();
      f3600.type = 'peaking';
      f3600.frequency.value = 3600;
      f3600.Q.value = 1.0;
      f3600.gain.value = 0;

      const f14000 = this.ctx.createBiquadFilter();
      f14000.type = 'highshelf';
      f14000.frequency.value = 14000;
      f14000.gain.value = 0;

      this.filters = [f60, f230, f910, f3600, f14000];

      // 3. Master Gain Node (for crossfade & master volume)
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.targetVolume;

      // 4. Vocal Attenuation Filter (Sing Mode: 1.8kHz peaking notch for karaoke vocal ducking)
      this.vocalFilter = this.ctx.createBiquadFilter();
      this.vocalFilter.type = 'peaking';
      this.vocalFilter.frequency.value = 1800;
      this.vocalFilter.Q.value = 1.35;
      this.vocalFilter.gain.value = this.isSingMode ? -18 : 0;

      // 5. Analyser Node (for 60fps real-time visualizer)
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;
      this.analyserNode.maxDecibels = -10;
      this.analyserNode.minDecibels = -90;
      this.freqDataBuffer = new Uint8Array(this.analyserNode.frequencyBinCount);

      // 6. Connect serial audio pipeline: source -> EQ -> vocalFilter -> gainNode -> analyser -> destination
      this.sourceNode.connect(this.filters[0]);
      for (let i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i + 1]);
      }
      this.filters[this.filters.length - 1].connect(this.vocalFilter);
      this.vocalFilter.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.ctx.destination);

      // 7. Connect ambient synth fallback bus into the same EQ & Analyser
      this.synthGainNode = this.ctx.createGain();
      this.synthGainNode.gain.value = 0;
      this.synthGainNode.connect(this.filters[0]);
    } catch (err) {
      console.warn('AudioEngine Web Audio setup notice:', err);
    }
  }

  private bindAudioEvents(): void {
    this.audioEl.addEventListener('timeupdate', () => {
      if (!isNaN(this.audioEl.currentTime)) {
        this.virtualTime = this.audioEl.currentTime;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.audioEl.currentTime);
        }
      }
    });

    this.audioEl.addEventListener('durationchange', () => {
      if (!isNaN(this.audioEl.duration) && this.audioEl.duration > 0) {
        this.virtualDuration = this.audioEl.duration;
        if (this.onDurationChange) {
          this.onDurationChange(this.audioEl.duration);
        }
      }
    });

    this.audioEl.addEventListener('ended', () => {
      this.stopHeartbeat();
      if (this.onEnded) this.onEnded();
    });

    this.audioEl.addEventListener('play', () => {
      this.isEnginePlaying = true;
      this.startHeartbeat();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    });

    this.audioEl.addEventListener('pause', () => {
      this.isEnginePlaying = false;
      this.stopHeartbeat();
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    });

    this.audioEl.addEventListener('error', (e) => {
      this.startSyntheticAmbientFallback();
      if (this.onError) this.onError(e);
    });
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.tickerInterval = window.setInterval(() => {
      if (!this.isEnginePlaying) return;

      if (!this.audioEl.paused && !isNaN(this.audioEl.currentTime) && this.audioEl.currentTime > 0) {
        this.virtualTime = this.audioEl.currentTime;
        if (this.onTimeUpdate) this.onTimeUpdate(this.audioEl.currentTime);
      } else {
        // Fallback progress tick so timeline scrubber and audio progress never freeze
        this.virtualTime += 0.25;
        if (this.onTimeUpdate) this.onTimeUpdate(this.virtualTime);

        if (this.virtualDuration > 0 && this.virtualTime >= this.virtualDuration) {
          this.stopHeartbeat();
          if (this.onEnded) this.onEnded();
        }
      }
    }, 250);
  }

  private stopHeartbeat(): void {
    if (this.tickerInterval !== null) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  /**
   * Load a track by URL (stream or local blob)
   */
  public loadTrack(url: string, autoPlay = true): void {
    this.ensureContextInitialized();
    this.stopSyntheticAmbientFallback();
    this.currentUrl = url;
    this.virtualTime = 0;

    this.audioEl.src = url;
    this.audioEl.load();

    if (autoPlay) {
      this.playWithCrossfade();
    }
  }

  /**
   * Play with smooth volume ramp (crossfade in)
   */
  public async playWithCrossfade(fadeMs = 200): Promise<void> {
    this.ensureContextInitialized();

    if (this.currentUrl && this.audioEl.src !== this.currentUrl) {
      this.audioEl.src = this.currentUrl;
      this.audioEl.load();
    }

    if (this.ctx && this.gainNode) {
      const now = this.ctx.currentTime;
      const targetVol = this.isMuted ? 0 : this.targetVolume;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0.001, now);
      this.gainNode.gain.linearRampToValueAtTime(targetVol, now + fadeMs / 1000);
    }

    this.isEnginePlaying = true;
    this.startHeartbeat();

    try {
      await this.audioEl.play();
      this.isUsingSynthFallback = false;
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    } catch {
      // Autoplay or network restriction - fallback gracefully
      this.startSyntheticAmbientFallback();
    }
  }

  /**
   * Pause with smooth volume ramp (duck out)
   */
  public pauseWithFade(fadeMs = 200): void {
    this.isEnginePlaying = false;
    this.stopHeartbeat();

    if (this.ctx && this.gainNode && !this.audioEl.paused) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.linearRampToValueAtTime(0.001, now + fadeMs / 1000);
      setTimeout(() => {
        this.audioEl.pause();
        this.stopSyntheticAmbientFallback();
        if (this.onPlayStateChange) this.onPlayStateChange(false);
      }, fadeMs);
    } else {
      this.audioEl.pause();
      this.stopSyntheticAmbientFallback();
      if (this.onPlayStateChange) this.onPlayStateChange(false);
    }
  }

  public seek(seconds: number): void {
    if (isFinite(seconds) && seconds >= 0) {
      this.virtualTime = seconds;
      try {
        this.audioEl.currentTime = seconds;
      } catch {
        // seek safety
      }
      if (this.onTimeUpdate) this.onTimeUpdate(seconds);
    }
  }

  public setVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    this.isMuted = this.targetVolume === 0;

    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.targetVolume, now);
    } else {
      this.audioEl.volume = this.isMuted ? 0 : this.targetVolume;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(muted ? 0 : this.targetVolume, now);
    } else {
      this.audioEl.muted = muted;
    }
  }

  /**
   * Set 5-Band Equalizer Gains (-12dB to +12dB)
   */
  public setEQGains(gains: [number, number, number, number, number]): void {
    if (this.filters.length === 5 && this.ctx) {
      const now = this.ctx.currentTime;
      gains.forEach((gain, i) => {
        const clamped = Math.max(-12, Math.min(12, gain));
        this.filters[i].gain.cancelScheduledValues(now);
        this.filters[i].gain.setValueAtTime(clamped, now);
      });
    }
  }

  public setEQPreset(presetId: EQPresetId): [number, number, number, number, number] {
    const gains = EQ_PRESETS[presetId] || EQ_PRESETS.flat;
    this.setEQGains(gains);
    return gains;
  }

  /**
   * Apple Music Sing Mode: Attenuate vocals via ~1.8kHz peaking notch filter
   */
  public setSingMode(enabled: boolean): void {
    this.isSingMode = enabled;
    if (this.vocalFilter && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = enabled ? -18 : 0;
      this.vocalFilter.gain.cancelScheduledValues(now);
      this.vocalFilter.gain.setValueAtTime(this.vocalFilter.gain.value, now);
      this.vocalFilter.gain.linearRampToValueAtTime(targetGain, now + 0.35);
    }
  }

  public getSingMode(): boolean {
    return this.isSingMode;
  }

  /**
   * Real-time FFT Frequency Data for 60fps Visualizers
   */
  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyserNode && this.freqDataBuffer) {
      this.analyserNode.getByteFrequencyData(this.freqDataBuffer);
      return this.freqDataBuffer;
    }
    return new Uint8Array(128);
  }

  /**
   * Real-time calculated audio bands (Bass, Mid, Treble)
   */
  public getFrequencyMetrics(): AudioFrequencyData {
    const raw = this.getFrequencyData();
    if (!raw || raw.length === 0) {
      return { bass: 0, mid: 0, treble: 0, overall: 0 };
    }

    let bassSum = 0;
    const bassBins = Math.min(8, raw.length);
    for (let i = 0; i < bassBins; i++) {
      bassSum += raw[i];
    }
    const bass = bassSum / (bassBins * 255);

    let midSum = 0;
    const midBins = Math.min(32, raw.length);
    for (let i = bassBins; i < midBins; i++) {
      midSum += raw[i];
    }
    const mid = midSum / ((midBins - bassBins) * 255);

    let trebleSum = 0;
    const trebleBins = Math.min(80, raw.length);
    for (let i = midBins; i < trebleBins; i++) {
      trebleSum += raw[i];
    }
    const treble = trebleSum / ((trebleBins - midBins) * 255);

    const overall = (bass * 0.5) + (mid * 0.3) + (treble * 0.2);

    return { bass, mid, treble, overall };
  }

  /**
   * Procedural Synthetic Ambient Engine
   */
  private startSyntheticAmbientFallback(): void {
    if (this.isUsingSynthFallback || !this.ctx || !this.synthGainNode) return;

    this.isUsingSynthFallback = true;
    this.stopSyntheticAmbientFallback();

    try {
      const now = this.ctx.currentTime;
      const freqs = [108, 162, 216, 270, 324];

      this.synthOscillators = freqs.map((f, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);

        const subGain = this.ctx!.createGain();
        subGain.gain.setValueAtTime(0.12 / freqs.length, now);

        osc.connect(subGain);
        subGain.connect(this.synthGainNode!);
        osc.start();
        return osc;
      });

      this.synthGainNode.gain.cancelScheduledValues(now);
      this.synthGainNode.gain.setValueAtTime(0.001, now);
      this.synthGainNode.gain.linearRampToValueAtTime(0.3, now + 1.0);

      this.isEnginePlaying = true;
      this.startHeartbeat();
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    } catch {
      // Synth safety
    }
  }

  private stopSyntheticAmbientFallback(): void {
    if (!this.synthOscillators.length) return;
    try {
      this.synthOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.synthOscillators = [];
      if (this.synthGainNode && this.ctx) {
        this.synthGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } catch {}
    this.isUsingSynthFallback = false;
  }

  public getRawAudioElement(): HTMLAudioElement {
    return this.audioEl;
  }

  public getCurrentTime(): number {
    return this.virtualTime || this.audioEl.currentTime || 0;
  }

  public getDuration(): number {
    return this.virtualDuration || this.audioEl.duration || 0;
  }

  public isPaused(): boolean {
    return !this.isEnginePlaying && this.audioEl.paused;
  }
}

export const audioEngine = AudioEngine.getInstance();
