import { NextRequest, NextResponse } from 'next/server';
import { fetchOmdbByTitle, fetchOmdbById } from '@/lib/omdb';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 30);
  if (limited) return limited;
  try {
    const { title, imdbId } = await req.json();
    let omdb = null;
    if (imdbId) omdb = await fetchOmdbById(imdbId);
    else if (title) omdb = await fetchOmdbByTitle(title);

    if (!omdb) return NextResponse.json({ error: 'Movie not found' }, { status: 404 });

    // Fetch TMDB backdrop
    let backdrop = '';
    const tmdbKey = process.env.TMDB_API_KEY;
    if (tmdbKey && omdb.imdbID) {
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/find/${omdb.imdbID}?api_key=${tmdbKey}&external_source=imdb_id`);
        const tmdbData = await tmdbRes.json();
        const movieResult = tmdbData.movie_results?.[0];
        if (movieResult?.backdrop_path) backdrop = `https://image.tmdb.org/t/p/original${movieResult.backdrop_path}`;
      } catch {}
    }

    // Fetch Fanart.tv assets
    let fanartPoster = '';
    const fanartKey = process.env.FANART_API_KEY;
    if (fanartKey && omdb.imdbID) {
      try {
        const fanartRes = await fetch(`https://webservice.fanart.tv/v3/movies/${omdb.imdbID}?api_key=${fanartKey}`);
        const fanartData = await fanartRes.json();
        fanartPoster = fanartData.movieposter?.[0]?.url || '';
        if (!backdrop) backdrop = fanartData.moviebackground?.[0]?.url || '';
      } catch {}
    }

    return NextResponse.json({
      title: omdb.Title,
      description: omdb.Plot,
      poster: fanartPoster || omdb.Poster,
      backdrop,
      imdbId: omdb.imdbID,
      imdbRating: omdb.imdbRating,
      genre: omdb.Genre?.split(', ') || [],
      director: omdb.Director,
      cast: omdb.Actors?.split(', ') || [],
      runtime: omdb.Runtime,
      year: omdb.Year,
      language: omdb.Language,
      country: omdb.Country,
      awards: omdb.Awards,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
