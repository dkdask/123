'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { AlbumCard } from './ui/Card';

interface Album {
  id: string;
  name: string;
  imageUrl: string;
  artist?: string;
}

interface AlbumSliderProps {
  albums: Album[];
  title?: string;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  autoScroll?: boolean;
  scrollSpeed?: number;
}

export function AlbumSlider({
  albums,
  title,
  selectedIds = [],
  onSelect,
  autoScroll = true,
  scrollSpeed = 30,
}: AlbumSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Duplicate albums for infinite scroll effect
  const duplicatedAlbums = [...albums, ...albums, ...albums];
  
  useEffect(() => {
    if (!autoScroll || isPaused || !containerRef.current) return;
    
    const container = containerRef.current;
    const scrollWidth = container.scrollWidth / 3;
    
    const interval = setInterval(() => {
      setScrollPosition(prev => {
        const next = prev + 1;
        if (next >= scrollWidth) {
          return 0;
        }
        return next;
      });
    }, scrollSpeed);
    
    return () => clearInterval(interval);
  }, [autoScroll, isPaused, scrollSpeed]);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);
  
  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    }
  };
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 px-4">{title}</h3>
      )}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{
          scrollBehavior: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <AnimatePresence>
          {duplicatedAlbums.map((album, index) => (
            <motion.div
              key={`${album.id}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.02 }}
              className="flex-shrink-0"
            >
              <AlbumCard
                imageUrl={album.imageUrl}
                title={album.name}
                artist={album.artist}
                isSelected={selectedIds.includes(album.id)}
                onClick={() => handleSelect(album.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface GenreSliderProps {
  genres: Array<{ id: string; name: string; color: string }>;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
}

export function GenreSlider({
  genres,
  selectedIds = [],
  onSelect,
}: GenreSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div
      ref={containerRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide py-2"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      {genres.map((genre) => (
        <motion.div
          key={genre.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect?.(genre.id)}
          className={`
            flex-shrink-0 px-6 py-4 rounded-xl cursor-pointer
            transition-all duration-200
            border-2 ${selectedIds.includes(genre.id) ? 'border-white ring-2 ring-white/50' : 'border-transparent'}
          `}
          style={{ backgroundColor: genre.color }}
        >
          <span className="text-white font-bold text-sm whitespace-nowrap drop-shadow-lg">
            {genre.name}
          </span>
          {selectedIds.includes(genre.id) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default AlbumSlider;
