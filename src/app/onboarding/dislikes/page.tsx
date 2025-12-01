'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { GENRE_CATEGORIES } from '@/lib/spotify';

export default function DislikesPage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter genres based on search
  const filteredGenres = GENRE_CATEGORIES.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group genres into rows for infinite scroll effect
  const rows = [
    filteredGenres.slice(0, 7),
    filteredGenres.slice(7, 14),
    filteredGenres.slice(14, 20),
  ].filter((row) => row.length > 0);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleNext = () => {
    // Save disliked genres to localStorage
    localStorage.setItem('dislikedGenres', JSON.stringify(selectedGenres));
    router.push('/onboarding/connect');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/30 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            What don&apos;t you enjoy?
          </h1>
          <p className="text-gray-400">
            Select genres you&apos;d prefer to avoid. This helps us personalize your experience.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            <input
              type="text"
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* Genre Sliders */}
      <div className="flex-1 overflow-hidden py-4">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, x: rowIndex % 2 === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + rowIndex * 0.1 }}
            className="mb-4"
          >
            <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide py-2">
              {/* Duplicate for infinite scroll effect */}
              {[...row, ...row].map((genre, index) => (
                <motion.div
                  key={`${genre.id}-${index}`}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenreSelect(genre.id)}
                  className={`
                    flex-shrink-0 px-8 py-6 rounded-2xl cursor-pointer
                    transition-all duration-200 relative overflow-hidden
                    ${selectedGenres.includes(genre.id) 
                      ? 'ring-4 ring-red-500 shadow-lg shadow-red-500/20 opacity-60' 
                      : ''
                    }
                  `}
                  style={{ backgroundColor: genre.color }}
                >
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {genre.name}
                  </span>
                  {selectedGenres.includes(genre.id) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-2"
      >
        <span className="text-gray-400">
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} marked as disliked
        </span>
      </motion.div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"
      >
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/onboarding/likes')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            rightIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Next
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
