export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{ Source: string; Value: string }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Response: string;
}

export async function fetchOmdbByTitle(title: string): Promise<OmdbMovie | null> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}&plot=full`);
    const data = await res.json();
    if (data.Response === 'True') return data as OmdbMovie;
    return null;
  } catch { return null; }
}

export async function fetchOmdbById(imdbId: string): Promise<OmdbMovie | null> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}&plot=full`);
    const data = await res.json();
    if (data.Response === 'True') return data as OmdbMovie;
    return null;
  } catch { return null; }
}

export async function searchOmdb(query: string): Promise<any[]> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}&type=movie`);
    const data = await res.json();
    if (data.Response === 'True') return data.Search || [];
    return [];
  } catch { return []; }
}
