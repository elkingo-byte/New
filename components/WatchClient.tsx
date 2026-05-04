'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import WatchParty from './WatchParty';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import { Socket } from 'socket.io-client';

interface Movie {
  _id: string; title: string; slug: string; videoUrl: string;
  videoQualities?: { label: string; url: string }[];
  poster?: string; backdrop?: string; year?: string; description?: string;
}

export default function WatchClient({ id }: { id: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [partySocket, setPartySocket] = useState<Socket | null>(null);
  const [isPartyHost, setIsPartyHost] = useState(false);

  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(r => r.json()).then(data => { setMovie(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-nova-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-nova-muted gap-4">
      <p>Movie not found.</p>
      <Link href="/" className="text-nova-accent hover:underline">Go Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-b from-black to-transparent relative z-10">
        <Link href={`/movies/${movie.slug}`} className="flex items-center gap-2 text-nova-muted hover:text-white transition-colors text-sm">
          <FiArrowLeft size={18} /> <span>Back</span>
        </Link>
        <h1 className="font-semibold text-sm text-white">{movie.title}</h1>
        <div className="flex items-center gap-3">
          <WatchParty movieId={movie._id} onSocketReady={(s, isHost) => { setPartySocket(s); setIsPartyHost(isHost); }} />
          <Link href={`/movies/${movie.slug}`} className="text-nova-muted hover:text-white transition-colors">
            <FiInfo size={18} />
          </Link>
        </div>
      </div>

      {/* Player */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
        <VideoPlayer
          src={movie.videoUrl}
          qualities={movie.videoQualities}
          movieId={movie._id}
          partySocket={partySocket}
          isPartyHost={isPartyHost}
        />
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{movie.title}</h2>
            {movie.year && <p className="text-nova-muted text-sm mt-0.5">{movie.year}</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
