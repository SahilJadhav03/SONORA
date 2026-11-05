import React, { useEffect } from 'react';
import { useAudioStore } from '../../stores/useAudioStore';
import { audioEngine } from '../../services/audio/AudioEngine';

export const AudioController: React.FC = () => {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const volume = useAudioStore((s) => s.volume);
  const isMuted = useAudioStore((s) => s.isMuted);

  // Setup global user interaction listener to wake up AudioContext (browser autoplay policy)
  useEffect(() => {
    const unlockAudio = () => {
      audioEngine.ensureContextInitialized();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Sync volume / mute with AudioEngine
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
    audioEngine.setMuted(isMuted);
  }, [volume, isMuted]);

  // Hook OS-level MediaSession action handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        useAudioStore.getState().togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        useAudioStore.getState().togglePlayPause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        useAudioStore.getState().skipPrevious();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        useAudioStore.getState().skipNext();
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          useAudioStore.getState().seekTo(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 5;
        const current = useAudioStore.getState().currentTime;
        useAudioStore.getState().seekTo(current - skip);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 5;
        const current = useAudioStore.getState().currentTime;
        useAudioStore.getState().seekTo(current + skip);
      });
    }
  }, []);

  return null; // Headless hardware bridge
};
