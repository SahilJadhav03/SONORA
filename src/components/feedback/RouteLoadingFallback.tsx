import React from 'react';
import { CardSkeleton, RowSkeleton } from './SkeletonLoader';

/**
 * High-craft glassmorphic route loading skeleton
 * Matches the layout and dark aesthetics of SONORA views to eliminate any white flash
 */
export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-150 select-none">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-3.5 w-32 rounded-full bg-emerald/10 border border-emerald/20 animate-pulse" />
        <div className="h-10 sm:h-12 w-64 sm:w-96 rounded-xl bg-surface-2/60 animate-pulse" />
        <div className="h-4 w-48 sm:w-72 rounded-md bg-surface-2/30 animate-pulse" />
      </div>

      {/* Toolbar / Sonic Pills Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="h-8 w-24 rounded-full bg-surface-2/70 animate-pulse shrink-0" />
        <div className="h-8 w-28 rounded-full bg-surface-2/40 animate-pulse shrink-0" />
        <div className="h-8 w-32 rounded-full bg-surface-2/40 animate-pulse shrink-0" />
        <div className="h-8 w-20 rounded-full bg-surface-2/40 animate-pulse shrink-0" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Track Rows Skeleton */}
      <div className="p-4 rounded-xl bg-surface-1/40 border border-white/[0.04]">
        <RowSkeleton count={5} />
      </div>
    </div>
  );
};

/**
 * Lightweight skeleton fallback for right drawer
 */
export const DrawerLoadingFallback: React.FC = () => {
  return (
    <div className="p-4 space-y-4 w-full h-full animate-pulse select-none">
      <div className="h-6 w-1/2 rounded bg-surface-2" />
      <div className="aspect-square w-full rounded-2xl bg-surface-2/70" />
      <div className="space-y-2 pt-2">
        <div className="h-4 w-3/4 rounded bg-surface-2" />
        <div className="h-3 w-1/2 rounded bg-surface-2/60" />
      </div>
    </div>
  );
};
