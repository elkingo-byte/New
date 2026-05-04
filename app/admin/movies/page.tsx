'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiLoader, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Movie {
  _id: string; title: string; poster: string; year?: string; genre?: string[];
  slug: string; views?: number; isPublished?: boolean; imdbRating?: string; imdbId?: string;
}
interface FormData {
  title: string; description: string; poster: string; backdrop: string;
  videoUrl: string; imdbId?: string; imdbRating?: string; genre: string;
  director?: string; cast?: string; runtime?: string; year?: string;
  videoQualities?: string;
}
const EMPTY: FormData = { title: '', description: '', poster: '', backdrop: '', videoUrl: '', imdbId: '', imdbRating: '', genre: '', director: '', cast: '', runtime: '', year: '', videoQualities: '' };

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/movies?limit=100').then(r => r.json()).then(d => { setMovies(d.movies || []); setLoading(false); });
  }, []);

  const autoFetch = async () => {
    if (!form.title && !form.imdbId) { toast.error('Enter title or IMDB ID'); return; }
    setFetching(true);
    try {
      const res = await fetch('/api/fetch-movie', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, imdbId: form.imdbId }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({
          ...prev, ...data,
          genre: Array.isArray(data.genre) ? data.genre.join(', ') : data.genre || '',
          cast: Array.isArray(data.cast) ? data.cast.join(', ') : data.cast || '',
        }));
        toast.success('Movie data fetched!');
      } else toast.error(data.error || 'Not found');
    } catch { toast.error('Fetch failed'); }
    setFetching(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        genre: form.genre.split(',').map(s => s.trim()).filter(Boolean),
        cast: form.cast ? form.cast.split(',').map(s => s.trim()).filter(Boolean) : [],
        videoQualities: form.videoQualities
          ? form.videoQualities.split('\n').map(line => {
              const [label, url] = line.split('|').map(s => s.trim());
              return { label, url };
            }).filter(q => q.label && q.url)
          : [],
      };
      const url = editing ? `/api/movies/${editing}` : '/api/movies';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error);
      if (editing) setMovies(prev => prev.map(m => m._id === editing ? saved : m));
      else setMovies(prev => [saved, ...prev]);
      toast.success(editing ? 'Movie updated!' : 'Movie added!');
      setShowForm(false); setForm(EMPTY); setEditing(null);
    } catch (err: any) { toast.error(err.message || 'Save failed'); }
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this movie?')) return;
    await fetch(`/api/movies/${id}`, { method: 'DELETE' });
    setMovies(prev => prev.filter(m => m._id !== id));
    toast.success('Deleted');
  };

  const startEdit = (m: Movie) => {
    setForm({ title: m.title, description: '', poster: m.poster || '', backdrop: '', videoUrl: '', imdbId: m.imdbId || '', imdbRating: m.imdbRating || '', genre: m.genre?.join(', ') || '' });
    setEditing(m._id); setShowForm(true);
  };

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Movies ({movies.length})</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setShowForm(true); setForm(EMPTY); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-white font-semibold rounded-xl text-sm transition-colors">
          <FiPlus size={16} /> Add Movie
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-nova-muted" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search movies..."
          className="w-full bg-nova-card border border-nova-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
      </div>

      {/* Table */}
      <div className="glass border border-nova-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-nova-border bg-nova-card/50">
              <tr>
                {['Movie', 'Year', 'Genre', 'Rating', 'Views', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-nova-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-nova-border/50 hover:bg-nova-card/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-12 rounded-lg overflow-hidden bg-nova-card flex-shrink-0">
                        {m.poster && <Image src={m.poster} alt={m.title} width={32} height={48} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-white truncate max-w-[200px]">{m.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-nova-muted">{m.year || '—'}</td>
                  <td className="px-5 py-3.5"><span className="text-xs px-2 py-0.5 bg-nova-accent/10 text-nova-accent rounded-full">{m.genre?.[0] || '—'}</span></td>
                  <td className="px-5 py-3.5 text-nova-gold font-medium">{m.imdbRating || '—'}</td>
                  <td className="px-5 py-3.5 text-nova-muted">{(m.views || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg text-nova-muted hover:text-blue-400 hover:bg-blue-400/10 transition-all"><FiEdit size={14} /></button>
                      <button onClick={() => remove(m._id)} className="p-1.5 rounded-lg text-nova-muted hover:text-nova-accent hover:bg-nova-accent/10 transition-all"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 24 }}
              className="glass border border-nova-border rounded-2xl w-full max-w-2xl p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">{editing ? 'Edit Movie' : 'Add New Movie'}</h3>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-nova-muted hover:text-white"><FiX /></button>
              </div>

              {/* Auto-fetch */}
              <div className="flex gap-2 mb-5 p-3 bg-nova-accent/5 border border-nova-accent/20 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-nova-accent font-semibold mb-1.5">Auto-fill from OMDB + TMDB + Fanart.tv</p>
                  <div className="flex gap-2">
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Movie Title" className="flex-1 bg-nova-card border border-nova-border rounded-lg px-3 py-2 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
                    <input value={form.imdbId || ''} onChange={e => setForm(p => ({ ...p, imdbId: e.target.value }))}
                      placeholder="IMDB ID (optional)" className="w-36 bg-nova-card border border-nova-border rounded-lg px-3 py-2 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
                    <button onClick={autoFetch} disabled={fetching}
                      className="px-3 py-2 bg-nova-accent hover:bg-nova-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-60 transition-colors">
                      {fetching ? <><FiLoader className="animate-spin" size={12} /> Fetching...</> : <><FiUpload size={12} /> Fetch</>}
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={save} className="grid grid-cols-2 gap-4">
                {[
                  ['title', 'Title *', 'text', true, 'col-span-2'],
                  ['description', 'Description *', 'textarea', true, 'col-span-2'],
                  ['poster', 'Poster URL *', 'text', true, 'col-span-2'],
                  ['backdrop', 'Backdrop URL', 'text', false, 'col-span-2'],
                  ['videoUrl', 'Video URL *', 'text', true, 'col-span-2'],
                  ['videoQualities', 'Multi-Quality URLs (label|url per line)', 'textarea', false, 'col-span-2'],
                  ['genre', 'Genres (comma-separated)', 'text', false, ''],
                  ['year', 'Year', 'text', false, ''],
                  ['director', 'Director', 'text', false, ''],
                  ['runtime', 'Runtime', 'text', false, ''],
                  ['cast', 'Cast (comma-separated)', 'text', false, 'col-span-2'],
                  ['imdbRating', 'IMDB Rating', 'text', false, ''],
                  ['imdbId', 'IMDB ID', 'text', false, ''],
                ].map(([field, label, type, req, cls]: any) => (
                  <div key={field} className={cls}>
                    <label className="text-xs text-nova-muted font-medium mb-1 block">{label}</label>
                    {type === 'textarea' ? (
                      <textarea value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        required={req} rows={3}
                        className="w-full bg-nova-card border border-nova-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-nova-accent/60 transition-colors resize-none" />
                    ) : (
                      <input type={type} value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        required={req}
                        className="w-full bg-nova-card border border-nova-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
                    )}
                  </div>
                ))}
                <div className="col-span-2 flex gap-3 mt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={saving}
                    className="flex-1 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-bold rounded-xl transition-colors disabled:opacity-60">
                    {saving ? 'Saving...' : (editing ? 'Update Movie' : 'Add Movie')}
                  </motion.button>
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                    className="px-5 py-3 glass border border-nova-border rounded-xl text-sm hover:border-nova-accent/30 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
