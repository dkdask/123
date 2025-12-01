'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
}

interface SearchResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  genres: string[];
}

// Genre categories with album covers
const GENRES = [
  { id: 'k-pop', name: 'K-POP', albums: [
    { name: 'BE', artist: 'BTS', image: 'https://i.scdn.co/image/ab67616d0000b273f82ff6d7e7cd4e0829a10dd4' },
    { name: 'THE ALBUM', artist: 'BLACKPINK', image: 'https://i.scdn.co/image/ab67616d0000b2736e7d9d70f5b0b0c9c5f5c5c5' },
    { name: 'Next Level', artist: 'aespa', image: 'https://i.scdn.co/image/ab67616d0000b273a4c4c4c4c4c4c4c4c4c4c4c4' },
  ]},
  { id: 'indie', name: 'Indie', albums: [
    { name: 'AM', artist: 'Arctic Monkeys', image: 'https://i.scdn.co/image/ab67616d0000b2736e7d9d70f5b0b0c9c5f5c5c5' },
    { name: 'For Emma', artist: 'Bon Iver', image: 'https://i.scdn.co/image/ab67616d0000b273a4c4c4c4c4c4c4c4c4c4c4c4' },
    { name: 'Oracular', artist: 'MGMT', image: 'https://i.scdn.co/image/ab67616d0000b273b5b5b5b5b5b5b5b5b5b5b5b5' },
  ]},
  { id: 'pop', name: 'POP', albums: [
    { name: 'After Hours', artist: 'The Weeknd', image: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
    { name: 'Future Nostalgia', artist: 'Dua Lipa', image: 'https://i.scdn.co/image/ab67616d0000b273d4c4c4c4c4c4c4c4c4c4c4c4' },
    { name: 'Midnights', artist: 'Taylor Swift', image: 'https://i.scdn.co/image/ab67616d0000b273e5e5e5e5e5e5e5e5e5e5e5e5' },
  ]},
  { id: 'classic', name: 'Classic', albums: [
    { name: 'Piano Sonatas', artist: 'Beethoven', image: 'https://i.scdn.co/image/ab67616d0000b273f6f6f6f6f6f6f6f6f6f6f6f6' },
    { name: 'The Four Seasons', artist: 'Vivaldi', image: 'https://i.scdn.co/image/ab67616d0000b273a7a7a7a7a7a7a7a7a7a7a7a7' },
    { name: 'Suite bergamasque', artist: 'Debussy', image: 'https://i.scdn.co/image/ab67616d0000b273b8b8b8b8b8b8b8b8b8b8b8b8' },
  ]},
  { id: 'edm', name: 'EDM', albums: [
    { name: 'True', artist: 'Avicii', image: 'https://i.scdn.co/image/ab67616d0000b273c9c9c9c9c9c9c9c9c9c9c9c9' },
    { name: 'Clarity', artist: 'Zedd', image: 'https://i.scdn.co/image/ab67616d0000b273dadadadadadadadadadadada' },
    { name: 'Animals', artist: 'Martin Garrix', image: 'https://i.scdn.co/image/ab67616d0000b273ebebebebebebebebebebeb' },
  ]},
  { id: 'jazz', name: 'Jazz', albums: [
    { name: 'Kind of Blue', artist: 'Miles Davis', image: 'https://i.scdn.co/image/ab67616d0000b273fcfcfcfcfcfcfcfcfcfcfcfc' },
    { name: 'Time Out', artist: 'Dave Brubeck', image: 'https://i.scdn.co/image/ab67616d0000b2730d0d0d0d0d0d0d0d0d0d0d0d' },
    { name: 'A Love Supreme', artist: 'John Coltrane', image: 'https://i.scdn.co/image/ab67616d0000b2731e1e1e1e1e1e1e1e1e1e1e1e' },
  ]},
  { id: 'hip-hop', name: 'Hip Hop', albums: [
    { name: 'DAMN.', artist: 'Kendrick Lamar', image: 'https://i.scdn.co/image/ab67616d0000b2732f2f2f2f2f2f2f2f2f2f2f2f' },
    { name: 'Astroworld', artist: 'Travis Scott', image: 'https://i.scdn.co/image/ab67616d0000b2733f3f3f3f3f3f3f3f3f3f3f3f' },
    { name: 'Scorpion', artist: 'Drake', image: 'https://i.scdn.co/image/ab67616d0000b2734f4f4f4f4f4f4f4f4f4f4f4f' },
  ]},
  { id: 'r&b', name: 'R&B', albums: [
    { name: 'Freudian', artist: 'Daniel Caesar', image: 'https://i.scdn.co/image/ab67616d0000b2735f5f5f5f5f5f5f5f5f5f5f5f' },
    { name: 'SOS', artist: 'SZA', image: 'https://i.scdn.co/image/ab67616d0000b2736f6f6f6f6f6f6f6f6f6f6f6f' },
    { name: 'Ctrl', artist: 'SZA', image: 'https://i.scdn.co/image/ab67616d0000b2737f7f7f7f7f7f7f7f7f7f7f7f' },
  ]},
  { id: 'rock', name: 'Rock', albums: [
    { name: 'A Night at the Opera', artist: 'Queen', image: 'https://i.scdn.co/image/ab67616d0000b2738f8f8f8f8f8f8f8f8f8f8f8f' },
    { name: 'Back in Black', artist: 'AC/DC', image: 'https://i.scdn.co/image/ab67616d0000b2739f9f9f9f9f9f9f9f9f9f9f9f' },
    { name: 'Led Zeppelin IV', artist: 'Led Zeppelin', image: 'https://i.scdn.co/image/ab67616d0000b273afafafafafafafafafafafaf' },
  ]},
  { id: 'ballad', name: 'Ballad', albums: [
    { name: '21', artist: 'Adele', image: 'https://i.scdn.co/image/ab67616d0000b273bfbfbfbfbfbfbfbfbfbfbfbf' },
    { name: '÷ (Divide)', artist: 'Ed Sheeran', image: 'https://i.scdn.co/image/ab67616d0000b273cfcfcfcfcfcfcfcfcfcfcfcf' },
    { name: 'Love in the Future', artist: 'John Legend', image: 'https://i.scdn.co/image/ab67616d0000b273dfdfdfdfdfdfdfdfdfdfdfdf' },
  ]},
];

// Genre detection based on track characteristics
const detectGenreFromTrack = (track: SpotifyTrack): string[] => {
  const artist = track.artists.map(a => a.name.toLowerCase()).join(' ');
  const genres: string[] = [];
  
  if (artist.includes('bts') || artist.includes('blackpink') || artist.includes('aespa') || artist.includes('twice') || artist.includes('exo')) {
    genres.push('k-pop');
  }
  if (artist.includes('arctic monkeys') || artist.includes('bon iver') || artist.includes('tame impala')) {
    genres.push('indie');
  }
  if (artist.includes('beethoven') || artist.includes('mozart') || artist.includes('bach') || artist.includes('vivaldi')) {
    genres.push('classic');
  }
  if (artist.includes('avicii') || artist.includes('deadmau5') || artist.includes('martin garrix') || artist.includes('zedd')) {
    genres.push('edm');
  }
  if (artist.includes('miles davis') || artist.includes('john coltrane') || artist.includes('dave brubeck')) {
    genres.push('jazz');
  }
  if (artist.includes('kendrick') || artist.includes('drake') || artist.includes('travis scott') || artist.includes('kanye')) {
    genres.push('hip-hop');
  }
  if (artist.includes('sza') || artist.includes('daniel caesar') || artist.includes('frank ocean') || artist.includes('the weeknd')) {
    genres.push('r&b');
  }
  if (artist.includes('queen') || artist.includes('led zeppelin') || artist.includes('ac/dc') || artist.includes('guns n')) {
    genres.push('rock');
  }
  if (artist.includes('adele') || artist.includes('ed sheeran') || artist.includes('john legend')) {
    genres.push('ballad');
  }
  if (artist.includes('taylor swift') || artist.includes('dua lipa') || artist.includes('ariana grande') || artist.includes('justin bieber')) {
    genres.push('pop');
  }
  
  if (genres.length === 0) {
    genres.push('pop');
  }
  
  return genres;
};

export default function DislikesPage() {
  const router = useRouter();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredGenres = GENRES.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchSpotify = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/spotify?action=search&query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const tracks: SpotifyTrack[] = data.tracks?.items || [];
        
        const results: SearchResult[] = tracks.slice(0, 5).map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map((a) => a.name).join(', '),
          album: track.album.name,
          imageUrl: track.album.images[0]?.url || '/placeholder-album.svg',
          genres: detectGenreFromTrack(track),
        }));
        
        setSearchResults(results);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchSpotify(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, searchSpotify]);

  const handleGenreSelect = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSearchResultClick = (result: SearchResult) => {
    result.genres.forEach((genre) => {
      if (!selectedGenres.includes(genre)) {
        setSelectedGenres((prev) => [...prev, genre]);
      }
    });
    setSearchQuery('');
    setShowResults(false);
  };

  const handleNext = () => {
    localStorage.setItem('dislikedGenres', JSON.stringify(selectedGenres));
    router.push('/onboarding/connect');
  };

  const handleSkip = () => {
    router.push('/onboarding/connect');
  };

  const handleSlideChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentSlide((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentSlide((prev) => Math.min(filteredGenres.length - 1, prev + 1));
    }
  };

  useEffect(() => {
    if (sliderRef.current) {
      const slideWidth = 176;
      sliderRef.current.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth',
      });
    }
  }, [currentSlide]);

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
      </div>

      {/* Header */}
      <div className="p-8 pb-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            OO님이 잘 듣지 않는 음악을 골라주세요
          </h1>
        </motion.div>

        {/* Search Bar with Spotify Integration */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg mx-auto mb-8 relative"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="노래 또는 아티스트 검색 (Spotify)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-gray-300 rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 text-center"
            />
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
              />
            ) : (
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
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-50"
              >
                {searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    whileHover={{ backgroundColor: '#fef2f2' }}
                    onClick={() => handleSearchResultClick(result)}
                    className="flex items-center gap-3 p-3 cursor-pointer border-b last:border-b-0"
                  >
                    <img
                      src={result.imageUrl}
                      alt={result.album}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{result.name}</p>
                      <p className="text-sm text-gray-500 truncate">{result.artist}</p>
                    </div>
                    <div className="flex gap-1">
                      {result.genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"
                        >
                          {GENRES.find((g) => g.id === genre)?.name || genre}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Selected Genres Tags */}
        {selectedGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 justify-center mb-4"
          >
            {selectedGenres.map((genreId) => {
              const genre = GENRES.find((g) => g.id === genreId);
              return (
                <motion.span
                  key={genreId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 bg-red-400 text-white rounded-full text-sm font-medium flex items-center gap-1"
                >
                  {genre?.name || genreId}
                  <button
                    onClick={() => handleGenreSelect(genreId)}
                    className="ml-1 w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded-full"
                  >
                    ×
                  </button>
                </motion.span>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Genre Cards with Album Covers - Horizontal Scroll with Slider */}
      <div className="flex-1 flex flex-col justify-center z-10">
        <div className="relative">
          {/* Previous Button */}
          <button
            onClick={() => handleSlideChange('prev')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            disabled={currentSlide === 0}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Slider */}
          <div
            ref={sliderRef}
            className="w-full overflow-x-auto scrollbar-hide py-8 scroll-smooth"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-6 px-16"
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
                    flex-shrink-0 w-40 rounded-2xl cursor-pointer
                    flex flex-col items-center pb-4
                    transition-all duration-200
                    ${selectedGenres.includes(genre.id) 
                      ? 'ring-4 ring-red-400 bg-[#D4D4D4] opacity-60' 
                      : 'bg-[#D4D4D4] hover:bg-[#C8C8C8]'
                    }
                  `}
                >
                  {/* Album Art Stack */}
                  <div className="relative w-full h-32 mb-3 p-2">
                    {genre.albums.slice(0, 3).map((album, albumIndex) => (
                      <div
                        key={albumIndex}
                        className="absolute rounded-lg overflow-hidden shadow-md"
                        style={{
                          width: '70px',
                          height: '70px',
                          left: `${20 + albumIndex * 15}px`,
                          top: `${10 + albumIndex * 8}px`,
                          zIndex: 3 - albumIndex,
                          transform: `rotate(${(albumIndex - 1) * 5}deg)`,
                        }}
                      >
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${genre.id}${albumIndex}/70/70`;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <span className="text-black font-semibold text-lg">
                    {genre.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => handleSlideChange('next')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            disabled={currentSlide >= filteredGenres.length - 1}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slider Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {filteredGenres.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-red-400' : 'bg-gray-400'
              }`}
            />
          ))}
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
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            skip
          </button>
          
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
