'use client';

import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  isSelected = false,
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-gray-800/50 backdrop-blur-sm
        rounded-2xl
        border ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-gray-700/50'}
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-xl hover:shadow-purple-500/10' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

interface AlbumCardProps {
  imageUrl: string;
  title: string;
  artist?: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const cardSizes = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
};

const imageSizes = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-40 h-40',
};

export function AlbumCard({
  imageUrl,
  title,
  artist,
  isSelected = false,
  onClick,
  size = 'md',
}: AlbumCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${cardSizes[size]}
        flex flex-col items-center justify-center p-2
        bg-gray-800/60 backdrop-blur-sm
        rounded-xl
        border-2 ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-transparent'}
        cursor-pointer
        transition-all duration-200
        hover:bg-gray-700/60
        group
      `}
    >
      <div className={`${imageSizes[size]} rounded-lg overflow-hidden mb-2 shadow-lg`}>
        <img
          src={imageUrl || '/placeholder-album.png'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-album.png';
          }}
        />
      </div>
      <p className="text-xs text-center text-white font-medium truncate w-full px-1">
        {title}
      </p>
      {artist && (
        <p className="text-xs text-gray-400 truncate w-full text-center">
          {artist}
        </p>
      )}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

export function GenreCard({
  name,
  color,
  isSelected = false,
  onClick,
}: {
  name: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        px-6 py-4
        rounded-xl
        cursor-pointer
        transition-all duration-200
        border-2 ${isSelected ? 'border-white ring-2 ring-white/50' : 'border-transparent'}
        relative overflow-hidden
      `}
      style={{ backgroundColor: color }}
    >
      <span className="text-white font-bold text-lg relative z-10 drop-shadow-lg">
        {name}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Card;
