import { useEffect } from 'react';
import { useAudioStore } from '../stores/useAudioStore';
import { useLibraryStore } from '../stores/useLibraryStore';
import { useUIStore } from '../stores/useUIStore';
import { formatTime } from '../utils/formatters';

export const useGlobalShortcuts = () => {
  const togglePlayPause = useAudioStore((s) => s.togglePlayPause);
  const skipNext = useAudioStore((s) => s.skipNext);
  const skipPrevious = useAudioStore((s) => s.skipPrevious);
  const seekTo = useAudioStore((s) => s.seekTo);
  const toggleMute = useAudioStore((s) => s.toggleMute);
  const toggleEQ = useAudioStore((s) => s.toggleEQ);
  const toggleWaveformMode = useAudioStore((s) => s.toggleWaveformMode);
  const toggleLikeTrack = useLibraryStore((s) => s.toggleLikeTrack);
  const toggleRightPanelMode = useUIStore((s) => s.toggleRightPanelMode);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code || '';

      // 0. Global Command Palette: Cmd+K or Ctrl+K (fires everywhere)
      if ((e.metaKey || e.ctrlKey) && (key === 'k' || code === 'KeyK')) {
        e.preventDefault();
        useUIStore.getState().toggleCommandPalette();
        return;
      }

      // 0b. Universal Escape closes topmost active modal/overlay in hierarchy
      if (key === 'escape' || code === 'Escape') {
        const uiState = useUIStore.getState();
        if (uiState.isCommandPaletteOpen) {
          e.preventDefault();
          uiState.setCommandPaletteOpen(false);
          return;
        }
        if (uiState.activePlaylistModal) {
          e.preventDefault();
          uiState.closePlaylistModal();
          return;
        }
        if (uiState.isTheatreOpen) {
          e.preventDefault();
          uiState.setTheatreOpen(false);
          return;
        }
        if (useAudioStore.getState().isEQOpen) {
          e.preventDefault();
          useAudioStore.getState().toggleEQ();
          return;
        }
        if (uiState.rightPanelMode !== 'none') {
          e.preventDefault();
          uiState.setRightPanelMode('none');
          return;
        }
      }

      // 1. Guard against firing when user is typing in forms, search, inputs or editable areas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable ||
          Boolean(target.closest('input, textarea, select, [contenteditable="true"]')))
      ) {
        return;
      }

      // 2. Play / Pause: Space or 'K'
      if (code === 'Space' || key === ' ' || key === 'spacebar' || code === 'KeyK' || key === 'k') {
        e.preventDefault();
        if (target && target.tagName === 'BUTTON') {
          target.blur();
        }
        togglePlayPause();
        const isNowPlaying = useAudioStore.getState().isPlaying;
        const track = useAudioStore.getState().currentTrack;
        addToast({
          type: 'info',
          message: isNowPlaying ? `Playing: ${track?.title || 'Track'}` : 'Playback Paused',
        });
        return;
      }

      // 3. Skip Next: Shift + RightArrow or 'N'
      if ((e.shiftKey && (code === 'ArrowRight' || key === 'arrowright')) || code === 'KeyN' || key === 'n') {
        e.preventDefault();
        skipNext();
        addToast({ type: 'info', message: 'Skipped to next track' });
        return;
      }

      // 4. Skip Previous: Shift + LeftArrow or 'P'
      if ((e.shiftKey && (code === 'ArrowLeft' || key === 'arrowleft')) || code === 'KeyP' || key === 'p') {
        e.preventDefault();
        skipPrevious();
        addToast({ type: 'info', message: 'Returned to previous track' });
        return;
      }

      // 5. Seek Forward: RightArrow (+5s)
      if (code === 'ArrowRight' || key === 'arrowright') {
        e.preventDefault();
        const cur = useAudioStore.getState().currentTime;
        const dur = useAudioStore.getState().duration;
        const next = Math.min(dur, cur + 5);
        seekTo(next);
        addToast({ type: 'info', message: `Fast Forward: ${formatTime(next)} (+5s)` });
        return;
      }

      // 6. Seek Backward: LeftArrow (-5s)
      if (code === 'ArrowLeft' || key === 'arrowleft') {
        e.preventDefault();
        const cur = useAudioStore.getState().currentTime;
        const prev = Math.max(0, cur - 5);
        seekTo(prev);
        addToast({ type: 'info', message: `Rewind: ${formatTime(prev)} (-5s)` });
        return;
      }

      // 7. Mute / Unmute: 'M'
      if (code === 'KeyM' || key === 'm') {
        e.preventDefault();
        toggleMute();
        const isMuted = useAudioStore.getState().isMuted;
        addToast({
          type: 'info',
          message: isMuted ? 'Muted (Audio M)' : 'Unmuted',
        });
        return;
      }

      // 8. Like / Favorite: 'L'
      if (code === 'KeyL' || key === 'l') {
        e.preventDefault();
        const currentTrack = useAudioStore.getState().currentTrack;
        if (currentTrack) {
          const liked = toggleLikeTrack(currentTrack.id);
          addToast({
            type: liked ? 'success' : 'info',
            message: liked ? `Liked "${currentTrack.title}"` : `Removed from Liked Songs`,
          });
        }
        return;
      }

      // 9. Equalizer Toggle: 'E'
      if (code === 'KeyE' || key === 'e') {
        e.preventDefault();
        toggleEQ();
        const isEQOpen = useAudioStore.getState().isEQOpen;
        addToast({
          type: 'info',
          message: isEQOpen ? '5-Band Equalizer Opened' : 'Equalizer Closed',
        });
        return;
      }

      // 10. Waveform View Toggle: 'W'
      if (code === 'KeyW' || key === 'w') {
        e.preventDefault();
        toggleWaveformMode();
        const mode = useAudioStore.getState().waveformMode;
        addToast({
          type: 'info',
          message: mode === 'waveform' ? 'Waveform Scrubber Active' : 'Smooth Scrubber Active',
        });
        return;
      }

      // 11. Bento Drawer Toggle: 'I'
      if (code === 'KeyI' || key === 'i') {
        e.preventDefault();
        toggleRightPanelMode('info');
        return;
      }

      // 12. Queue Drawer Toggle: 'Q'
      if (code === 'KeyQ' || key === 'q') {
        e.preventDefault();
        toggleRightPanelMode('queue');
        return;
      }

      // 13. Full-Screen Immersive Theatre Toggle: 'F'
      if (code === 'KeyF' || key === 'f') {
        e.preventDefault();
        useUIStore.getState().toggleTheatreOpen();
        const isOpen = useUIStore.getState().isTheatreOpen;
        addToast({
          type: 'info',
          message: isOpen ? 'Immersive Theatre Mode Opened' : 'Theatre Closed',
        });
        return;
      }

      // 11. Volume Up: ArrowUp (+5%)
      if (code === 'ArrowUp' || key === 'arrowup') {
        e.preventDefault();
        const vol = useAudioStore.getState().volume;
        const nextVol = Math.min(1, Math.round((vol + 0.05) * 100) / 100);
        useAudioStore.getState().setVolume(nextVol);
        addToast({ type: 'info', message: `Volume: ${Math.round(nextVol * 100)}%` });
        return;
      }

      // 12. Volume Down: ArrowDown (-5%)
      if (code === 'ArrowDown' || key === 'arrowdown') {
        e.preventDefault();
        const vol = useAudioStore.getState().volume;
        const nextVol = Math.max(0, Math.round((vol - 0.05) * 100) / 100);
        useAudioStore.getState().setVolume(nextVol);
        addToast({ type: 'info', message: `Volume: ${Math.round(nextVol * 100)}%` });
        return;
      }
    };

    // Attach with capture: true so shortcuts intercept regardless of focused container
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    toggleMute,
    toggleEQ,
    toggleWaveformMode,
    toggleLikeTrack,
    addToast,
  ]);
};
