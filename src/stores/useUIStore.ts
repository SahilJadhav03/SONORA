import { create } from 'zustand';
import { RightPanelMode, ToastMessage, ThemeAccent } from '../types/ui';

export const THEME_ACCENTS: Record<ThemeAccent, { primary: string; hover: string; ambient: string; name: string }> = {
  emerald: {
    primary: '#00F59B',
    hover: '#00DF89',
    ambient: 'rgba(0, 245, 155, 0.14)',
    name: 'Electric Emerald',
  },
  violet: {
    primary: '#A855F7',
    hover: '#9333EA',
    ambient: 'rgba(168, 85, 247, 0.16)',
    name: 'Electric Violet',
  },
  amber: {
    primary: '#F59E0B',
    hover: '#D97706',
    ambient: 'rgba(245, 158, 11, 0.16)',
    name: 'Cyber Amber',
  },
  rose: {
    primary: '#FB7185',
    hover: '#F43F5E',
    ambient: 'rgba(251, 113, 133, 0.16)',
    name: 'Rose Quartz',
  },
};

export const applyThemeAccent = (accent: ThemeAccent) => {
  const t = THEME_ACCENTS[accent] || THEME_ACCENTS.emerald;
  document.documentElement.style.setProperty('--sonora-emerald', t.primary);
  document.documentElement.style.setProperty('--sonora-emerald-hover', t.hover);
  document.documentElement.style.setProperty('--ambient-color', t.ambient);
};

// Safe localStorage loaders
const loadInitialTheme = (): ThemeAccent => {
  try {
    const saved = localStorage.getItem('sonora_theme_accent') as ThemeAccent | null;
    if (saved && THEME_ACCENTS[saved]) return saved;
  } catch {}
  return 'emerald';
};

const loadInitialSearchHistory = (): string[] => {
  try {
    const saved = localStorage.getItem('sonora_search_history');
    if (saved) return JSON.parse(saved);
  } catch {}
  return ['Aetheric Mirage', 'Kira Sterling', 'Electronic & Synth', 'Deep Ambient'];
};

interface UIStoreState {
  sidebarWidth: number;
  isSidebarCollapsed: boolean;
  rightPanelMode: RightPanelMode;
  isMobilePlayerOpen: boolean;
  isTheatreOpen: boolean;
  isCommandPaletteOpen: boolean;
  themeAccent: ThemeAccent;
  toasts: ToastMessage[];
  activeToast: ToastMessage | null; // For backward compatibility
  activePlaylistModal: { mode: 'create' | 'edit'; playlistId?: string } | null;
  searchHistory: string[];

  // Actions
  setSidebarWidth: (width: number) => void;
  toggleSidebarCollapse: () => void;
  setRightPanelMode: (mode: RightPanelMode) => void;
  toggleRightPanelMode: (mode: RightPanelMode) => void;
  setMobilePlayerOpen: (open: boolean) => void;
  setTheatreOpen: (open: boolean) => void;
  toggleTheatreOpen: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setThemeAccent: (accent: ThemeAccent) => void;
  openPlaylistModal: (mode: 'create' | 'edit', playlistId?: string) => void;
  closePlaylistModal: () => void;
  addSearchHistory: (query: string) => void;
  removeSearchHistoryItem: (query: string) => void;
  clearSearchHistory: () => void;

  // Toast actions
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  addToast: (toast: { message: string; type?: string; imageUrl?: string; title?: string }) => void;
  dismissToast: (id: string) => void;
  clearToast: () => void;
}

const initialTheme = loadInitialTheme();
applyThemeAccent(initialTheme);

export const useUIStore = create<UIStoreState>((set, get) => ({
  sidebarWidth: 280,
  isSidebarCollapsed: false,
  rightPanelMode: 'none',
  isMobilePlayerOpen: false,
  isTheatreOpen: false,
  isCommandPaletteOpen: false,
  themeAccent: initialTheme,
  toasts: [],
  activeToast: null,
  activePlaylistModal: null,
  searchHistory: loadInitialSearchHistory(),

  setSidebarWidth: (width: number) => {
    const clamped = Math.max(220, Math.min(420, width));
    set({ sidebarWidth: clamped, isSidebarCollapsed: false });
    document.documentElement.style.setProperty('--sidebar-width', `${clamped}px`);
  },

  toggleSidebarCollapse: () => {
    set((state) => {
      const nextCollapsed = !state.isSidebarCollapsed;
      const width = nextCollapsed ? 72 : state.sidebarWidth;
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      return { isSidebarCollapsed: nextCollapsed };
    });
  },

  setRightPanelMode: (mode: RightPanelMode) => {
    const width = mode === 'none' ? '0px' : '360px';
    document.documentElement.style.setProperty('--right-panel-width', width);
    set({ rightPanelMode: mode });
  },

  toggleRightPanelMode: (mode: RightPanelMode) => {
    set((state) => {
      const nextMode = state.rightPanelMode === mode ? 'none' : mode;
      const width = nextMode === 'none' ? '0px' : '360px';
      document.documentElement.style.setProperty('--right-panel-width', width);
      return { rightPanelMode: nextMode };
    });
  },

  setMobilePlayerOpen: (open: boolean) => set({ isMobilePlayerOpen: open, isTheatreOpen: open }),

  setTheatreOpen: (open: boolean) => set({ isTheatreOpen: open, isMobilePlayerOpen: open }),

  toggleTheatreOpen: () =>
    set((s) => {
      const next = !s.isTheatreOpen;
      return { isTheatreOpen: next, isMobilePlayerOpen: next };
    }),

  setCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),

  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),

  setThemeAccent: (accent: ThemeAccent) => {
    applyThemeAccent(accent);
    try {
      localStorage.setItem('sonora_theme_accent', accent);
    } catch {}
    set({ themeAccent: accent });
  },

  openPlaylistModal: (mode, playlistId) => set({ activePlaylistModal: { mode, playlistId } }),

  closePlaylistModal: () => set({ activePlaylistModal: null }),

  addSearchHistory: (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    set((state) => {
      const filtered = state.searchHistory.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const next = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('sonora_search_history', JSON.stringify(next));
      } catch {}
      return { searchHistory: next };
    });
  },

  removeSearchHistoryItem: (query: string) => {
    set((state) => {
      const next = state.searchHistory.filter((item) => item !== query);
      try {
        localStorage.setItem('sonora_search_history', JSON.stringify(next));
      } catch {}
      return { searchHistory: next };
    });
  },

  clearSearchHistory: () => {
    try {
      localStorage.removeItem('sonora_search_history');
    } catch {}
    set({ searchHistory: [] });
  },

  showToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({
      toasts: [newToast, ...state.toasts.slice(0, 2)],
      activeToast: newToast,
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },

  addToast: ({ message, type, imageUrl, title }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      title: title || message,
      description: title ? message : undefined,
      imageUrl,
      type: (type as 'success' | 'info' | 'error') || 'info',
      variant: type === 'success' ? 'emerald' : 'default',
    };
    set((state) => ({
      toasts: [newToast, ...state.toasts.slice(0, 2)],
      activeToast: newToast,
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },

  dismissToast: (id: string) => {
    set((state) => {
      const filtered = state.toasts.filter((t) => t.id !== id);
      return {
        toasts: filtered,
        activeToast: filtered[0] || null,
      };
    });
  },

  clearToast: () => set({ toasts: [], activeToast: null }),
}));
