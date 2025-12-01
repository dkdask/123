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
    <div className="min-h-screen bg-[#E8E8E8] relative overflow-hidden">
      {/* Decorative yellow-green blob shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -left-32 top-0 h-full w-[500px]" viewBox="0 0 400 800" fill="none">
          <path
            d="M-100 0 C 200 200, 300 400, 150 600 C 0 800, -100 800, -100 800 L -100 0"
            fill="#E8F5A3"
            opacity="0.7"
          />
        </svg>
        <svg className="absolute right-0 top-1/4 w-[400px] h-[500px]" viewBox="0 0 400 500" fill="none">
          <path
            d="M200 0 C 400 100, 450 250, 300 400 C 150 550, 400 500, 400 500 L 400 0 L 200 0"
            fill="#E8F5A3"
            opacity="0.5"
          />
        </svg>
        <div className="absolute top-32 right-1/4 w-40 h-40 rounded-full bg-[#E8F5A3] opacity-50" />
        <div className="absolute bottom-40 left-20 w-24 h-24 rounded-full bg-[#E8F5A3] opacity-60" />
      </div>

      {/* Sidebar */}
      <Sidebar
        moodState={eegScores ? (eegScores.valence > 0.6 ? '긍정적 & 몰입' : '평온 & 집중') : '데이터 없음'}
        emotionalProfile={eegScores ? 'EEG 분석 기반' : 'EEG 기기를 연결하세요'}
        recentScores={eegScores || undefined}
        hrvData={eegScores ? { sdnn: 45.3, rmssd: 38.7, lfHf: 1.2 } : undefined}
      />

      {/* Main Content */}
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Welcome to{' '}
              <span className="text-[#8B9A2B]">
                NeuroTune
              </span>
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {likedGenres.length > 0 
                ? `${likedGenres.slice(0, 3).map(g => GENRE_CATEGORIES.find(c => c.id === g)?.name).join(', ')} 취향에 맞춤`
                : '마음을 이해하는 음악'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/onboarding/likes')}
              className="px-4 py-2 bg-white/80 rounded-xl text-gray-700 text-sm hover:bg-white border border-gray-300"
            >
              취향 수정
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/onboarding/connect')}
              className="px-4 py-2 bg-[#C5D93D] rounded-xl text-black text-sm hover:bg-[#B0C530] font-medium"
            >
              EEG 연결
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
              title="맞춤 추천"
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
            <h2 className="text-xl font-bold text-black mb-6 text-center">
              지금 뭐하고 있어요?
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
              title={selectedContext ? `${selectedContext.charAt(0).toUpperCase() + selectedContext.slice(1)} 플레이리스트` : '내 플레이리스트'}
              context={selectedContext || undefined}
              isLoading={isLoadingPlaylist}
              onTrackClick={(track) => console.log('Playing:', track)}
            />
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-600 text-sm">
          <p>NeuroTune - 마음을 이해하는 음악</p>
          <p className="mt-1">© 2024 NeuroTune. EEG 분석 기반.</p>
        </footer>
      </div>
    </div>
  );
}
