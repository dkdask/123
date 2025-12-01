'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Track {
  id: string;
  name: string;
  artist: string;
  albumImage: string;
  duration?: string;
  previewUrl?: string | null;
}

interface PlaylistDisplayProps {
  tracks: Track[];
  title?: string;
  context?: string;
  isLoading?: boolean;
  onTrackClick?: (track: Track) => void;
}

export function PlaylistDisplay({
  tracks,
  title = 'Your Playlist',
  context,
  isLoading = false,
  onTrackClick,
}: PlaylistDisplayProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          {context && (
            <p className="text-sm text-gray-400">
              Personalized for your {context} session
            </p>
          )}
        </div>
        <span className="text-sm text-gray-400">{tracks.length} tracks</span>
      </div>

      <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No tracks yet. Select a context to generate your playlist!</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-gray-700/50">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onTrackClick?.(track)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-700/30 transition-colors cursor-pointer group"
                >
                  <span className="text-gray-500 w-6 text-center text-sm group-hover:hidden">
                    {index + 1}
                  </span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    className="hidden group-hover:flex w-6 items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.span>
                  
                  <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                    <img
                      src={track.albumImage || '/placeholder-album.svg'}
                      alt={track.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{track.name}</p>
                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                  </div>
                  
                  {track.duration && (
                    <span className="text-gray-500 text-sm">{track.duration}</span>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to liked tracks
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-600/50 rounded-full"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default PlaylistDisplay;
