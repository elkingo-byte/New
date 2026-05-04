'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiBookmark, FiStar, FiPlay } from 'react-icons/fi';
import { BsBookmarkFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

interface Movie {
  _id: string; title: string; poster: string; year?: string;
  imdbRating?: string; genre?: string[]; slug: string; views?: number;
}

function useWatchlist() {
  const toggle = (movie: Movie) => {
    if (typeof window === 'undefined') return false;
    const list: Movie[] = JSON.parse(localStorage.getItem('nova_watchlist') || '[]');
    const exists = list.some(m => m._id === movie._id);
    if (exists) {
      localStorage.setItem('nova_watchlist', JSON.stringify(list.filter(m => m._id !== movie._id)));
      return false;
    } else {
      localStorage.setItem('nova_watchlist', JSON.stringify([...list, movie]));
      return true;
    }
  };
  const isIn = (id: string) => {
    if (typeof window === 'undefined') return false;
    const list: Movie[] = JSON.parse(localStorage.getItem('nova_watchlist') || '[]');
    return list.some(m => m._id === id);
  };
  return { toggle, isIn };
}

export default function MovieCard({ movie, index = 0 }: { movie: Movie; index?: number }) {
  const { toggle, isIn } = useWatchlist();
  const [saved, setSaved] = useState(isIn(movie._id));
  const [hovered, setHovered] = useState(false);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const added = toggle(movie);
    setSaved(added);
    toast.success(added ? `Added to Watchlist` : `Removed from Watchlist`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link href={`/movies/${movie.slug}`} className="block group movie-card">
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-nova-card border border-nova-border">
          {movie.poster ? (
            <Image
              src={movie.poster} alt={movie.title}
              fill className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 45vw, (max-width:1200px) 25vw, 18vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-nova-card text-nova-muted">
              <FiPlay size={32} />
            </div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-card-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Play button */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-nova-accent/90 flex items-center justify-center shadow-lg">
              <FiPlay className="text-white ml-0.5" size={20} />
            </div>
          </motion.div>
          {/* Rating badge */}
          {movie.imdbRating && movie.imdbRating !== 'N/A' && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-nova-gold">
              <FiStar size={10} />
              {movie.imdbRating}
            </div>
          )}
          {/* Bookmark */}
          <button
            onClick={handleWatchlist}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-sm transition-all hover:bg-nova-accent"
          >
            {saved ? <BsBookmarkFill className="text-nova-accent" size={13} /> : <FiBookmark className="text-white" size={13} />}
          </button>
        </div>
        {/* Info */}
        <div className="mt-2.5 px-0.5">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-nova-accent transition-colors">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {movie.year && <span className="text-xs text-nova-muted">{movie.year}</span>}
            {movie.genre?.[0] && <span className="text-xs text-nova-muted">• {movie.genre[0]}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
