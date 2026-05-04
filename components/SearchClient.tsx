'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import { FiSearch, FiFilter } from 'react-icons/fi';

const GENRES = ['All', 'Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Sci-Fi', 'Romance', 'Animation', 'Documentary'];

interface Movie {
  _id: string; title: string; poster: string; year?: string;
  imdbRating?: string; genre?: string[]; slug: string; views?: number;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || 'All');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMovies = useCallback(async (q: string, g: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '24' });
      if (q) params.set('search', q);
      if (g && g !== 'All') params.set('genre', g);
      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();
      if (p === 1) setMovies(data.movies || []);
      else setMovies(prev => [...prev, ...(data.movies || [])]);
      setTotalPages(data.pages || 1);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchMovies(query, genre, 1); setPage(1); }, [genre]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchMovies(query, genre, 1); setPage(1); };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(query, genre, next);
  };

  return (
    <div className="min-h-screen pt-20 pb-16 max-w-7xl mx-auto px-4 md:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black mb-6">Browse Movies</h1>
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-nova-muted" size={18} />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search movies, actors, directors..."
              className="w-full bg-nova-card border border-nova-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-nova-accent/60 transition-colors"
            />
          </div>
          <button type="submit"
            className="px-5 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-semibold rounded-xl transition-colors text-sm">
            Search
          </button>
        </form>
        {/* Genre filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all font-medium ${
                genre === g ? 'bg-nova-accent text-white' : 'glass border border-nova-border text-nova-muted hover:border-nova-accent/40 hover:text-white'
              }`}>
              {g}
            </button>
          ))}
        </div>
        {/* Results */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-nova-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {movies.map((m, i) => <MovieCard key={m._id} movie={m} index={i % 8} />)}
            </div>
            {page < totalPages && (
              <div className="mt-8 flex justify-center">
                <button onClick={loadMore} disabled={loading}
                  className="px-6 py-3 glass border border-nova-border hover:border-nova-accent/50 rounded-xl text-sm font-medium transition-all disabled:opacity-50">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-nova-muted">No movies found.</div>
        )}
      </motion.div>
    </div>
  );
}
