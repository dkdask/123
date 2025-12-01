// Spotify API Client for NeuroTune

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: Array<{ url: string; height: number; width: number }>;
  artists: Array<{ id: string; name: string }>;
  release_date: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  album: SpotifyAlbum;
  artists: Array<{ id: string; name: string }>;
  duration_ms: number;
  preview_url: string | null;
}

interface SpotifyCategory {
  id: string;
  name: string;
  icons: Array<{ url: string; height: number; width: number }>;
}

interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
}

interface SpotifySearchResult {
  tracks?: { items: SpotifyTrack[] };
  albums?: { items: SpotifyAlbum[] };
  artists?: { items: Array<{ id: string; name: string; images: Array<{ url: string }> }> };
}

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Spotify access token using Client Credentials flow
 */
export async function getSpotifyToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(SPOTIFY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify token: ${response.statusText}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Expire 1 minute early

  return data.access_token;
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getSpotifyToken();
  
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Search for tracks, albums, or artists
 */
export async function searchSpotify(
  query: string,
  types: ('track' | 'album' | 'artist')[] = ['track', 'album'],
  limit: number = 20
): Promise<SpotifySearchResult> {
  const encodedQuery = encodeURIComponent(query);
  const typeString = types.join(',');
  return spotifyFetch<SpotifySearchResult>(
    `/search?q=${encodedQuery}&type=${typeString}&limit=${limit}`
  );
}

/**
 * Artist details interface from Spotify API
 */
interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string }>;
}

/**
 * Get artist details including genres
 */
export async function getArtist(artistId: string): Promise<SpotifyArtist> {
  return spotifyFetch<SpotifyArtist>(`/artists/${artistId}`);
}

/**
 * Get multiple artists details including genres.
 * Note: Spotify API may return null for artists that don't exist or have been removed.
 */
export async function getArtists(artistIds: string[]): Promise<{ artists: Array<SpotifyArtist | null> }> {
  const ids = artistIds.slice(0, 50).join(','); // Max 50 artists
  return spotifyFetch<{ artists: Array<SpotifyArtist | null> }>(`/artists?ids=${ids}`);
}

/**
 * Search for tracks with artist genres included
 */
export async function searchTracksWithGenres(
  query: string,
  limit: number = 10
): Promise<Array<SpotifyTrack & { artistGenres: string[] }>> {
  const searchResult = await searchSpotify(query, ['track'], limit);
  const tracks = searchResult.tracks?.items || [];
  
  if (tracks.length === 0) return [];
  
  // Collect unique artist IDs
  const artistIds = new Set<string>();
  tracks.forEach(track => {
    track.artists.forEach(artist => artistIds.add(artist.id));
  });
  
  // Fetch artist details to get genres
  const artistGenresMap: { [key: string]: string[] } = {};
  try {
    const artistsData = await getArtists(Array.from(artistIds));
    artistsData.artists.forEach(artist => {
      if (artist) {
        artistGenresMap[artist.id] = artist.genres;
      }
    });
  } catch (error) {
    console.error('Failed to fetch artist genres:', error);
  }
  
  // Combine tracks with their artist genres
  return tracks.map(track => ({
    ...track,
    artistGenres: track.artists.flatMap(artist => artistGenresMap[artist.id] || []),
  }));
}

/**
 * Get available genre categories
 */
export async function getCategories(limit: number = 50): Promise<SpotifyCategory[]> {
  const response = await spotifyFetch<{ categories: { items: SpotifyCategory[] } }>(
    `/browse/categories?limit=${limit}`
  );
  return response.categories.items;
}

/**
 * Get category playlists
 */
export async function getCategoryPlaylists(categoryId: string, limit: number = 20) {
  return spotifyFetch<{ playlists: { items: Array<{ id: string; name: string; images: Array<{ url: string }> }> } }>(
    `/browse/categories/${categoryId}/playlists?limit=${limit}`
  );
}

/**
 * Get recommendations based on seed genres
 */
export async function getRecommendations(
  seedGenres: string[],
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const genres = seedGenres.slice(0, 5).join(','); // Max 5 seed genres
  const response = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/recommendations?seed_genres=${genres}&limit=${limit}`
  );
  return response.tracks;
}

/**
 * Get available genre seeds
 */
export async function getAvailableGenreSeeds(): Promise<string[]> {
  const response = await spotifyFetch<{ genres: string[] }>(
    '/recommendations/available-genre-seeds'
  );
  return response.genres;
}

/**
 * Get audio features for a track
 */
export async function getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
  return spotifyFetch<SpotifyAudioFeatures>(`/audio-features/${trackId}`);
}

/**
 * Get audio features for multiple tracks
 */
export async function getMultipleAudioFeatures(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
  const ids = trackIds.slice(0, 100).join(','); // Max 100 tracks
  const response = await spotifyFetch<{ audio_features: SpotifyAudioFeatures[] }>(
    `/audio-features?ids=${ids}`
  );
  return response.audio_features;
}

/**
 * Get tracks for a genre by searching for genre-specific playlists
 */
export async function getTracksByGenre(
  genre: string,
  limit: number = 20
): Promise<SpotifyTrack[]> {
  const searchResult = await searchSpotify(`genre:${genre}`, ['track'], limit);
  return searchResult.tracks?.items || [];
}

/**
 * Get random tracks from a genre
 */
export async function getRandomTracksFromGenre(
  genre: string,
  count: number = 3
): Promise<SpotifyTrack[]> {
  const tracks = await getTracksByGenre(genre, 50);
  
  // Shuffle and pick random tracks
  const shuffled = tracks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get new releases
 */
export async function getNewReleases(limit: number = 20): Promise<SpotifyAlbum[]> {
  const response = await spotifyFetch<{ albums: { items: SpotifyAlbum[] } }>(
    `/browse/new-releases?limit=${limit}`
  );
  return response.albums.items;
}

/**
 * Get album cover URL
 */
export function getAlbumCoverUrl(album: SpotifyAlbum, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!album.images || album.images.length === 0) {
    return '/placeholder-album.svg';
  }
  
  const sizeIndex = size === 'large' ? 0 : size === 'medium' ? 1 : 2;
  return album.images[Math.min(sizeIndex, album.images.length - 1)]?.url || album.images[0].url;
}

// Genre categories with icons and colors for UI
// Note: Some genres have aliases (e.g., 'classic'/'classical', 'r&b'/'r-n-b') to match
// the likes page genre IDs while still supporting Spotify's genre seed format
export const GENRE_CATEGORIES = [
  { id: 'pop', name: 'Pop', color: '#FF6B6B' },
  { id: 'rock', name: 'Rock', color: '#4ECDC4' },
  { id: 'hip-hop', name: 'Hip Hop', color: '#FFE66D' },
  { id: 'electronic', name: 'Electronic', color: '#95E1D3' },
  { id: 'jazz', name: 'Jazz', color: '#F38181' },
  { id: 'classical', name: 'Classical', color: '#AA96DA' },
  { id: 'r-n-b', name: 'R&B', color: '#FCBAD3' },
  { id: 'country', name: 'Country', color: '#A8D8EA' },
  { id: 'latin', name: 'Latin', color: '#FF9A8B' },
  { id: 'indie', name: 'Indie', color: '#88D8B0' },
  { id: 'metal', name: 'Metal', color: '#616161' },
  { id: 'alternative', name: 'Alternative', color: '#B5EAD7' },
  { id: 'folk', name: 'Folk', color: '#E2F0CB' },
  { id: 'blues', name: 'Blues', color: '#6C5B7B' },
  { id: 'reggae', name: 'Reggae', color: '#45B7D1' },
  { id: 'punk', name: 'Punk', color: '#F7DC6F' },
  { id: 'soul', name: 'Soul', color: '#BB8FCE' },
  { id: 'disco', name: 'Disco', color: '#F8B500' },
  { id: 'ambient', name: 'Ambient', color: '#96CEB4' },
  { id: 'k-pop', name: 'K-Pop', color: '#FF69B4' },
  { id: 'edm', name: 'EDM', color: '#00FFFF' },
  { id: 'ballad', name: 'Ballad', color: '#DDA0DD' },
  // Aliases for likes page compatibility
  { id: 'classic', name: 'Classic', color: '#AA96DA' },
  { id: 'r&b', name: 'R&B', color: '#FCBAD3' },
];

/**
 * Map user-selected genre IDs to valid Spotify genre seeds
 * Some genre IDs used in the UI don't match Spotify's available genre seeds
 */
export const GENRE_TO_SPOTIFY_SEED: { [key: string]: string } = {
  'k-pop': 'k-pop',
  'indie': 'indie',
  'pop': 'pop',
  'classic': 'classical',
  'classical': 'classical',
  'edm': 'edm',
  'jazz': 'jazz',
  'hip-hop': 'hip-hop',
  'r&b': 'r-n-b',
  'r-n-b': 'r-n-b',
  'rock': 'rock',
  'ballad': 'pop', // Ballad is not a Spotify genre, use pop as fallback
  'electronic': 'electronic',
  'country': 'country',
  'latin': 'latin',
  'metal': 'metal',
  'alternative': 'alternative',
  'folk': 'folk',
  'blues': 'blues',
  'reggae': 'reggae',
  'punk': 'punk',
  'soul': 'soul',
  'disco': 'disco',
  'ambient': 'ambient',
};

/**
 * Get the Spotify genre seed for a given genre ID
 */
export function getSpotifyGenreSeed(genreId: string): string {
  return GENRE_TO_SPOTIFY_SEED[genreId] || genreId;
}

export type { SpotifyTrack, SpotifyAlbum, SpotifyCategory, SpotifyAudioFeatures, SpotifySearchResult };
