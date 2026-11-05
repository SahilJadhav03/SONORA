import React from 'react';

export const DEFAULT_FALLBACK_COVER = '/logo.svg';

/**
 * Graceful image load error handler for all artwork, album covers, and artist avatars.
 * Prevents broken image icons and fallback loops.
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = DEFAULT_FALLBACK_COVER
): void => {
  const target = e.currentTarget;
  if (target.src !== fallbackSrc && !target.src.endsWith(fallbackSrc)) {
    target.src = fallbackSrc;
  }
};
