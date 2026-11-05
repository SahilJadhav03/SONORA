import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-12',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-surface-2 border border-white/5 flex items-center justify-center mb-4 text-content-tertiary">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-content-primary mb-1.5 font-display">{title}</h3>
      <p className="text-sm text-content-secondary mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-white text-canvas hover:bg-emerald hover:text-canvas font-medium text-sm transition-all duration-200 shadow-elevation-1 hover:shadow-glow-emerald"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
