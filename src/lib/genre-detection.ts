// Shared genre detection utilities for the NeuroTune application

// Expanded list of known artists per genre for better offline detection
export const KNOWN_ARTISTS: { [key: string]: string[] } = {
  'k-pop': [
    'bts', 'blackpink', 'aespa', 'twice', 'exo', 'nct', 'stray kids', 'itzy', 'ive',
    'newjeans', 'seventeen', 'txt', 'enhypen', 'le sserafim', 'red velvet', 'got7',
    'monsta x', 'ateez', 'treasure', 'gidle', 'mamamoo', 'apink', 'shinee', 'bigbang',
    '2ne1', 'super junior', 'girls generation', 'snsd', 'psy', 'jay park', 'zico',
    'dean', 'crush', 'iu', '아이유', 'taeyeon', 'baekhyun', 'kai', 'lisa', 'jimin',
    'jungkook', 'suga', 'rm', 'jin', 'jhope', 'rosé', 'jennie', 'jisoo'
  ],
  'indie': [
    'arctic monkeys', 'bon iver', 'tame impala', 'radiohead', 'the strokes', 'vampire weekend',
    'mac demarco', 'beach house', 'phoebe bridgers', 'fleet foxes', 'sufjan stevens',
    'the national', 'mgmt', 'phoenix', 'foster the people', 'passion pit', 'glass animals',
    'alt-j', 'local natives', 'grizzly bear', 'modest mouse', 'neutral milk hotel',
    'arcade fire', 'lcd soundsystem', 'franz ferdinand', 'the kooks', 'kings of leon'
  ],
  'classic': [
    'beethoven', 'mozart', 'bach', 'vivaldi', 'chopin', 'tchaikovsky', 'brahms', 'debussy',
    'liszt', 'schubert', 'handel', 'haydn', 'dvorak', 'rachmaninoff', 'strauss', 'wagner',
    'mendelssohn', 'verdi', 'puccini', 'mahler', 'prokofiev', 'stravinsky', 'grieg',
    'sibelius', 'berlioz', 'ravel', 'satie', 'shostakovich', 'yo-yo ma', 'lang lang'
  ],
  'edm': [
    'avicii', 'deadmau5', 'martin garrix', 'zedd', 'calvin harris', 'marshmello',
    'david guetta', 'tiesto', 'skrillex', 'diplo', 'kygo', 'alan walker', 'illenium',
    'odesza', 'flume', 'porter robinson', 'madeon', 'swedish house mafia', 'steve aoki',
    'armin van buuren', 'hardwell', 'afrojack', 'galantis', 'major lazer', 'dj snake'
  ],
  'jazz': [
    'miles davis', 'john coltrane', 'dave brubeck', 'louis armstrong', 'ella fitzgerald',
    'charlie parker', 'dizzy gillespie', 'thelonious monk', 'herbie hancock', 'chick corea',
    'wayne shorter', 'pat metheny', 'bill evans', 'art blakey', 'duke ellington',
    'count basie', 'oscar peterson', 'chet baker', 'stan getz', 'billie holiday',
    'nina simone', 'sarah vaughan', 'nat king cole', 'diana krall', 'norah jones'
  ],
  'hip-hop': [
    'kendrick lamar', 'drake', 'travis scott', 'kanye west', 'j. cole', 'tyler the creator',
    'lil nas x', 'lil baby', 'lil uzi vert', 'lil wayne', '21 savage', 'post malone',
    'migos', 'future', 'young thug', 'playboi carti', 'asap rocky', 'cardi b', 'megan thee stallion',
    'dababy', 'roddy ricch', 'pop smoke', 'juice wrld', 'xxxtentacion', 'eminem', 'jay-z',
    'nas', 'snoop dogg', 'dr. dre', 'ice cube', '50 cent', 'nicki minaj', 'mac miller', 'logic'
  ],
  'r&b': [
    'sza', 'daniel caesar', 'frank ocean', 'the weeknd', 'h.e.r.', 'bryson tiller',
    'khalid', 'summer walker', 'jhene aiko', 'kehlani', 'anderson .paak', 'brent faiyaz',
    'giveon', 'doja cat', 'ari lennox', 'usher', 'chris brown', 'trey songz',
    'r. kelly', 'mary j. blige', 'alicia keys', 'beyonce', 'miguel', 'omarion', 'tank'
  ],
  'rock': [
    'queen', 'led zeppelin', 'ac/dc', 'guns n roses', 'nirvana', 'foo fighters',
    'green day', 'metallica', 'u2', 'coldplay', 'linkin park', 'red hot chili peppers',
    'pearl jam', 'the rolling stones', 'the beatles', 'pink floyd', 'aerosmith',
    'bon jovi', 'van halen', 'def leppard', 'iron maiden', 'black sabbath',
    'deep purple', 'kiss', 'alice in chains', 'soundgarden', 'the who', 'rush'
  ],
  'ballad': [
    'adele', 'ed sheeran', 'john legend', 'sam smith', 'lewis capaldi',
    'james arthur', 'christina perri', 'jessie ware', 'lana del rey', 'hozier',
    'james bay', 'passenger', 'gavin james', 'kodaline', 'dean lewis'
  ],
  'pop': [
    'taylor swift', 'dua lipa', 'ariana grande', 'justin bieber', 'billie eilish',
    'harry styles', 'olivia rodrigo', 'bruno mars', 'lady gaga', 'katy perry',
    'rihanna', 'miley cyrus', 'selena gomez', 'shawn mendes', 'charlie puth',
    'the chainsmokers', 'halsey', 'lauv', 'bebe rexha', 'meghan trainor', 'camila cabello'
  ]
};

// Genre mapping from Spotify genre strings to our genre IDs
export const mapSpotifyGenreToId = (spotifyGenre: string): string | null => {
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

// Interface for Spotify track with artist genres
export interface SpotifyTrackWithGenres {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  artistGenres?: string[];
}

// Genre detection using Spotify's actual artist genres with fallback to known artists
export const detectGenreFromTrack = (track: SpotifyTrackWithGenres): string[] => {
  const genres: string[] = [];
  
  // If we have artist genres from Spotify API, use those first (priority)
  if (track.artistGenres && track.artistGenres.length > 0) {
    for (const spotifyGenre of track.artistGenres) {
      const mappedGenre = mapSpotifyGenreToId(spotifyGenre);
      if (mappedGenre && !genres.includes(mappedGenre)) {
        genres.push(mappedGenre);
      }
    }
  }
  
  // If Spotify genres were found, return them
  if (genres.length > 0) {
    return genres;
  }
  
  // Fallback to artist name matching
  const artistLower = track.artists.map(a => a.name.toLowerCase()).join(' ');
  
  // Check each genre's known artist list
  for (const [genreId, artists] of Object.entries(KNOWN_ARTISTS)) {
    for (const knownArtist of artists) {
      if (artistLower.includes(knownArtist)) {
        if (!genres.includes(genreId)) {
          genres.push(genreId);
        }
        break; // Found a match for this genre, move to next genre
      }
    }
  }
  
  // Check for Korean characters (indicates K-pop)
  if (genres.length === 0) {
    const artistNames = track.artists.map(a => a.name);
    const hasKoreanPattern = artistNames.some(name => 
      /[\uAC00-\uD7AF]/.test(name) // Korean Hangul characters
    );
    if (hasKoreanPattern) {
      genres.push('k-pop');
    }
  }
  
  // Check track/album name patterns as last resort
  if (genres.length === 0) {
    const albumName = (track.album?.name || '').toLowerCase();
    const trackName = track.name.toLowerCase();
    const combined = `${albumName} ${trackName}`;
    
    if (combined.includes('classical') || combined.includes('symphony') || combined.includes('sonata')) {
      genres.push('classic');
    } else if (combined.includes('jazz')) {
      genres.push('jazz');
    } else if (combined.includes('rock') || combined.includes('metal')) {
      genres.push('rock');
    } else if (combined.includes('hip hop') || combined.includes('hip-hop') || combined.includes('rap')) {
      genres.push('hip-hop');
    } else if (combined.includes('electronic') || combined.includes('edm') || combined.includes('dance')) {
      genres.push('edm');
    } else if (combined.includes('indie') || combined.includes('alternative')) {
      genres.push('indie');
    } else if (combined.includes('r&b') || combined.includes('rnb') || combined.includes('soul')) {
      genres.push('r&b');
    } else if (combined.includes('ballad')) {
      genres.push('ballad');
    }
  }
  
  // Final fallback - still return pop but only as absolute last resort
  if (genres.length === 0) {
    genres.push('pop');
  }
  
  return genres;
};
