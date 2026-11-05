import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ComponentShelfProps {
  title: string;
  seeAllLabel?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ComponentShelf: React.FC<ComponentShelfProps> = ({
  title,
  seeAllLabel = 'Show all',
  onSeeAll,
  children,
  className,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const offset = scrollerRef.current.clientWidth * 0.75;
      scrollerRef.current.scrollBy({
        left: direction === 'left' ? -offset : offset,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <section className={cn('relative my-6 group/shelf', className)}>
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-3 px-1">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-content-primary tracking-tight">
          {title}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs sm:text-sm font-semibold text-content-secondary hover:text-emerald transition-colors"
          >
            {seeAllLabel}
          </button>
        )}
      </div>

      {/* Scroller Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-9 h-9 rounded-full bg-surface-3/90 hover:bg-surface-4 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-elevation-2 opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scroll Content */}
        <div
          ref={scrollerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 -mx-1"
        >
          {children}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-9 h-9 rounded-full bg-surface-3/90 hover:bg-surface-4 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-elevation-2 opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};
