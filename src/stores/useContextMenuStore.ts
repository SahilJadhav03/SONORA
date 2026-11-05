import { create } from 'zustand';
import { Track } from '../types/music';

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  track: Track | null;
  openContextMenu: (x: number, y: number, track: Track) => void;
  closeContextMenu: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  track: null,

  openContextMenu: (x: number, y: number, track: Track) => {
    // Clamp to viewport
    const menuWidth = 230;
    const menuHeight = 360;
    const clampedX = Math.min(x, window.innerWidth - menuWidth - 12);
    const clampedY = Math.min(y, window.innerHeight - menuHeight - 12);

    set({
      isOpen: true,
      x: Math.max(12, clampedX),
      y: Math.max(12, clampedY),
      track,
    });
  },

  closeContextMenu: () => set({ isOpen: false, track: null }),
}));
