'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { BsStarFill } from 'react-icons/bs';
import toast from 'react-hot-toast';

export default function StarRating({ movieId }: { movieId: string }) {
  const [rating, setRating] = useState<{ average: string; count: number } | null>(null);
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?movieId=${movieId}`)
      .then(r => r.json()).then(setRating).catch(() => {});
    const saved = localStorage.getItem(`nova_rating_${movieId}`);
    if (saved) setSelected(parseInt(saved));
  }, [movieId]);

  const submit = async (score: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, score }),
      });
      const data = await res.json();
      setRating(data);
      setSelected(score);
      localStorage.setItem(`nova_rating_${movieId}`, String(score));
      toast.success('Rating saved!');
    } catch { toast.error('Failed to save rating'); }
    setLoading(false);
  };

  const active = hover || selected;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        {[1,2,3,4,5].map(i => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
            onClick={() => !loading && submit(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            disabled={loading}
            className="focus:outline-none"
          >
            {i <= active
              ? <BsStarFill className="text-nova-gold" size={20} />
              : <FiStar className="text-nova-muted" size={20} />}
          </motion.button>
        ))}
        {rating && (
          <span className="text-xs text-nova-muted ml-2">
            {rating.average} ({rating.count} {rating.count === 1 ? 'vote' : 'votes'})
          </span>
        )}
      </div>
    </div>
  );
}
