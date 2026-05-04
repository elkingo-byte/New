'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import Link from 'next/link';
import { FiBookmark } from 'react-icons/fi';

interface Movie {
  _id: string; title: string; poster: string; year?: string;
  imdbRating?: string; genre?: string[]; slug: string; views?: number;
}

export default function WatchlistClient() {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<{ movie: Movie; progress: number }[]>([]);

  useEffect(() => {
    const list: Movie[] = JSON.parse(localStorage.getItem('nova_watchlist') || '[]');
    setWatchlist(list);

    // Build continue watching from localStorage progress keys
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nova_progress_'));
    const cont: { movie: Movie; progress: number }[] = [];
    for (const key of keys) {
      const movieId = key.replace('nova_progress_', '');
      const progress = parseInt(localStorage.getItem(key) || '0');
      const m = list.find(m => m._id === movieId || m.slug === movieId);
      if (m && progress > 10) cont.push({ movie: m, progress });
    }
    setContinueWatching(cont);
  }, []);

  const removeFromWatchlist = (id: string) => {
    const list = watchlist.filter(m => m._id !== id);
    setWatchlist(list);
    localStorage.setItem('nova_watchlist', JSON.stringify(list));
  };

  return (
    <div className="min-h-screen pt-20 pb-16 max-w-7xl mx-auto px-4 md:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <FiBookmark className="text-nova-accent" /> My Watchlist
        </h1>
        <p className="text-nova-muted text-sm mb-8">Saved locally on your device.</p>

        {continueWatching.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold mb-4 text-white">Continue Watching</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {continueWatching.map(({ movie, progress }, i) => (
                <div key={movie._id} className="relative">
                  <MovieCard movie={movie} index={i} />
                  <div className="mt-1 h-0.5 bg-nova-border rounded-full overflow-hidden">
                    <div className="h-full bg-nova-accent rounded-full" style={{ width: `${Math.min(progress / 7200 * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {watchlist.map((m, i) => <MovieCard key={m._id} movie={m} index={i} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
            <p className="text-nova-muted text-sm mb-6">Browse movies and add them to your watchlist.</p>
            <Link href="/search">
              <button className="px-6 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-semibold rounded-xl transition-colors">Browse Movies</button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
