import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { cn } from '../../utils/cn';

export const LayoutResizer: React.FC = () => {
  const setSidebarWidth = useUIStore((s) => s.setSidebarWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = useUIStore.getState().sidebarWidth;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;
      setSidebarWidth(newWidth);
    },
    [isDragging, setSidebarWidth]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (isDragging) {
        setIsDragging(false);
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={() => setSidebarWidth(280)}
      className={cn(
        'w-[6px] -ml-[3px] -mr-[3px] z-30 cursor-col-resize group relative flex items-center justify-center transition-colors select-none',
        isDragging && 'bg-emerald/40'
      )}
      title="Drag to resize sidebar (Double click to reset)"
      role="separator"
      aria-orientation="vertical"
    >
      <div
        className={cn(
          'w-[2px] h-8 rounded-full bg-white/10 group-hover:bg-emerald transition-colors',
          isDragging && 'bg-emerald h-12 shadow-glow-emerald'
        )}
      />
    </div>
  );
};
