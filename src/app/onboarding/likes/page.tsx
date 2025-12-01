'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Genre categories matching the PDF design
const GENRES = [
  { id: 'k-pop', name: 'K-POP' },
  { id: 'indie', name: 'Indie' },
  { id: 'pop', name: 'POP' },
  { id: 'classic', name: 'Classic' },
  { id: 'edm', name: 'EDM' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'hip-hop', name: 'Hip Hop' },
  { id: 'r&b', name: 'R&B' },
  { id: 'rock', name: 'Rock' },
  { id: 'ballad', name: 'Ballad' },
];

export default function LikesPage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter genres based on search
  const filteredGenres = GENRES.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleNext = () => {
    localStorage.setItem('likedGenres', JSON.stringify(selectedGenres));
    router.push('/onboarding/dislikes');
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col relative overflow-hidden">
      {/* Decorative yellow-green blob shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -left-32 top-0 h-full w-[500px]" viewBox="0 0 400 800" fill="none">
          <path
            d="M-100 0 C 200 200, 300 400, 150 600 C 0 800, -100 800, -100 800 L -100 0"
            fill="#E8F5A3"
            opacity="0.7"
          />
        </svg>
        <svg className="absolute -left-20 bottom-0 w-[400px] h-[300px]" viewBox="0 0 400 300" fill="none">
          <path
            d="M0 300 C 100 200, 300 250, 400 100 L 0 100 L 0 300"
            fill="#E8F5A3"
            opacity="0.6"
          />
        </svg>
        <div className="absolute top-32 right-1/4 w-40 h-40 rounded-full bg-[#E8F5A3] opacity-50" />
        <div className="absolute top-20 left-1/4 w-24 h-24 rounded-full bg-[#E8F5A3] opacity-40" />
      </div>

      {/* Header */}
      <div className="p-8 pb-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            OO님의 음악 취향을 들려주세요
          </h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto mb-12"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="장르 또는 음악 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 text-center"
            />
            <svg
              className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Genre Cards - Single Row Horizontal Scroll */}
      <div className="flex-1 flex items-center z-10">
        <div className="w-full overflow-x-auto scrollbar-hide py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-6 px-8"
            style={{ minWidth: 'max-content' }}
          >
            {filteredGenres.map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleGenreSelect(genre.id)}
                className={`
                  flex-shrink-0 w-40 h-44 rounded-2xl cursor-pointer
                  flex flex-col items-center justify-end pb-4
                  transition-all duration-200
                  ${selectedGenres.includes(genre.id) 
                    ? 'ring-4 ring-[#C5D93D] bg-[#D4D4D4]' 
                    : 'bg-[#D4D4D4] hover:bg-[#C8C8C8]'
                  }
                `}
              >
                {/* Placeholder for album art */}
                <div className="w-24 h-24 bg-[#BFBFBF] rounded-lg mb-3" />
                <span className="text-black font-semibold text-lg">
                  {genre.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-8 z-10"
      >
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <span className="text-gray-600">1/2</span>
          
          <button
            onClick={handleNext}
            className="w-12 h-12 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
