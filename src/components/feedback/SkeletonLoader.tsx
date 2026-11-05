import React from 'react';
import { cn } from '../../utils/cn';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'p-3.5 rounded-lg bg-surface-1/60 border border-white/5 space-y-3 animate-pulse',
        className
      )}
    >
      <div className="w-full aspect-square rounded-md bg-surface-2" />
      <div className="h-4 w-3/4 rounded bg-surface-2" />
      <div className="h-3 w-1/2 rounded bg-surface-2/60" />
    </div>
  );
};

export const RowSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-2.5 rounded-md bg-surface-1/40 animate-pulse border border-transparent"
        >
          <div className="w-6 h-4 bg-surface-2 rounded shrink-0" />
          <div className="w-10 h-10 bg-surface-2 rounded shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="w-1/3 h-4 bg-surface-2 rounded" />
            <div className="w-1/4 h-3 bg-surface-2/60 rounded" />
          </div>
          <div className="w-24 h-4 bg-surface-2/40 rounded hidden md:block" />
          <div className="w-12 h-4 bg-surface-2/50 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
};
