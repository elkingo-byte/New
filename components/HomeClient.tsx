'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import MovieCard from './MovieCard';
import { FiPlay, FiInfo, FiChevronRight, FiTrendingUp, FiClock, FiStar } from 'react-icons/fi';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Movie {
  _id: string; title: string; poster: string; backdrop: string;
  year?: string; imdbRating?: string; genre?: string[];
  slug: string; views?: number; description?: string;
}

export default function HomeClient() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featured, setFeatured] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/movies?limit=24')
      .then(r => r.json())
      .then(data => {
        setMovies(data.movies || []);
        setFeatured(data.movies?.[0] || null);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  useGSAP(() => {
    gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
    gsap.utils.toArray<Element>('.section-title').forEach(el => {
      gsap.fromTo(el, { x: -30, opacity: 0 }, {
        x: 0, opacity: 1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  }, [featured]);

  const genres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Sci-Fi', 'Romance', 'Animation'];
  const trending = movies.slice(0, 8);
  const topRated = [...movies].sort((a, b) => parseFloat(b.imdbRating || '0') - parseFloat(a.imdbRating || '0')).slice(0, 8);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-nova-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-nova-muted text-sm">Loading NovaMovies...</span>
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Hero */}
      {featured && (
        <div ref={heroRef} className="relative h-[85vh] min-h-[500px] flex items-end overflow-hidden">
          {featured.backdrop && (
            <>
              <Image src={featured.backdrop} alt={featured.title} fill className="object-cover scale-105" priority />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </>
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-16 w-full">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3">
                {featured.genre?.slice(0,3).map(g => (
                  <span key={g} className="text-xs px-2.5 py-1 bg-nova-accent/20 text-nova-accent border border-nova-accent/30 rounded-full font-medium">{g}</span>
                ))}
                {featured.imdbRating && featured.imdbRating !== 'N/A' && (
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-nova-gold/20 text-nova-gold border border-nova-gold/30 rounded-full font-medium">
                    <FiStar size={10} /> {featured.imdbRating} IMDb
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 max-w-2xl leading-tight">{featured.title}</h1>
              <p className="text-nova-muted text-base md:text-lg max-w-xl mb-6 line-clamp-2 leading-relaxed">{featured.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/watch/${featured.slug}`}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2.5 px-6 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-nova-accent/20">
                    <FiPlay size={18} /> Watch Now
                  </motion.button>
                </Link>
                <Link href={`/movies/${featured.slug}`}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2.5 px-6 py-3 glass border border-white/20 text-white font-bold rounded-xl transition-all hover:border-white/40">
                    <FiInfo size={18} /> More Info
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={sectionsRef} className="max-w-7xl mx-auto px-4 md:px-8 mt-12 space-y-14">
        {/* Genres */}
        <div>
          <h2 className="section-title text-lg font-bold mb-4 flex items-center gap-2">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <Link key={g} href={`/search?genre=${g}`}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 glass border border-nova-border hover:border-nova-accent/50 rounded-xl text-sm font-medium transition-all hover:text-nova-accent">
                  {g}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending */}
        {trending.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title text-xl font-bold flex items-center gap-2">
                <FiTrendingUp className="text-nova-accent" /> Trending Now
              </h2>
              <Link href="/search" className="flex items-center gap-1 text-sm text-nova-muted hover:text-nova-accent transition-colors">
                View All <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {trending.map((m, i) => <MovieCard key={m._id} movie={m} index={i} />)}
            </div>
          </div>
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="section-title text-xl font-bold flex items-center gap-2">
                <FiStar className="text-nova-gold" /> Top Rated
              </h2>
              <Link href="/search?sort=rating" className="flex items-center gap-1 text-sm text-nova-muted hover:text-nova-accent transition-colors">
                View All <FiChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {topRated.map((m, i) => <MovieCard key={m._id} movie={m} index={i} />)}
            </div>
          </div>
        )}

        {movies.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">No movies yet</h3>
            <p className="text-nova-muted">Admin is populating the library. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
