'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiEye, FiFilm, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import Image from 'next/image';

interface Stats { totalMovies: number; totalViews: number; activeToday: number; topMovies: { title: string; views: number; poster: string; slug: string }[] }

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/analytics');
    const data = await res.json();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 30000); return () => clearInterval(iv); }, []);

  const maxViews = stats?.topMovies?.reduce((m, t) => Math.max(m, t.views), 1) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black">Analytics</h2><p className="text-nova-muted text-sm">Real-time platform insights</p></div>
        <button onClick={load} className="p-2 glass border border-nova-border rounded-xl text-nova-muted hover:text-white transition-all"><FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Movies', value: stats?.totalMovies, icon: FiFilm, color: 'text-nova-accent' },
          { label: 'Total Views', value: stats?.totalViews?.toLocaleString(), icon: FiEye, color: 'text-blue-400' },
          { label: 'Views Today', value: stats?.activeToday, icon: FiTrendingUp, color: 'text-green-400' },
          { label: 'Avg Views/Movie', value: stats?.totalMovies ? Math.round((stats.totalViews || 0) / stats.totalMovies) : 0, icon: FiBarChart2, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass border border-nova-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-nova-muted font-medium">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-black text-white">{loading ? '...' : (value ?? 0)}</p>
          </motion.div>
        ))}
      </div>

      {stats?.topMovies && stats.topMovies.length > 0 && (
        <div className="glass border border-nova-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-5 flex items-center gap-2"><FiBarChart2 className="text-nova-accent" /> Top Movies by Views</h3>
          <div className="space-y-4">
            {stats.topMovies.map((m, i) => (
              <div key={m.slug} className="flex items-center gap-4">
                <span className="w-5 text-xs font-bold text-nova-muted text-center">{i + 1}</span>
                <div className="w-8 h-10 rounded-lg overflow-hidden bg-nova-card flex-shrink-0">
                  {m.poster && <Image src={m.poster} alt={m.title} width={32} height={40} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate mb-1.5">{m.title}</p>
                  <div className="h-1.5 bg-nova-border rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(m.views / maxViews) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-nova-accent to-orange-400 rounded-full" />
                  </div>
                </div>
                <span className="text-sm font-semibold text-nova-muted flex-shrink-0">{m.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
