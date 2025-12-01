'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { EEGUploader } from '@/components/EEGUploader';
import { GENRE_CATEGORIES } from '@/lib/spotify';

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  imageUrl: string;
  genre: string;
}

interface EEGResult {
  engagement: number;
  arousal: number;
  valence: number;
  overallPreference: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  artists: Array<{ name: string }>;
}

// Fallback demo tracks for each genre when Spotify API is unavailable
const DEMO_TRACKS: { [key: string]: { name: string; artist: string; album: string }[] } = {
  'pop': [
    { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
    { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
    { name: 'Stay', artist: 'The Kid LAROI', album: 'F*ck Love' },
    { name: 'As It Was', artist: 'Harry Styles', album: "Harry's House" },
    { name: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights' },
  ],
  'rock': [
    { name: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera' },
    { name: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV' },
    { name: "Sweet Child O' Mine", artist: "Guns N' Roses", album: 'Appetite for Destruction' },
    { name: 'Hotel California', artist: 'Eagles', album: 'Hotel California' },
    { name: 'Back in Black', artist: 'AC/DC', album: 'Back in Black' },
  ],
  'hip-hop': [
    { name: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.' },
    { name: 'Sicko Mode', artist: 'Travis Scott', album: 'Astroworld' },
    { name: "God's Plan", artist: 'Drake', album: 'Scorpion' },
    { name: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack' },
    { name: 'Alright', artist: 'Kendrick Lamar', album: 'To Pimp a Butterfly' },
  ],
  'electronic': [
    { name: 'Strobe', artist: 'Deadmau5', album: 'For Lack of a Better Name' },
    { name: 'Clarity', artist: 'Zedd', album: 'Clarity' },
    { name: 'Wake Me Up', artist: 'Avicii', album: 'True' },
    { name: 'Titanium', artist: 'David Guetta', album: 'Nothing but the Beat' },
    { name: 'Levels', artist: 'Avicii', album: 'True' },
  ],
  'jazz': [
    { name: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out' },
    { name: 'So What', artist: 'Miles Davis', album: 'Kind of Blue' },
    { name: 'A Love Supreme', artist: 'John Coltrane', album: 'A Love Supreme' },
    { name: 'Round Midnight', artist: 'Thelonious Monk', album: "Monk's Music" },
    { name: 'My Favorite Things', artist: 'John Coltrane', album: 'My Favorite Things' },
  ],
  'classical': [
    { name: 'Moonlight Sonata', artist: 'Beethoven', album: 'Piano Sonatas' },
    { name: 'The Four Seasons', artist: 'Vivaldi', album: "Il cimento dell'armonia e dell'inventione" },
    { name: 'Clair de Lune', artist: 'Debussy', album: 'Suite bergamasque' },
    { name: 'Symphony No. 5', artist: 'Beethoven', album: 'Symphonies' },
    { name: 'Canon in D', artist: 'Pachelbel', album: 'Baroque Classics' },
  ],
  'k-pop': [
    { name: 'Dynamite', artist: 'BTS', album: 'BE' },
    { name: 'How You Like That', artist: 'BLACKPINK', album: 'THE ALBUM' },
    { name: 'Next Level', artist: 'aespa', album: 'Next Level' },
    { name: 'Butter', artist: 'BTS', album: 'Butter' },
    { name: 'MONEY', artist: 'LISA', album: 'LALISA' },
  ],
  'indie': [
    { name: 'Skinny Love', artist: 'Bon Iver', album: 'For Emma, Forever Ago' },
    { name: 'Do I Wanna Know?', artist: 'Arctic Monkeys', album: 'AM' },
    { name: 'Electric Feel', artist: 'MGMT', album: 'Oracular Spectacular' },
    { name: 'Ho Hey', artist: 'The Lumineers', album: 'The Lumineers' },
    { name: 'Little Talks', artist: 'Of Monsters and Men', album: 'My Head Is an Animal' },
  ],
  'edm': [
    { name: 'Animals', artist: 'Martin Garrix', album: 'Animals' },
    { name: 'Lean On', artist: 'Major Lazer', album: 'Peace Is The Mission' },
    { name: 'Don\'t Let Me Down', artist: 'The Chainsmokers', album: 'Collage' },
    { name: 'Faded', artist: 'Alan Walker', album: 'Different World' },
    { name: 'This Is What You Came For', artist: 'Calvin Harris', album: 'This Is What You Came For' },
  ],
  'ballad': [
    { name: 'Someone Like You', artist: 'Adele', album: '21' },
    { name: 'All of Me', artist: 'John Legend', album: 'Love in the Future' },
    { name: 'Say You Won\'t Let Go', artist: 'James Arthur', album: 'Back from the Edge' },
    { name: 'Perfect', artist: 'Ed Sheeran', album: '÷ (Divide)' },
    { name: 'A Thousand Years', artist: 'Christina Perri', album: 'The Twilight Saga' },
  ],
  'r&b': [
    { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
    { name: 'Call Out My Name', artist: 'The Weeknd', album: 'My Dear Melancholy,' },
    { name: 'Best Part', artist: 'Daniel Caesar', album: 'Freudian' },
    { name: 'FYM', artist: 'SZA', album: 'Ctrl' },
    { name: 'Good Days', artist: 'SZA', album: 'Good Days' },
  ],
  'classic': [
    { name: 'Moonlight Sonata', artist: 'Beethoven', album: 'Piano Sonatas' },
    { name: 'The Four Seasons', artist: 'Vivaldi', album: "Il cimento dell'armonia e dell'inventione" },
    { name: 'Clair de Lune', artist: 'Debussy', album: 'Suite bergamasque' },
    { name: 'Symphony No. 9', artist: 'Beethoven', album: 'Symphonies' },
    { name: 'Für Elise', artist: 'Beethoven', album: 'Piano Works' },
  ],
};

const TRACKS_PER_GENRE = 3;
const MAX_TRACKS_TOTAL = 15;

// Generate a fallback demo track for a genre
const generateFallbackTrack = (genre: string, index: number, playedIds: Set<string>): Track | null => {
  // Get demo tracks for this genre, fallback to pop if genre not found
  const genreDemoTracks = DEMO_TRACKS[genre] || DEMO_TRACKS['pop'];
  
  // Filter out already played tracks
  const availableTracks = genreDemoTracks.filter((_, i) => {
    const trackId = `demo-${genre}-${i}`;
    return !playedIds.has(trackId);
  });
  
  if (availableTracks.length === 0) {
    return null;
  }
  
  // Pick a random track or use the index
  const trackIndex = index < availableTracks.length ? index : Math.floor(Math.random() * availableTracks.length);
  const originalIndex = genreDemoTracks.indexOf(availableTracks[trackIndex]);
  const track = availableTracks[trackIndex];
  
  return {
    id: `demo-${genre}-${originalIndex}`,
    name: track.name,
    artist: track.artist,
    album: track.album,
    imageUrl: `https://picsum.photos/seed/${genre}${originalIndex}/300/300`,
    genre: genre,
  };
};

export default function EvaluatePage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [results, setResults] = useState<Map<string, EEGResult>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [likedGenres, setLikedGenres] = useState<string[]>([]);
  const [useSpotify, setUseSpotify] = useState(true);
  const playedTrackIds = useRef<Set<string>>(new Set());

  const fetchRandomTrackForGenre = useCallback(async (genre: string): Promise<Track | null> => {
    // If Spotify is disabled, use fallback directly
    if (!useSpotify) {
      return generateFallbackTrack(genre, 0, playedTrackIds.current);
    }
    
    try {
      const response = await fetch(`/api/spotify?action=randomTracks&genre=${encodeURIComponent(genre)}&count=10`);
      
      if (!response.ok) {
        console.error('Failed to fetch tracks from Spotify API, using fallback');
        setUseSpotify(false);
        return generateFallbackTrack(genre, 0, playedTrackIds.current);
      }
      
      const data = await response.json();
      
      // Check if there's an error in the response
      if (data.error) {
        console.error('Spotify API error:', data.message);
        setUseSpotify(false);
        return generateFallbackTrack(genre, 0, playedTrackIds.current);
      }
      
      const spotifyTracks: SpotifyTrack[] = data.tracks || [];
      
      // If no tracks returned, use fallback
      if (spotifyTracks.length === 0) {
        return generateFallbackTrack(genre, 0, playedTrackIds.current);
      }
      
      // Filter out already played tracks
      const availableTracks = spotifyTracks.filter(
        (t: SpotifyTrack) => !playedTrackIds.current.has(t.id)
      );
      
      if (availableTracks.length === 0) {
        return generateFallbackTrack(genre, 0, playedTrackIds.current);
      }
      
      // Pick a random track from available tracks
      const randomTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
      
      return {
        id: randomTrack.id,
        name: randomTrack.name,
        artist: randomTrack.artists.map((a: { name: string }) => a.name).join(', '),
        album: randomTrack.album.name,
        imageUrl: randomTrack.album.images[0]?.url || '/placeholder-album.svg',
        genre: genre, // Use the original genre ID, not the Spotify seed
      };
    } catch (error) {
      console.error('Error fetching track for genre:', genre, error);
      setUseSpotify(false);
      return generateFallbackTrack(genre, 0, playedTrackIds.current);
    }
  }, [useSpotify]);

  const loadInitialTracks = useCallback(async (genres: string[]) => {
    const initialTracks: Track[] = [];
    
    for (const genre of genres) {
      for (let i = 0; i < TRACKS_PER_GENRE; i++) {
        if (initialTracks.length >= MAX_TRACKS_TOTAL) break;
        
        const track = await fetchRandomTrackForGenre(genre);
        if (track) {
          playedTrackIds.current.add(track.id);
          initialTracks.push(track);
        }
      }
    }
    
    // If no tracks were loaded (API failed), use fallback for all genres
    if (initialTracks.length === 0) {
      for (const genre of genres) {
        for (let i = 0; i < TRACKS_PER_GENRE; i++) {
          if (initialTracks.length >= MAX_TRACKS_TOTAL) break;
          
          const track = generateFallbackTrack(genre, i, playedTrackIds.current);
          if (track) {
            playedTrackIds.current.add(track.id);
            initialTracks.push(track);
          }
        }
      }
    }
    
    // Shuffle tracks for variety
    const shuffledTracks = initialTracks.sort(() => Math.random() - 0.5);
    setTracks(shuffledTracks);
  }, [fetchRandomTrackForGenre]);

  useEffect(() => {
    // Load liked genres from localStorage
    const storedLikedGenres = localStorage.getItem('likedGenres');
    const genres = storedLikedGenres 
      ? JSON.parse(storedLikedGenres) 
      : ['pop', 'rock'];
    
    const validGenres = genres.length > 0 ? genres : ['pop', 'rock'];
    setLikedGenres(validGenres);
    loadInitialTracks(validGenres);
  }, [loadInitialTracks]);

  const currentTrack = tracks[currentTrackIndex];
  const progress = tracks.length > 0 ? ((currentTrackIndex + 1) / tracks.length) * 100 : 0;

  const handleFilesUploaded = async (files: { name: string; content: string; type: string }[]) => {
    setIsProcessing(true);

    try {
      // Call the EEG analysis API
      const response = await fetch('/api/eeg/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawData: files.find(f => f.type === 'rawdata')?.content,
          fp1Fft: files.find(f => f.type === 'fp1_fft')?.content,
          fp2Fft: files.find(f => f.type === 'fp2_fft')?.content,
          biomarkers: files.find(f => f.type === 'biomarkers')?.content,
        }),
      });

      const data = await response.json();

      if (data.success && currentTrack) {
        // Store results for this track
        setResults((prev) => {
          const updated = new Map(prev);
          updated.set(currentTrack.id, {
            engagement: data.analysis.engagement,
            arousal: data.analysis.arousal,
            valence: data.analysis.valence,
            overallPreference: data.analysis.overallPreference,
          });
          return updated;
        });

        // Move to next track or finish
        if (currentTrackIndex < tracks.length - 1) {
          setCurrentTrackIndex((prev) => prev + 1);
        } else {
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('EEG analysis error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = async () => {
    // Get current track's genre or pick random from liked genres
    const currentGenre = currentTrack?.genre || likedGenres[Math.floor(Math.random() * likedGenres.length)];
    
    setIsLoadingTrack(true);
    
    try {
      // Fetch a new random track for the current genre
      const newTrack = await fetchRandomTrackForGenre(currentGenre);
      
      if (newTrack) {
        playedTrackIds.current.add(newTrack.id);
        
        // Replace current track with new one
        setTracks((prev) => {
          const updated = [...prev];
          updated[currentTrackIndex] = newTrack;
          return updated;
        });
      } else {
        // If no new track available, move to next track
        if (currentTrackIndex < tracks.length - 1) {
          setCurrentTrackIndex((prev) => prev + 1);
        } else {
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error fetching new track:', error);
      // Fallback: move to next track
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
    } finally {
      setIsLoadingTrack(false);
    }
  };

  const handleComplete = () => {
    // Store results in localStorage for the main page
    const resultsObj: { [key: string]: EEGResult } = {};
    results.forEach((value, key) => {
      resultsObj[key] = value;
    });
    localStorage.setItem('eegResults', JSON.stringify(resultsObj));
    router.push('/main');
  };

  if (tracks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p>Loading tracks...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900/30 to-gray-900 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">Evaluation Complete!</h1>
          <p className="text-gray-300 mb-2">
            We analyzed your brain response to {results.size} songs
          </p>
          <p className="text-gray-400 text-sm">
            Your personalized music experience is ready
          </p>
        </motion.div>

        <Button variant="primary" size="lg" onClick={handleComplete}>
          Go to Main Page
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 flex flex-col">
      {/* Progress Bar */}
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Track {currentTrackIndex + 1} of {tracks.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Current Track Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {currentTrack && (
            <motion.div
              key={currentTrack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center mb-8"
            >
              {/* Album Cover */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20"
              >
                <img
                  src={currentTrack.imageUrl}
                  alt={currentTrack.album}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-album.svg';
                  }}
                />
              </motion.div>

              {/* Track Info */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentTrack.name}
              </h2>
              <p className="text-gray-300 mb-1">{currentTrack.artist}</p>
              <p className="text-gray-500 text-sm">{currentTrack.album}</p>
              
              {/* Genre Badge */}
              <div className="mt-4">
                <span
                  className="px-4 py-1 rounded-full text-white text-sm font-medium"
                  style={{
                    backgroundColor: GENRE_CATEGORIES.find(g => g.id === currentTrack.genre)?.color || '#9333ea',
                  }}
                >
                  {GENRE_CATEGORIES.find(g => g.id === currentTrack.genre)?.name || currentTrack.genre}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EEG File Uploader */}
        <div className="w-full max-w-2xl">
          <EEGUploader
            onFilesUploaded={handleFilesUploaded}
            isProcessing={isProcessing}
          />
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="mt-6 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isProcessing || isLoadingTrack}
        >
          {isLoadingTrack ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
              Loading new song...
            </>
          ) : (
            'Skip this song →'
          )}
        </button>
      </div>

      {/* Back Navigation */}
      <div className="p-6">
        <button
          onClick={() => router.push('/onboarding/connect')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Connection
        </button>
      </div>
    </div>
  );
}
