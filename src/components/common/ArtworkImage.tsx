import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ArtworkImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'circle' | 'banner';
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'square',
  rounded = 'md',
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  const aspectClasses = {
    square: 'aspect-square',
    circle: 'aspect-square rounded-full',
    banner: 'aspect-[3/1] w-full',
  }[aspectRatio];

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-2 transition-all duration-300',
        aspectClasses,
        roundedClasses,
        className
      )}
    >
      {/* Skeleton Shimmer when loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface-2 via-surface-3 to-surface-2 animate-pulse" />
      )}

      {/* Fallback Icon on Error */}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-surface-3 via-surface-2 to-surface-1 text-content-tertiary p-3 select-none">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-emerald shadow-sm mb-1">
            <Music className="w-5 h-5 stroke-[1.5]" />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-content-muted uppercase">SONORA Hi-Fi</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        />
      )}
    </div>
  );
};
