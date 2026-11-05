export type RightPanelMode = 'none' | 'now-playing' | 'info' | 'lyrics' | 'queue';

export type ThemeAccent = 'emerald' | 'violet' | 'amber' | 'rose';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  variant?: 'default' | 'success' | 'emerald';
  type?: 'success' | 'info' | 'error';
}
