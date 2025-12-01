import { NextRequest, NextResponse } from 'next/server';
import {
  searchSpotify,
  getCategories,
  getRecommendations,
  getAvailableGenreSeeds,
  getTracksByGenre,
  getRandomTracksFromGenre,
  getNewReleases,
  GENRE_CATEGORIES,
} from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'search': {
        const query = searchParams.get('query');
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }
        const results = await searchSpotify(query);
        return NextResponse.json(results);
      }
      
      case 'categories': {
        const categories = await getCategories();
        return NextResponse.json({ categories });
      }
      
      case 'genres': {
        const genres = await getAvailableGenreSeeds();
        return NextResponse.json({ genres, genreCategories: GENRE_CATEGORIES });
      }
      
      case 'recommendations': {
        const seedGenres = searchParams.get('genres')?.split(',') || [];
        if (seedGenres.length === 0) {
          return NextResponse.json({ error: 'At least one genre is required' }, { status: 400 });
        }
        const tracks = await getRecommendations(seedGenres);
        return NextResponse.json({ tracks });
      }
      
      case 'tracksByGenre': {
        const genre = searchParams.get('genre');
        if (!genre) {
          return NextResponse.json({ error: 'Genre is required' }, { status: 400 });
        }
        const tracks = await getTracksByGenre(genre);
        return NextResponse.json({ tracks });
      }
      
      case 'randomTracks': {
        const genre = searchParams.get('genre');
        const count = parseInt(searchParams.get('count') || '3');
        if (!genre) {
          return NextResponse.json({ error: 'Genre is required' }, { status: 400 });
        }
        const tracks = await getRandomTracksFromGenre(genre, count);
        return NextResponse.json({ tracks });
      }
      
      case 'newReleases': {
        const albums = await getNewReleases();
        return NextResponse.json({ albums });
      }
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action',
          availableActions: ['search', 'categories', 'genres', 'recommendations', 'tracksByGenre', 'randomTracks', 'newReleases']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Spotify API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Spotify API', message: (error as Error).message },
      { status: 500 }
    );
  }
}
