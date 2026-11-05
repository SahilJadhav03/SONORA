import React from 'react';
import { GenreCategory } from '../../types/music';
import { handleImageError } from '../../utils/imageFallback';
import { cn } from '../../utils/cn';

interface CategoryCardProps {
  category: GenreCategory;
  onClick?: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  className,
}) => {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: category.color }}
      className={cn(
        'relative aspect-[16/10] overflow-hidden rounded-lg p-4 cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-elevation-1',
        className
      )}
    >
      <h3 className="text-xl font-bold font-display text-white max-w-[70%] leading-tight drop-shadow-sm">
        {category.title}
      </h3>

      <div className="absolute -bottom-2 -right-3 w-24 h-24 sm:w-28 sm:h-28 rotate-[25deg] shadow-elevation-2 rounded-md overflow-hidden transition-transform duration-300 group-hover:rotate-[28deg] group-hover:scale-105">
        <img
          src={category.coverUrl}
          alt={category.title}
          onError={handleImageError}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};
