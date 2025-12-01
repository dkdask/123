'use client';

import { useState, useEffect } from 'react';
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

// Demo tracks for each genre
const generateDemoTracks = (genres: string[]): Track[] => {
  const tracks: Track[] = [];
  const demoTracks: { [key: string]: { name: string; artist: string; album: string }[] } = {
    'pop': [
      { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
      { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' },
      { name: 'Stay', artist: 'The Kid LAROI', album: 'F*ck Love' },
    ],
    'rock': [
      { name: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera' },
      { name: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV' },
      { name: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction' },
    ],
    'hip-hop': [
      { name: 'HUMBLE.', artist: 'Kendrick Lamar', album: 'DAMN.' },
      { name: 'Sicko Mode', artist: 'Travis Scott', album: 'Astroworld' },
      { name: 'God\'s Plan', artist: 'Drake', album: 'Scorpion' },
    ],
    'electronic': [
      { name: 'Strobe', artist: 'Deadmau5', album: 'For Lack of a Better Name' },
      { name: 'Clarity', artist: 'Zedd', album: 'Clarity' },
      { name: 'Wake Me Up', artist: 'Avicii', album: 'True' },
    ],
    'jazz': [
      { name: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out' },
      { name: 'So What', artist: 'Miles Davis', album: 'Kind of Blue' },
      { name: 'A Love Supreme', artist: 'John Coltrane', album: 'A Love Supreme' },
    ],
    'classical': [
      { name: 'Moonlight Sonata', artist: 'Beethoven', album: 'Piano Sonatas' },
      { name: 'The Four Seasons', artist: 'Vivaldi', album: 'Il cimento dell\'armonia e dell\'inventione' },
      { name: 'Clair de Lune', artist: 'Debussy', album: 'Suite bergamasque' },
    ],
  };
  
  genres.forEach((genreId) => {
    const genreTracks = demoTracks[genreId] || demoTracks['pop'];
    genreTracks.forEach((track, index) => {
      tracks.push({
        id: `${genreId}-${index}`,
        name: track.name,
        artist: track.artist,
        album: track.album,
        imageUrl: `https://picsum.photos/seed/${genreId}${index}/300/300`,
        genre: genreId,
      });
    });
  });
  
  return tracks;
};

export default function EvaluatePage() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Map<string, EEGResult>>(new Map());
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Load liked genres from localStorage
    const storedLikedGenres = localStorage.getItem('likedGenres');
    if (storedLikedGenres) {
      const genres = JSON.parse(storedLikedGenres);
      
      // Generate demo tracks for liked genres
      const genreTracks = generateDemoTracks(genres.length > 0 ? genres : ['pop', 'rock']);
      setTracks(genreTracks);
    } else {
      // Default tracks if no preferences set
      const defaultTracks = generateDemoTracks(['pop', 'rock']);
      setTracks(defaultTracks);
    }
  }, []);

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

  const handleSkip = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
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
                    (e.target as HTMLImageElement).src = '/placeholder-album.png';
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
          className="mt-6 text-gray-400 hover:text-white transition-colors"
          disabled={isProcessing}
        >
          Skip this song →
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
