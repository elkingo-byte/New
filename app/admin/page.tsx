'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiFilm, FiEye, FiTrendingUp, FiUsers, FiPlus, FiBarChart2 } from 'react-icons/fi';

interface Stats { totalMovies: number; totalViews: number; activeToday: number; topMovies: { title: string; views: number; poster: string; slug: string }[] }

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="glass border border-nova-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-nova-muted font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json()).then(data => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
    const interval = setInterval(() => {
      fetch('/api/analytics').then(r => r.json()).then(setStats).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-black">Dashboard</h2><p className="text-nova-muted text-sm mt-0.5">Real-time overview</p></div>
        <Link href="/admin/movies">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-white font-semibold rounded-xl text-sm transition-colors">
            <FiPlus size={16} /> Add Movie
          </motion.button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiFilm} label="Total Movies" value={stats?.totalMovies || 0} color="bg-nova-accent" />
          <StatCard icon={FiEye} label="Total Views" value={stats?.totalViews || 0} color="bg-blue-600" />
          <StatCard icon={FiTrendingUp} label="Views Today" value={stats?.activeToday || 0} color="bg-green-600" />
          <StatCard icon={FiUsers} label="Active Users" value="Live" color="bg-purple-600" />
        </div>
      )}

      {/* Top Movies */}
      {stats?.topMovies && stats.topMovies.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FiBarChart2 className="text-nova-accent" /> Top Movies</h3>
          <div className="glass border border-nova-border rounded-2xl overflow-hidden">
            {stats.topMovies.map((m, i) => (
              <div key={m.slug} className={`flex items-center gap-4 px-5 py-4 ${i < stats.topMovies.length - 1 ? 'border-b border-nova-border' : ''}`}>
                <span className="w-6 text-center text-nova-muted font-bold text-sm">{i + 1}</span>
                <div className="w-8 h-12 rounded-lg overflow-hidden bg-nova-card flex-shrink-0">
                  {m.poster && <Image src={m.poster} alt={m.title} width={32} height={48} className="w-full h-full object-cover" />}
                </div>
                <span className="flex-1 font-medium text-sm text-white truncate">{m.title}</span>
                <div className="flex items-center gap-1.5 text-sm text-nova-muted">
                  <FiEye size={13} />
                  <span>{m.views.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Movies', '/admin/movies', FiFilm], ['Users & Bans', '/admin/users', FiUsers],
          ['Analytics', '/admin/analytics', FiBarChart2], ['Notifications', '/admin/notifications', FiBarChart2]].map(([label, href, Icon]: any) => (
          <Link key={href} href={href}>
            <motion.div whileHover={{ scale: 1.03 }} className="glass border border-nova-border rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-nova-accent/30 transition-all">
              <Icon size={18} className="text-nova-accent" />
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
