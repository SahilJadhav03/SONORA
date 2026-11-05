import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../../stores/useUIStore';
import { handleImageError } from '../../utils/imageFallback';
import { CheckCircle2, Sparkles, X, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2 max-w-md w-full px-4 select-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          // Stacking visual offsets
          const isTop = index === 0;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{
                opacity: 1 - index * 0.15,
                y: 0,
                scale: 1 - index * 0.04,
              }}
              exit={{ opacity: 0, y: -16, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="pointer-events-auto w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-surface-1/90 backdrop-blur-2xl border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.12)] text-content-primary"
            >
              {/* Left: Micro-Artwork Thumbnail or Status Icon */}
              <div className="flex items-center gap-3 min-w-0">
                {toast.imageUrl ? (
                  <img
                    src={toast.imageUrl}
                    alt="Artwork Preview"
                    onError={handleImageError}
                    className="w-10 h-10 rounded-lg object-cover shadow-md border border-white/10 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald/15 border border-emerald/30 flex items-center justify-center shrink-0">
                    {toast.variant === 'emerald' || toast.type === 'success' ? (
                      <Sparkles className="w-4 h-4 text-emerald" />
                    ) : (
                      <Info className="w-4 h-4 text-emerald" />
                    )}
                  </div>
                )}

                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-xs sm:text-sm font-bold text-white truncate font-display">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="text-[11px] text-content-secondary truncate">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Dismiss button */}
              <button
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded-full text-content-tertiary hover:text-white hover:bg-white/10 transition-colors shrink-0 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
