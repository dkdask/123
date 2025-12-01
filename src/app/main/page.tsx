'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AlbumSlider } from '@/components/AlbumSlider';
import { ContextButtons, Context } from '@/components/ContextButtons';
import { PlaylistDisplay } from '@/components/PlaylistDisplay';
import { GENRE_CATEGORIES } from '@/lib/spotify';

interface Album {
  id: string;
  name: string;
  imageUrl: string;
  artist?: string;
}

interface Track {
  id: string;
  name: string;
  artist: string;
  albumImage: string;
  duration?: string;
}

interface EEGScores {
  engagement: number;
  arousal: number;
  valence: number;
  overallPreference: number;
}

// Demo albums for display
const generateDemoAlbums = (count: number): Album[] => {
  const albums: Album[] = [];
  const albumNames = [
    'After Hours', 'Future Nostalgia', 'Folklore', 'Chromatica', 
    'Fine Line', 'Positions', 'Justice', 'Sour', 'Planet Her',
    'Montero', 'Happier Than Ever', 'Solar Power'
  ];
  const artists = [
    'The Weeknd', 'Dua Lipa', 'Taylor Swift', 'Lady Gaga',
    'Harry Styles', 'Ariana Grande', 'Justin Bieber', 'Olivia Rodrigo', 'Doja Cat',
    'Lil Nas X', 'Billie Eilish', 'Lorde'
  ];
  
  for (let i = 0; i < count; i++) {
    albums.push({
      id: `album-${i}`,
      name: albumNames[i % albumNames.length],
      imageUrl: `https://picsum.photos/seed/album${i}/300/300`,
      artist: artists[i % artists.length],
    });
  }
  
  return albums;
};

// Generate demo playlist based on context
const generatePlaylistForContext = (context: Context, count: number = 10): Track[] => {
  const contextTracks: { [key in Context]: { name: string; artist: string }[] } = {
    study: [
      { name: 'Lo-Fi Dreams', artist: 'Chillhop' },
      { name: 'Focus Flow', artist: 'Deep Focus' },
      { name: 'Study Session', artist: 'Ambient Minds' },
      { name: 'Brain Waves', artist: 'Concentration' },
      { name: 'Calm Thoughts', artist: 'Study Music' },
    ],
    workout: [
      { name: 'Power Up', artist: 'Workout Hits' },
      { name: 'Beast Mode', artist: 'Gym Motivation' },
      { name: 'Run This Town', artist: 'Cardio Kings' },
      { name: 'Stronger', artist: 'Fitness Beats' },
      { name: 'Push It', artist: 'Training Mix' },
    ],
    rest: [
      { name: 'Peaceful Mind', artist: 'Relaxation' },
      { name: 'Soft Breeze', artist: 'Nature Sounds' },
      { name: 'Gentle Waves', artist: 'Ocean Calm' },
      { name: 'Cloud Nine', artist: 'Ambient' },
      { name: 'Serenity', artist: 'Chill Vibes' },
    ],
    presleep: [
      { name: 'Dreamscape', artist: 'Sleep Music' },
      { name: 'Night Sky', artist: 'Ambient Dreams' },
      { name: 'Lullaby', artist: 'Sleepy Tunes' },
      { name: 'Midnight Peace', artist: 'Deep Sleep' },
      { name: 'Stars Above', artist: 'Night Sounds' },
    ],
    commute: [
      { name: 'Road Trip', artist: 'Driving Mix' },
      { name: 'Morning Drive', artist: 'Commute Playlist' },
      { name: 'Journey', artist: 'Travel Tunes' },
      { name: 'On The Way', artist: 'Daily Drive' },
      { name: 'Highway Songs', artist: 'Road Mix' },
    ],
    stressRelief: [
      { name: 'Breathe', artist: 'Meditation' },
      { name: 'Inner Peace', artist: 'Mindfulness' },
      { name: 'Zen Garden', artist: 'Relaxation' },
      { name: 'Calm Down', artist: 'Stress Relief' },
      { name: 'Reset', artist: 'Peace of Mind' },
    ],
    feelingGood: [
      { name: 'Happy Vibes', artist: 'Feel Good Inc' },
      { name: 'Sunshine', artist: 'Good Mood' },
      { name: 'Dancing Queen', artist: 'Party Playlist' },
      { name: 'Joy', artist: 'Happiness' },
      { name: 'Best Day Ever', artist: 'Positive Energy' },
    ],
  };

  const baseTracks = contextTracks[context] || contextTracks.feelingGood;
  const tracks: Track[] = [];

  for (let i = 0; i < count; i++) {
    const baseTrack = baseTracks[i % baseTracks.length];
    tracks.push({
      id: `${context}-track-${i}`,
      name: baseTrack.name,
      artist: baseTrack.artist,
      albumImage: `https://picsum.photos/seed/${context}${i}/300/300`,
      duration: `${Math.floor(Math.random() * 2) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    });
  }

  return tracks;
};

export default function MainPage() {
  const router = useRouter();
  const [selectedContext, setSelectedContext] = useState<Context | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false);
  const [likedGenres, setLikedGenres] = useState<string[]>([]);
  const [eegScores, setEegScores] = useState<EEGScores | null>(null);
  
  const albums = generateDemoAlbums(12);

  useEffect(() => {
    // Load data from localStorage
    const storedLikedGenres = localStorage.getItem('likedGenres');
    if (storedLikedGenres) {
      setLikedGenres(JSON.parse(storedLikedGenres));
    }

    const storedResults = localStorage.getItem('eegResults');
    if (storedResults) {
      const results = JSON.parse(storedResults);
      // Calculate average scores
      const values = Object.values(results) as EEGScores[];
      if (values.length > 0) {
        const avgScores: EEGScores = {
          engagement: values.reduce((sum, v) => sum + v.engagement, 0) / values.length,
          arousal: values.reduce((sum, v) => sum + v.arousal, 0) / values.length,
          valence: values.reduce((sum, v) => sum + v.valence, 0) / values.length,
          overallPreference: values.reduce((sum, v) => sum + v.overallPreference, 0) / values.length,
        };
        setEegScores(avgScores);
      }
    }
  }, []);

  const handleContextSelect = async (context: Context) => {
    setSelectedContext(context);
    setIsLoadingPlaylist(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate playlist for context
    const newPlaylist = generatePlaylistForContext(context);
    setPlaylist(newPlaylist);
    setIsLoadingPlaylist(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Sidebar */}
      <Sidebar
        moodState={eegScores ? (eegScores.valence > 0.6 ? 'Positive & Engaged' : 'Calm & Focused') : 'No data yet'}
        emotionalProfile={eegScores ? 'Based on your EEG analysis' : 'Connect EEG device to begin'}
        recentScores={eegScores || undefined}
        hrvData={eegScores ? { sdnn: 45.3, rmssd: 38.7, lfHf: 1.2 } : undefined}
      />

      {/* Main Content */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                NeuroTune
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {likedGenres.length > 0 
                ? `Personalized for your taste in ${likedGenres.slice(0, 3).map(g => GENRE_CATEGORIES.find(c => c.id === g)?.name).join(', ')}`
                : 'Music that understands your mind'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/onboarding/likes')}
              className="px-4 py-2 bg-gray-800/50 rounded-xl text-gray-300 text-sm hover:bg-gray-700/50 border border-gray-700/50"
            >
              Edit Preferences
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/onboarding/connect')}
              className="px-4 py-2 bg-purple-600 rounded-xl text-white text-sm hover:bg-purple-700"
            >
              Connect EEG
            </motion.button>
          </div>
        </header>

        {/* Album Slider Section */}
        <section className="py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AlbumSlider
              albums={albums}
              title="Recommended for You"
              autoScroll={true}
              scrollSpeed={50}
            />
          </motion.div>
        </section>

        {/* Context Selection */}
        <section className="px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              What are you doing?
            </h2>
            <ContextButtons
              selectedContext={selectedContext}
              onSelectContext={handleContextSelect}
            />
          </motion.div>
        </section>

        {/* Playlist Display */}
        <section className="px-6 py-8 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PlaylistDisplay
              tracks={playlist}
              title={selectedContext ? `${selectedContext.charAt(0).toUpperCase() + selectedContext.slice(1)} Playlist` : 'Your Playlist'}
              context={selectedContext || undefined}
              isLoading={isLoadingPlaylist}
              onTrackClick={(track) => console.log('Playing:', track)}
            />
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-500 text-sm">
          <p>NeuroTune - Music that understands your mind</p>
          <p className="mt-1">© 2024 NeuroTune. Powered by EEG analysis.</p>
        </footer>
      </div>
    </div>
  );
}
