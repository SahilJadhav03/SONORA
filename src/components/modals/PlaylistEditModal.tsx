import React, { useState, useEffect } from 'react';
import {
  X,
  Music,
  Headphones,
  Sparkles,
  Radio,
  Flame,
  Heart,
  Disc,
  Zap,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { cn } from '../../utils/cn';

const GRADIENT_PRESETS = [
  { id: 'g1', name: 'Emerald Wave', value: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #064E3B 100%)', color: '#10B981' },
  { id: 'g2', name: 'Violet Neon', value: 'linear-gradient(135deg, #7C3AED 0%, #C084FC 50%, #4C1D95 100%)', color: '#8B5CF6' },
  { id: 'g3', name: 'Cyber Sunset', value: 'linear-gradient(135deg, #F43F5E 0%, #FB923C 50%, #881337 100%)', color: '#F43F5E' },
  { id: 'g4', name: 'Ocean Depths', value: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 50%, #082F49 100%)', color: '#0284C7' },
  { id: 'g5', name: 'Amber Gold', value: 'linear-gradient(135deg, #D97706 0%, #FBBF24 50%, #78350F 100%)', color: '#F59E0B' },
  { id: 'g6', name: 'Obsidian Velvet', value: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #0F172A 100%)', color: '#6366F1' },
];

const ICONS = [
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'headphones', icon: Headphones, label: 'Headphones' },
  { id: 'sparkles', icon: Sparkles, label: 'Sparkles' },
  { id: 'flame', icon: Flame, label: 'Flame' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'disc', icon: Disc, label: 'Disc' },
  { id: 'zap', icon: Zap, label: 'Energy' },
  { id: 'radio', icon: Radio, label: 'Radio' },
];

// Helper to generate SVG data-uri from gradient and icon
export const generateCoverDataUrl = (gradient: string, iconId: string): string => {
  const iconSvgPaths: Record<string, string> = {
    music: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"></path>',
    sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>',
    disc: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path><circle cx="12" cy="12" r="2"></circle><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"></path>',
  };

  const path = iconSvgPaths[iconId] || iconSvgPaths.music;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <g transform="translate(140, 140) scale(5)" stroke="#ffffff" stroke-width="1.75" fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${path}
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PlaylistEditModal: React.FC = () => {
  const navigate = useNavigate();
  const activePlaylistModal = useUIStore((s) => s.activePlaylistModal);
  const closePlaylistModal = useUIStore((s) => s.closePlaylistModal);
  const addToast = useUIStore((s) => s.addToast);

  const customPlaylists = useLibraryStore((s) => s.customPlaylists);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const updatePlaylist = useLibraryStore((s) => s.updatePlaylist);

  const isEdit = activePlaylistModal?.mode === 'edit';
  const existingPlaylist = isEdit
    ? customPlaylists.find((p) => p.id === activePlaylistModal?.playlistId)
    : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (existingPlaylist) {
      setTitle(existingPlaylist.title);
      setDescription(existingPlaylist.description || '');
    } else {
      setTitle(`Playlist #${customPlaylists.length + 1}`);
      setDescription('Curated audio journey on SONORA');
      setSelectedGradient(GRADIENT_PRESETS[customPlaylists.length % GRADIENT_PRESETS.length]);
    }
  }, [existingPlaylist, customPlaylists.length]);

  useEffect(() => {
    if (!activePlaylistModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePlaylistModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePlaylistModal, closePlaylistModal]);

  if (!activePlaylistModal) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim() || 'Untitled Playlist';
    const coverUrl = generateCoverDataUrl(selectedGradient.value, selectedIcon.id);

    if (isEdit && existingPlaylist) {
      updatePlaylist(existingPlaylist.id, {
        title: cleanTitle,
        description: description.trim(),
        accentColor: selectedGradient.color,
      });
      addToast({
        title: 'Playlist Updated',
        message: `Saved changes to "${cleanTitle}"`,
        imageUrl: existingPlaylist.coverUrl,
        type: 'success',
      });
    } else {
      const newP = createPlaylist(
        cleanTitle,
        description.trim(),
        coverUrl,
        selectedGradient.color
      );
      addToast({
        title: 'Playlist Created',
        message: `"${cleanTitle}" added to your library`,
        imageUrl: coverUrl,
        type: 'success',
      });
      navigate(`/playlist/${newP.id}`);
    }

    closePlaylistModal();
  };

  const SelectedIconComponent = selectedIcon.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className="w-full max-w-lg rounded-2xl bg-surface-1/95 backdrop-blur-2xl border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 flex items-center justify-between border-b border-white/5">
          <h2 className="text-base sm:text-lg font-bold font-display text-white">
            {isEdit ? 'Edit Playlist Details' : 'Create New Playlist'}
          </h2>
          <button
            onClick={closePlaylistModal}
            className="p-1.5 rounded-full text-content-tertiary hover:text-white hover:bg-surface-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Live Artwork Generator Preview */}
            <div
              className="w-36 h-36 rounded-xl flex items-center justify-center shadow-elevation-2 border border-white/15 relative shrink-0 overflow-hidden"
              style={{ background: selectedGradient.value }}
            >
              <SelectedIconComponent className="w-14 h-14 text-white drop-shadow-lg" />
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-content-tertiary mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your playlist a title"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-white placeholder-content-muted text-sm focus:outline-none focus:border-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-content-tertiary mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add an optional description"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-white/10 text-white placeholder-content-muted text-xs focus:outline-none focus:border-emerald transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Artwork Generator Controls */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div>
              <span className="block text-[11px] uppercase font-bold text-content-tertiary mb-2">
                1. Choose Cover Gradient
              </span>
              <div className="grid grid-cols-6 gap-2">
                {GRADIENT_PRESETS.map((grad) => (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => setSelectedGradient(grad)}
                    className={cn(
                      'h-9 rounded-lg border transition-all flex items-center justify-center relative overflow-hidden',
                      selectedGradient.id === grad.id
                        ? 'border-white scale-105 shadow-glow-emerald'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    )}
                    style={{ background: grad.value }}
                  >
                    {selectedGradient.id === grad.id && (
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[11px] uppercase font-bold text-content-tertiary mb-2">
                2. Choose Emblem Icon
              </span>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedIcon(item)}
                      className={cn(
                        'p-2 rounded-lg border flex items-center justify-center transition-all',
                        isSelected
                          ? 'border-emerald bg-emerald/15 text-emerald'
                          : 'border-white/5 bg-surface-2 text-content-secondary hover:text-white hover:bg-surface-3'
                      )}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={closePlaylistModal}
              className="px-4 py-2 rounded-full text-xs font-semibold text-content-secondary hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-emerald text-canvas font-bold text-xs hover:bg-emerald-hover transition-all shadow-glow-emerald hover:scale-105 active:scale-95"
            >
              {isEdit ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
