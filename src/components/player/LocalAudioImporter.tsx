import React, { useRef, useState, useEffect } from 'react';
import { Upload, Music, Sparkles } from 'lucide-react';
import { useAudioStore } from '../../stores/useAudioStore';
import { useUIStore } from '../../stores/useUIStore';
import { cn } from '../../utils/cn';

export const LocalAudioImporter: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const loadLocalAudioFile = useAudioStore((s) => s.loadLocalAudioFile);
  const addToast = useUIStore((s) => s.addToast);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith('audio/') || /\.(mp3|wav|flac|ogg|m4a|aac)$/i.test(file.name)) {
      const track = loadLocalAudioFile(file);
      addToast({
        type: 'success',
        message: `Imported "${track.title}" to local session`,
      });
    } else {
      addToast({
        type: 'info',
        message: 'Please drop a valid audio file (.mp3, .wav, .flac, .ogg, .m4a)',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Window-level drag and drop listener
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      // If mouse leaves the window
      if (!e.relatedTarget || (e.relatedTarget as HTMLElement).nodeName === 'HTML') {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
        onChange={handleInputChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-white/10 text-xs font-semibold text-content-primary hover:text-white transition-all hover:scale-105 active:scale-95',
          className
        )}
        title="Import local MP3, WAV or FLAC"
      >
        <Upload className="w-3.5 h-3.5 text-emerald" />
        <span>{children || 'Import Audio'}</span>
      </button>

      {/* Full-screen Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-canvas/90 backdrop-blur-xl border-4 border-dashed border-emerald flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center mb-4 text-emerald animate-bounce">
            <Music className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white">
            Drop Your Audio Master Into SONORA
          </h2>
          <p className="text-sm text-content-secondary max-w-md mt-2">
            Instant hardware DSP playback, 5-band EQ, and live FFT visualizer for any local .mp3, .wav, or .flac file.
          </p>
          <div className="flex items-center gap-2 mt-4 px-3 py-1 rounded-full bg-surface-2 text-xs font-mono text-emerald border border-emerald/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Server Upload • Instant Browser Memory Decoding</span>
          </div>
        </div>
      )}
    </>
  );
};
