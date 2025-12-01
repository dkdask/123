# NeuroTune 🎵🧠

**Music that understands your mind**

NeuroTune is a personalized music recommendation platform that combines:
- User-selected preferred & disliked genres
- Real-time EEG-based emotion/cognitive state analysis
- Audio metadata from Spotify API
- User context (study, workout, commute, rest, stress relief, etc.)

## Features

- 🎨 **Modern UI**: Beautiful, responsive interface with Framer Motion animations
- 🧠 **EEG Analysis**: Advanced brain-wave analysis for music preferences
- 🎵 **Spotify Integration**: Access to millions of tracks and personalized recommendations
- 📊 **Mood Tracking**: Real-time emotional state visualization
- 🎯 **Context-Aware**: Playlists tailored for study, workout, rest, and more

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Music API**: Spotify Web API
- **EEG Analysis**: Custom JavaScript analysis module

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Spotify Developer Account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/neurotune.git
cd neurotune
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/neurotune"
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

## Project Structure

```
/src
  /app
    /page.tsx              # Landing page (swipe gesture)
    /onboarding
      /likes/page.tsx      # Genre likes selection
      /dislikes/page.tsx   # Genre dislikes selection
      /connect/page.tsx    # EEG device connection
      /evaluate/page.tsx   # EEG evaluation flow
    /main/page.tsx         # Main dashboard
    /api
      /spotify/route.ts    # Spotify API endpoints
      /eeg/analyze/route.ts # EEG analysis endpoint
      /playlists/route.ts  # Playlist management
      /user/route.ts       # User management
  /components
    /ui/                   # Reusable UI components
    /AlbumSlider.tsx       # Infinite album slider
    /EEGUploader.tsx       # EEG file upload component
    /Sidebar.tsx           # Analysis sidebar
    /ContextButtons.tsx    # Context selection
    /PlaylistDisplay.tsx   # Playlist display
  /lib
    /spotify.ts            # Spotify API client
    /eeg-analysis.ts       # EEG processing algorithms
    /db.ts                 # Database client
/prisma
  /schema.prisma           # Database schema
```

## EEG Analysis Algorithms

The platform implements several EEG analysis techniques:

1. **Alpha/Beta ERD-ERS**: Event-Related Desynchronization/Synchronization
2. **Theta + HRV Joint Analysis**: Combined emotional immersion and stress detection
3. **P300 Detection**: Attention and interest measurement

## License

MIT License

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## Acknowledgments

- Spotify for the Web API
- The neuroscience community for EEG analysis methodologies
