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
        bg-white/80 backdrop-blur-sm
        rounded-2xl
        border ${isSelected ? 'border-[#C5D93D] ring-2 ring-[#C5D93D]/50' : 'border-gray-200'}
        ${onClick ? 'cursor-pointer' : ''}
        ${hoverable ? 'transition-shadow hover:shadow-xl hover:shadow-gray-300/30' : ''}
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
  sm: 'w-24 h-32',
  md: 'w-36 h-52',
  lg: 'w-56 h-80',
};

const imageSizes = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
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
        flex flex-col items-center justify-start p-3
        bg-[#D4D4D4] backdrop-blur-sm
        rounded-xl
        border-2 ${isSelected ? 'border-[#C5D93D] ring-2 ring-[#C5D93D]/50' : 'border-transparent'}
        cursor-pointer
        transition-all duration-200
        hover:bg-[#C8C8C8]
        group
      `}
    >
      <div className={`${imageSizes[size]} rounded-lg overflow-hidden mb-3 shadow-lg flex-shrink-0`}>
        <img
          src={imageUrl || '/placeholder-album.svg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-album.svg';
          }}
        />
      </div>
      <div className="w-full flex-1 flex flex-col justify-start overflow-hidden px-2">
        <p className={`text-center text-black font-bold w-full ${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-base' : 'text-xs'}`} style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.3',
        }}>
          {title}
        </p>
        {artist && (
          <p className={`text-gray-600 w-full text-center mt-1 ${size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'}`} style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {artist}
          </p>
        )}
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1 w-5 h-5 bg-[#C5D93D] rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
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
        border-2 ${isSelected ? 'border-[#C5D93D] ring-2 ring-[#C5D93D]/50' : 'border-transparent'}
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
          className="absolute top-2 right-2 w-6 h-6 bg-[#C5D93D] rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Card;
