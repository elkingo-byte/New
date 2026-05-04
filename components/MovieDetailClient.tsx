'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPlay, FiBookmark, FiStar, FiClock, FiGlobe, FiAward } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import StarRating from './StarRating';
import Comments from './Comments';
import toast from 'react-hot-toast';

interface Movie {
  _id: string; title: string; description: string; poster: string; backdrop: string;
  year?: string; imdbRating?: string; genre?: string[]; director?: string; cast?: string[];
  runtime?: string; language?: string; country?: string; awards?: string; slug: string; views?: number;
}

export default function MovieDetailClient({ id }: { id: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(r => r.json()).then(data => { setMovie(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (movie) {
      const list = JSON.parse(localStorage.getItem('nova_watchlist') || '[]');
      setSaved(list.some((m: any) => m._id === movie._id));
    }
  }, [movie]);

  const toggleWatchlist = () => {
    if (!movie) return;
    const list = JSON.parse(localStorage.getItem('nova_watchlist') || '[]');
    const exists = list.some((m: any) => m._id === movie._id);
    if (exists) {
      localStorage.setItem('nova_watchlist', JSON.stringify(list.filter((m: any) => m._id !== movie._id)));
      setSaved(false); toast.success('Removed from Watchlist');
    } else {
      localStorage.setItem('nova_watchlist', JSON.stringify([...list, movie]));
      setSaved(true); toast.success('Added to Watchlist');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-nova-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!movie) return <div className="min-h-screen flex items-center justify-center text-nova-muted">Movie not found.</div>;

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div className="relative h-[55vh] overflow-hidden">
        {movie.backdrop ? (
          <Image src={movie.backdrop} alt={movie.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-nova-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="flex-shrink-0 w-48 md:w-60 rounded-2xl overflow-hidden shadow-2xl self-start">
            {movie.poster && <Image src={movie.poster} alt={movie.title} width={240} height={360} className="w-full" />}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="flex-1 pt-4 md:pt-32">
            <div className="flex flex-wrap gap-2 mb-3">
              {movie.genre?.map(g => (
                <span key={g} className="text-xs px-2.5 py-1 bg-nova-accent/15 text-nova-accent border border-nova-accent/25 rounded-full">{g}</span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-nova-muted mb-4">
              {movie.year && <span>{movie.year}</span>}
              {movie.runtime && <span className="flex items-center gap-1"><FiClock size={13} />{movie.runtime}</span>}
              {movie.language && <span className="flex items-center gap-1"><FiGlobe size={13} />{movie.language}</span>}
              {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                <span className="flex items-center gap-1 text-nova-gold font-semibold"><FiStar size={13} />{movie.imdbRating} IMDb</span>
              )}
              <span className="flex items-center gap-1 text-nova-muted">{movie.views?.toLocaleString() || 0} views</span>
            </div>
            <p className="text-nova-muted text-sm md:text-base leading-relaxed max-w-2xl mb-6">{movie.description}</p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href={`/watch/${movie.slug}`}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 px-6 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-nova-accent/20">
                  <FiPlay size={18} /> Watch Now
                </motion.button>
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={toggleWatchlist}
                className={`flex items-center gap-2.5 px-5 py-3 glass border rounded-xl font-medium transition-all ${saved ? 'border-nova-accent/50 text-nova-accent' : 'border-nova-border text-nova-muted hover:border-nova-accent/30 hover:text-white'}`}>
                {saved ? <BsBookmarkFill /> : <FiBookmark size={16} />}
                {saved ? 'In Watchlist' : 'Add to Watchlist'}
              </motion.button>
            </div>

            {/* Rating */}
            <StarRating movieId={movie._id} />

            {/* Cast/Director */}
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              {movie.director && (
                <div><p className="text-nova-muted text-xs mb-1">Director</p><p className="text-white font-medium">{movie.director}</p></div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div><p className="text-nova-muted text-xs mb-1">Cast</p><p className="text-white font-medium">{movie.cast.slice(0,3).join(', ')}</p></div>
              )}
              {movie.country && (
                <div><p className="text-nova-muted text-xs mb-1">Country</p><p className="text-white">{movie.country}</p></div>
              )}
              {movie.awards && movie.awards !== 'N/A' && (
                <div className="col-span-2"><p className="text-nova-muted text-xs mb-1 flex items-center gap-1"><FiAward size={11} /> Awards</p><p className="text-nova-gold text-xs">{movie.awards}</p></div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Comments */}
        <div className="mt-12 max-w-3xl">
          <Comments movieId={movie._id} />
        </div>
      </div>
    </div>
  );
}
