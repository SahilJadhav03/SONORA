import { useState, useEffect } from 'react';
import { extractDominantColors, ExtractedPalette } from '../utils/colorExtractor';

export const useDominantColors = (imageUrl?: string) => {
  const [palette, setPalette] = useState<ExtractedPalette>({
    primary: '#00F59B',
    secondary: '#8B5CF6',
    tertiary: '#3B82F6',
    accent: '#10B981',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;

    let isMounted = true;
    setIsLoading(true);

    extractDominantColors(imageUrl).then((extracted) => {
      if (isMounted) {
        setPalette(extracted);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return { palette, isLoading };
};
