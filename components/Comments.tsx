'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

interface Comment { _id: string; guestName: string; content: string; createdAt: string; }

export default function Comments({ movieId }: { movieId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/comments?movieId=${movieId}`)
      .then(r => r.json()).then(setComments).catch(() => {});

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    socketRef.current = io(socketUrl);
    socketRef.current.on('comment:new', (c: Comment) => {
      setComments(prev => [c, ...prev]);
    });
    return () => { socketRef.current?.disconnect(); };
  }, [movieId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, guestName: name || 'Anonymous', content }),
      });
      const comment = await res.json();
      setComments(prev => [comment, ...prev]);
      socketRef.current?.emit('comment:new', { movieId, comment });
      setContent('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
    setSubmitting(false);
  };

  return (
    <div className="mt-8">
      <h3 className="flex items-center gap-2 text-lg font-bold mb-5">
        <FiMessageCircle className="text-nova-accent" />
        Comments ({comments.length})
      </h3>
      {/* Form */}
      <form onSubmit={submit} className="mb-6 glass rounded-xl p-4 flex flex-col gap-3">
        <input
          value={name} onChange={e => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="bg-nova-border/40 rounded-lg px-4 py-2.5 text-sm text-nova-text placeholder-nova-muted outline-none focus:border-nova-accent border border-transparent focus:border-nova-accent/60 transition-colors"
        />
        <div className="flex gap-2">
          <input
            value={content} onChange={e => setContent(e.target.value)}
            placeholder="Write a comment..."
            required
            className="flex-1 bg-nova-border/40 rounded-lg px-4 py-2.5 text-sm text-nova-text placeholder-nova-muted outline-none border border-transparent focus:border-nova-accent/60 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            type="submit" disabled={submitting}
            className="bg-nova-accent hover:bg-nova-accent-hover text-white px-4 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-60"
          >
            <FiSend size={15} />
          </motion.button>
        </div>
      </form>
      {/* List */}
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-nova-accent">{c.guestName}</span>
                <span className="text-xs text-nova-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-nova-text leading-relaxed">{c.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-center text-nova-muted text-sm py-8">No comments yet. Be the first!</p>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
