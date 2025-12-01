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

// Genre categories with single album cover each
const GENRES = [
  { id: 'k-pop', name: 'K-POP', albumImage: 'https://i.scdn.co/image/ab67616d0000b273f82ff6d7e7cd4e0829a10dd4' },
  { id: 'indie', name: 'Indie', albumImage: 'https://i.scdn.co/image/ab67616d0000b273ca3e0ba18e0c3b20a3d47f07' },
  { id: 'pop', name: 'POP', albumImage: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
  { id: 'classic', name: 'Classic', albumImage: 'https://i.scdn.co/image/ab67616d0000b273e0e0f05d0f05d0f05d0f05d0' },
  { id: 'edm', name: 'EDM', albumImage: 'https://i.scdn.co/image/ab67616d0000b2732b9b9b9b9b9b9b9b9b9b9b9b' },
  { id: 'jazz', name: 'Jazz', albumImage: 'https://i.scdn.co/image/ab67616d0000b273cd9e8e9e9e9e9e9e9e9e9e9e' },
  { id: 'hip-hop', name: 'Hip Hop', albumImage: 'https://i.scdn.co/image/ab67616d0000b2732f2f2f2f2f2f2f2f2f2f2f2f' },
  { id: 'r&b', name: 'R&B', albumImage: 'https://i.scdn.co/image/ab67616d0000b2735f5f5f5f5f5f5f5f5f5f5f5f' },
  { id: 'rock', name: 'Rock', albumImage: 'https://i.scdn.co/image/ab67616d0000b2738f8f8f8f8f8f8f8f8f8f8f8f' },
  { id: 'ballad', name: 'Ballad', albumImage: 'https://i.scdn.co/image/ab67616d0000b273bfbfbfbfbfbfbfbfbfbfbfbf' },
];

// Genre mapping from Spotify genre strings to our genre IDs
const mapSpotifyGenreToId = (spotifyGenre: string): string | null => {
  const genre = spotifyGenre.toLowerCase();
  
  if (genre.includes('k-pop') || genre.includes('korean pop') || genre.includes('kpop')) return 'k-pop';
  if (genre.includes('indie') || genre.includes('alternative')) return 'indie';
  if (genre.includes('classical') || genre.includes('orchestra') || genre.includes('symphony')) return 'classic';
  if (genre.includes('edm') || genre.includes('electronic') || genre.includes('house') || genre.includes('techno') || genre.includes('dance')) return 'edm';
  if (genre.includes('jazz') || genre.includes('blues')) return 'jazz';
  if (genre.includes('hip hop') || genre.includes('hip-hop') || genre.includes('rap') || genre.includes('trap')) return 'hip-hop';
  if (genre.includes('r&b') || genre.includes('rnb') || genre.includes('soul') || genre.includes('neo soul')) return 'r&b';
  if (genre.includes('rock') || genre.includes('metal') || genre.includes('punk') || genre.includes('grunge')) return 'rock';
  if (genre.includes('ballad') || genre.includes('acoustic') || genre.includes('singer-songwriter')) return 'ballad';
  if (genre.includes('pop') || genre.includes('mainstream')) return 'pop';
  
  return null;
};

// Extended interface for Spotify track with artist genres
interface SpotifyTrackWithGenres extends SpotifyTrack {
  artistGenres?: string[];
}

// Genre detection using Spotify's actual artist genres
const detectGenreFromTrack = (track: SpotifyTrackWithGenres): string[] => {
  const genres: string[] = [];
  
  // If we have artist genres from Spotify API, use those
  if (track.artistGenres && track.artistGenres.length > 0) {
    for (const spotifyGenre of track.artistGenres) {
      const mappedGenre = mapSpotifyGenreToId(spotifyGenre);
      if (mappedGenre && !genres.includes(mappedGenre)) {
        genres.push(mappedGenre);
      }
    }
  }
  
  // Fallback to keyword-based detection if no genres found
  if (genres.length === 0) {
    const artist = track.artists.map(a => a.name.toLowerCase()).join(' ');
    const name = track.name.toLowerCase();
    
    // K-pop artists
    if (artist.includes('bts') || artist.includes('blackpink') || artist.includes('aespa') || 
        artist.includes('twice') || artist.includes('exo') || artist.includes('nct') ||
        artist.includes('stray kids') || artist.includes('itzy') || artist.includes('ive') ||
        artist.includes('newjeans') || artist.includes('seventeen') || artist.includes('txt') ||
        artist.includes('enhypen') || artist.includes('le sserafim') || artist.includes('red velvet')) {
      genres.push('k-pop');
    }
    // Indie artists
    if (artist.includes('arctic monkeys') || artist.includes('bon iver') || artist.includes('tame impala') ||
        artist.includes('radiohead') || artist.includes('the strokes') || artist.includes('vampire weekend')) {
      genres.push('indie');
    }
    // Classical
    if (artist.includes('beethoven') || artist.includes('mozart') || artist.includes('bach') || 
        artist.includes('vivaldi') || artist.includes('chopin') || artist.includes('tchaikovsky')) {
      genres.push('classic');
    }
    // EDM
    if (artist.includes('avicii') || artist.includes('deadmau5') || artist.includes('martin garrix') || 
        artist.includes('zedd') || artist.includes('calvin harris') || artist.includes('marshmello') ||
        artist.includes('david guetta') || artist.includes('tiesto')) {
      genres.push('edm');
    }
    // Jazz
    if (artist.includes('miles davis') || artist.includes('john coltrane') || artist.includes('dave brubeck') ||
        artist.includes('louis armstrong') || artist.includes('ella fitzgerald')) {
      genres.push('jazz');
    }
    // Hip-hop/Rap
    if (artist.includes('kendrick') || artist.includes('drake') || artist.includes('travis scott') || 
        artist.includes('kanye') || artist.includes('j. cole') || artist.includes('tyler') ||
        artist.includes('lil') || artist.includes('21 savage') || artist.includes('post malone')) {
      genres.push('hip-hop');
    }
    // R&B
    if (artist.includes('sza') || artist.includes('daniel caesar') || artist.includes('frank ocean') || 
        artist.includes('the weeknd') || artist.includes('h.e.r.') || artist.includes('bryson tiller') ||
        artist.includes('khalid') || artist.includes('summer walker')) {
      genres.push('r&b');
    }
    // Rock
    if (artist.includes('queen') || artist.includes('led zeppelin') || artist.includes('ac/dc') || 
        artist.includes('guns n') || artist.includes('nirvana') || artist.includes('foo fighters') ||
        artist.includes('green day') || artist.includes('metallica')) {
      genres.push('rock');
    }
    // Ballad
    if (artist.includes('adele') || artist.includes('ed sheeran') || artist.includes('john legend') || 
        artist.includes('sam smith') || artist.includes('lewis capaldi') || name.includes('ballad')) {
      genres.push('ballad');
    }
    // Pop (broad)
    if (artist.includes('taylor swift') || artist.includes('dua lipa') || artist.includes('ariana grande') || 
        artist.includes('justin bieber') || artist.includes('billie eilish') || artist.includes('harry styles') ||
        artist.includes('olivia rodrigo') || artist.includes('doja cat') || artist.includes('bruno mars')) {
      genres.push('pop');
    }
  }
  
  // Default to checking artist name patterns if still no genres
  if (genres.length === 0) {
    // Check if artist name looks Korean (for K-pop detection)
    const artistNames = track.artists.map(a => a.name);
    const hasKoreanPattern = artistNames.some(name => 
      /[\uAC00-\uD7AF]/.test(name) || // Korean characters
      name.includes('(') && name.includes(')') // Often K-pop groups have romanized + Korean
    );
    if (hasKoreanPattern) {
      genres.push('k-pop');
    }
  }
  
  // Final fallback
  if (genres.length === 0) {
    const albumName = track.album?.name?.toLowerCase() || '';
    if (albumName.includes('classical') || albumName.includes('symphony')) genres.push('classic');
    else if (albumName.includes('jazz')) genres.push('jazz');
    else if (albumName.includes('rock')) genres.push('rock');
    else if (albumName.includes('hip') || albumName.includes('rap')) genres.push('hip-hop');
    else if (albumName.includes('electronic') || albumName.includes('dance')) genres.push('edm');
    else genres.push('pop');
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
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredGenres = GENRES.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Spotify API search with actual artist genres
  const searchSpotifyWithGenres = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // Use the new API that fetches artist genres
      const response = await fetch(`/api/spotify?action=searchWithGenres&query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        const tracks = data.tracks || [];
        
        const results: SearchResult[] = tracks.slice(0, 5).map((track: SpotifyTrackWithGenres) => ({
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
      searchSpotifyWithGenres(searchQuery);
    }, 300);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery, searchSpotifyWithGenres]);

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

      {/* Genre Cards with Album Covers - Horizontal Scroll with Scrollbar */}
      <div className="flex-1 flex flex-col justify-center z-10 px-8">
        {/* Slider with visible scrollbar */}
        <div
          ref={sliderRef}
          className="w-full overflow-x-auto py-8 scroll-smooth custom-scrollbar"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#F87171 #D4D4D4',
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-6 px-4"
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
                  flex-shrink-0 w-40 h-48 rounded-2xl cursor-pointer
                  flex flex-col items-center justify-end pb-4
                  transition-all duration-200
                  ${selectedGenres.includes(genre.id) 
                    ? 'ring-4 ring-red-400 bg-[#D4D4D4] opacity-60' 
                    : 'bg-[#D4D4D4] hover:bg-[#C8C8C8]'
                  }
                `}
              >
                {/* Single Album Cover */}
                <div className="w-28 h-28 rounded-lg overflow-hidden shadow-md mb-3">
                  <img
                    src={genre.albumImage}
                    alt={genre.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${genre.id}/112/112`;
                    }}
                  />
                </div>
                <span className="text-black font-semibold text-lg">
                  {genre.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #D4D4D4;
            border-radius: 4px;
            margin: 0 20px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #F87171;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #EF4444;
          }
        `}</style>
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
