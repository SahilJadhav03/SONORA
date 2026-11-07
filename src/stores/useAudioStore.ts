import { create } from 'zustand';
import { Track } from '../types/music';
import { RepeatMode, EQPresetId } from '../types/audio';
import { mockTracks } from '../data/mockData';
import { audioEngine, EQ_PRESETS } from '../services/audio/AudioEngine';
import { fetchTrackLyrics, enrichLocalAudioTrack } from '../services/musicApi';

// Fisher-Yates in-place shuffle keeping the active track first
const shuffleFisherYates = (tracks: Track[], currentTrackId?: string): Track[] => {
  const list = [...tracks];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  if (currentTrackId) {
    const curIdx = list.findIndex((t) => t.id === currentTrackId);
    if (curIdx > -1) {
      const [cur] = list.splice(curIdx, 1);
      list.unshift(cur);
    }
  }
  return list;
};

// Safe localStorage loaders
const loadSavedPrefs = () => {
  try {
    const vol = localStorage.getItem('sonora_volume');
    const muted = localStorage.getItem('sonora_muted');
    const shuffle = localStorage.getItem('sonora_shuffle');
    const repeat = localStorage.getItem('sonora_repeat') as RepeatMode | null;
    const eq = localStorage.getItem('sonora_eq_preset') as EQPresetId | null;
    const gains = localStorage.getItem('sonora_eq_gains');
    const waveform = localStorage.getItem('sonora_waveform_mode') as 'progress' | 'waveform' | null;

    return {
      volume: vol !== null ? parseFloat(vol) : 0.8,
      isMuted: muted === 'true',
      isShuffle: shuffle === 'true',
      repeatMode: repeat || 'off',
      eqPreset: eq || 'flat',
      eqGains: gains ? (JSON.parse(gains) as [number, number, number, number, number]) : EQ_PRESETS.flat,
      waveformMode: waveform || 'progress',
    };
  } catch {
    return {
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      repeatMode: 'off' as RepeatMode,
      eqPreset: 'flat' as EQPresetId,
      eqGains: EQ_PRESETS.flat,
      waveformMode: 'progress' as const,
    };
  }
};

const savedPrefs = loadSavedPrefs();

interface AudioStoreState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  history: Track[];
  originalQueue: Track[];

  // Audiophile extensions
  eqPreset: EQPresetId;
  eqGains: [number, number, number, number, number];
  isEQOpen: boolean;
  waveformMode: 'progress' | 'waveform';
  isSingMode: boolean;
  localTracks: Track[];

  // Actions
  playTrack: (track: Track, contextTracks?: Track[]) => void;
  togglePlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  addToQueue: (track: Track) => void;
  playNextTrack: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (newQueue: Track[]) => void;
  clearQueue: () => void;

  // Equalizer & Local Audio
  setEQPreset: (presetId: EQPresetId) => void;
  setBandGain: (bandIndex: number, gain: number) => void;
  toggleEQ: () => void;
  toggleWaveformMode: () => void;
  toggleSingMode: () => void;
  setSingMode: (enabled: boolean) => void;
  loadLocalAudioFile: (file: File) => Track;
  loadMultipleLocalAudioFiles: (files: FileList | File[]) => Promise<Track[]>;
}

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  currentTrack: mockTracks[0],
  isPlaying: false,
  currentTime: 0,
  duration: mockTracks[0].duration,
  volume: savedPrefs.volume,
  isMuted: savedPrefs.isMuted,
  isShuffle: savedPrefs.isShuffle,
  repeatMode: savedPrefs.repeatMode,
  queue: mockTracks.slice(1),
  history: [],
  originalQueue: mockTracks.slice(1),
  localTracks: [],

  eqPreset: savedPrefs.eqPreset,
  eqGains: savedPrefs.eqGains,
  isEQOpen: false,
  waveformMode: savedPrefs.waveformMode,
  isSingMode: false,

  playTrack: (track: Track, contextTracks?: Track[]) => {
    const state = get();
    const context = contextTracks || [track, ...state.queue];
    let newQueue = context.filter((t) => t.id !== track.id);

    if (state.isShuffle) {
      newQueue = shuffleFisherYates(newQueue);
    }

    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: track.duration,
      queue: newQueue,
      originalQueue: context.filter((t) => t.id !== track.id),
      history: state.currentTrack ? [state.currentTrack, ...state.history] : state.history,
    });

    // Feed to Hardware Web Audio Engine
    audioEngine.loadTrack(track.audioUrl, true);

    // Background fetch real time-synced karaoke lyrics via LRCLIB if not already present
    if (!track.lyrics || track.lyrics.length === 0) {
      fetchTrackLyrics(track.artistName, track.title, track.duration).then((lyrics) => {
        if (lyrics && lyrics.length > 0) {
          set((s) => {
            const patch = (t: Track): Track => (t.id === track.id ? { ...t, lyrics } : t);
            return {
              currentTrack: s.currentTrack?.id === track.id ? { ...s.currentTrack, lyrics } : s.currentTrack,
              queue: s.queue.map(patch),
              originalQueue: s.originalQueue.map(patch),
              localTracks: s.localTracks.map(patch),
            };
          });
        }
      }).catch(() => {});
    }

    // Update OS-level MediaSession
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artistName,
        album: track.albumTitle,
        artwork: [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }],
      });
    }
  },

  togglePlayPause: () => {
    const state = get();
    if (!state.currentTrack) return;

    if (!audioEngine.getCurrentUrl() || audioEngine.getCurrentUrl() !== state.currentTrack.audioUrl) {
      audioEngine.loadTrack(state.currentTrack.audioUrl, true);
      set({ isPlaying: true });
      return;
    }

    if (state.isPlaying) {
      audioEngine.pauseWithFade();
      set({ isPlaying: false });
    } else {
      audioEngine.playWithCrossfade();
      set({ isPlaying: true });
    }
  },

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),

  seekTo: (time: number) => {
    const clamped = Math.max(0, Math.min(time, get().duration));
    audioEngine.seek(clamped);
    set({ currentTime: clamped });
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    audioEngine.setVolume(clamped);
    localStorage.setItem('sonora_volume', clamped.toString());
    set({ volume: clamped, isMuted: clamped === 0 });
  },

  toggleMute: () => {
    const state = get();
    const nextMuted = !state.isMuted;
    audioEngine.setMuted(nextMuted);
    localStorage.setItem('sonora_muted', nextMuted.toString());
    set({ isMuted: nextMuted });
  },

  toggleShuffle: () => {
    const state = get();
    const nextShuffle = !state.isShuffle;
    localStorage.setItem('sonora_shuffle', nextShuffle.toString());

    if (nextShuffle) {
      const shuffled = shuffleFisherYates(state.queue);
      set({ isShuffle: true, queue: shuffled });
    } else {
      set({ isShuffle: false, queue: state.originalQueue });
    }
  },

  toggleRepeat: () => {
    const current = get().repeatMode;
    const next: RepeatMode = current === 'off' ? 'all' : current === 'all' ? 'one' : 'off';
    localStorage.setItem('sonora_repeat', next);
    set({ repeatMode: next });
  },

  skipNext: () => {
    const state = get();
    if (state.repeatMode === 'one' && state.currentTrack) {
      audioEngine.seek(0);
      audioEngine.playWithCrossfade();
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    if (state.queue.length > 0) {
      const nextTrack = state.queue[0];
      const remainingQueue = state.queue.slice(1);
      set({
        currentTrack: nextTrack,
        queue: remainingQueue,
        currentTime: 0,
        duration: nextTrack.duration,
        isPlaying: true,
        history: state.currentTrack ? [state.currentTrack, ...state.history] : state.history,
      });
      audioEngine.loadTrack(nextTrack.audioUrl, true);
    } else if (state.repeatMode === 'all' && state.history.length > 0) {
      const loopTrack = state.history[state.history.length - 1];
      set({
        currentTrack: loopTrack,
        currentTime: 0,
        duration: loopTrack.duration,
        isPlaying: true,
      });
      audioEngine.loadTrack(loopTrack.audioUrl, true);
    } else {
      audioEngine.pauseWithFade();
      set({ isPlaying: false, currentTime: 0 });
    }
  },

  skipPrevious: () => {
    const state = get();
    if (state.currentTime > 3) {
      audioEngine.seek(0);
      set({ currentTime: 0 });
      return;
    }

    if (state.history.length > 0) {
      const prevTrack = state.history[0];
      const remainingHistory = state.history.slice(1);
      set({
        currentTrack: prevTrack,
        history: remainingHistory,
        queue: state.currentTrack ? [state.currentTrack, ...state.queue] : state.queue,
        currentTime: 0,
        duration: prevTrack.duration,
        isPlaying: true,
      });
      audioEngine.loadTrack(prevTrack.audioUrl, true);
    } else {
      audioEngine.seek(0);
      set({ currentTime: 0 });
    }
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      queue: [...state.queue, track],
      originalQueue: [...state.originalQueue, track],
    }));
  },

  playNextTrack: (track: Track) => {
    set((state) => {
      const filtered = state.queue.filter((t) => t.id !== track.id);
      return {
        queue: [track, ...filtered],
        originalQueue: [track, ...filtered],
      };
    });
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      return { queue: newQueue };
    });
  },

  reorderQueue: (newQueue: Track[]) => {
    set({ queue: newQueue });
  },

  clearQueue: () => set({ queue: [] }),

  setEQPreset: (presetId: EQPresetId) => {
    const gains = audioEngine.setEQPreset(presetId);
    localStorage.setItem('sonora_eq_preset', presetId);
    localStorage.setItem('sonora_eq_gains', JSON.stringify(gains));
    set({ eqPreset: presetId, eqGains: gains });
  },

  setBandGain: (bandIndex: number, gain: number) => {
    const state = get();
    const newGains = [...state.eqGains] as [number, number, number, number, number];
    newGains[bandIndex] = gain;

    audioEngine.setEQGains(newGains);
    localStorage.setItem('sonora_eq_preset', 'custom');
    localStorage.setItem('sonora_eq_gains', JSON.stringify(newGains));
    set({ eqPreset: 'custom', eqGains: newGains });
  },

  toggleEQ: () => set((state) => ({ isEQOpen: !state.isEQOpen })),

  toggleWaveformMode: () => {
    const nextMode = get().waveformMode === 'progress' ? 'waveform' : 'progress';
    localStorage.setItem('sonora_waveform_mode', nextMode);
    set({ waveformMode: nextMode });
  },

  toggleSingMode: () => {
    const next = !get().isSingMode;
    audioEngine.setSingMode(next);
    set({ isSingMode: next });
  },

  setSingMode: (enabled: boolean) => {
    audioEngine.setSingMode(enabled);
    set({ isSingMode: enabled });
  },

  loadMultipleLocalAudioFiles: async (files: FileList | File[]): Promise<Track[]> => {
    const fileArray = Array.from(files).filter(
      (f) => f.type.startsWith('audio/') || /\.(mp3|wav|flac|ogg|m4a|aac)$/i.test(f.name)
    );
    if (fileArray.length === 0) return [];

    const newTracks: Track[] = fileArray.map((file, idx) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      let artistName = 'Local Audiophile Master';
      let title = cleanName;

      if (cleanName.includes(' - ')) {
        const parts = cleanName.split(' - ');
        artistName = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      return {
        id: `local-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        artistName,
        artistId: 'local-artist',
        albumTitle: 'Local Master Vault',
        albumId: 'local-vault',
        duration: 180,
        audioUrl: url,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        explicit: false,
        playsCount: 1,
        accentColor: '#00F59B',
        source: 'local' as const,
        sourceBadge: 'LOCAL FILE',
        audioQuality: 'LOCAL MASTER • LOSSLESS',
      };
    });

    const updatedLocal = [...get().localTracks, ...newTracks];
    set({ localTracks: updatedLocal });

    // Play first imported track immediately
    get().playTrack(newTracks[0], [...newTracks, ...get().queue]);

    // Trigger background metadata & lyrics enrichment for each file
    fileArray.forEach((file, idx) => {
      const trackId = newTracks[idx].id;
      enrichLocalAudioTrack(file.name).then((meta) => {
        set((state) => {
          const patchTrack = (t: Track): Track => {
            if (t.id !== trackId) return t;
            return {
              ...t,
              title: meta.title || t.title,
              artistName: meta.artistName || t.artistName,
              albumTitle: meta.albumTitle || t.albumTitle,
              coverUrl: meta.coverUrl || t.coverUrl,
              releaseDate: meta.releaseDate || t.releaseDate,
              lyrics: meta.lyrics || t.lyrics,
            };
          };

          const updatedCurrent =
            state.currentTrack && state.currentTrack.id === trackId
              ? patchTrack(state.currentTrack)
              : state.currentTrack;

          return {
            currentTrack: updatedCurrent,
            localTracks: state.localTracks.map(patchTrack),
            queue: state.queue.map(patchTrack),
            originalQueue: state.originalQueue.map(patchTrack),
          };
        });
      }).catch((err) => console.warn('Local file enrichment notice:', err));
    });

    return newTracks;
  },

  loadLocalAudioFile: (file: File): Track => {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    let artistName = 'Local Audiophile Master';
    let title = cleanName;

    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      artistName = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    const localTrack: Track = {
      id: `local-${Date.now()}`,
      title,
      artistName,
      artistId: 'local-artist',
      albumTitle: 'Local Master Vault',
      albumId: 'local-vault',
      duration: 180,
      audioUrl: URL.createObjectURL(file),
      coverUrl:
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      explicit: false,
      playsCount: 1,
      accentColor: '#00F59B',
      source: 'local' as const,
      sourceBadge: 'LOCAL FILE',
      audioQuality: 'LOCAL MASTER • LOSSLESS',
    };

    set((s) => ({ localTracks: [...s.localTracks, localTrack] }));
    get().playTrack(localTrack);

    enrichLocalAudioTrack(file.name).then((meta) => {
      set((state) => {
        const patchTrack = (t: Track): Track => {
          if (t.id !== localTrack.id) return t;
          return {
            ...t,
            title: meta.title || t.title,
            artistName: meta.artistName || t.artistName,
            albumTitle: meta.albumTitle || t.albumTitle,
            coverUrl: meta.coverUrl || t.coverUrl,
            releaseDate: meta.releaseDate || t.releaseDate,
            lyrics: meta.lyrics || t.lyrics,
          };
        };

        const updatedCurrent =
          state.currentTrack && state.currentTrack.id === localTrack.id
            ? patchTrack(state.currentTrack)
            : state.currentTrack;

        return {
          currentTrack: updatedCurrent,
          localTracks: state.localTracks.map(patchTrack),
          queue: state.queue.map(patchTrack),
          originalQueue: state.originalQueue.map(patchTrack),
        };
      });
    }).catch(() => {});

    return localTrack;
  },
}));

// Initialize hardware engine sync immediately
audioEngine.onTimeUpdate = (time) => {
  useAudioStore.getState().setCurrentTime(time);
};

audioEngine.onDurationChange = (dur) => {
  useAudioStore.getState().setDuration(dur);
};

audioEngine.onEnded = () => {
  useAudioStore.getState().skipNext();
};

audioEngine.onPlayStateChange = (playing) => {
  useAudioStore.getState().setIsPlaying(playing);
};

// Apply initial EQ and volume from storage to hardware engine
audioEngine.setVolume(savedPrefs.volume);
audioEngine.setMuted(savedPrefs.isMuted);
audioEngine.setEQGains(savedPrefs.eqGains);
audioEngine.loadTrack(mockTracks[0].audioUrl, false);
