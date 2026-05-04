'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface BannedIP { _id: string; ip: string; userAgent?: string; reason?: string; bannedAt: string; }

export default function AdminUsersPage() {
  const [banned, setBanned] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState('');
  const [newReason, setNewReason] = useState('');
  const [banning, setBanning] = useState(false);

  const fetchBanned = async () => {
    setLoading(true);
    const res = await fetch('/api/ban');
    const data = await res.json();
    setBanned(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBanned(); }, []);

  const banIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;
    setBanning(true);
    try {
      await fetch('/api/ban', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newIp, reason: newReason }),
      });
      toast.success(`IP ${newIp} banned`);
      setNewIp(''); setNewReason('');
      fetchBanned();
    } catch { toast.error('Failed to ban'); }
    setBanning(false);
  };

  const unban = async (ip: string) => {
    await fetch(`/api/ban?ip=${encodeURIComponent(ip)}`, { method: 'DELETE' });
    setBanned(prev => prev.filter(b => b.ip !== ip));
    toast.success('IP unbanned');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black">Security — IP Ban System</h2><p className="text-nova-muted text-sm">Manage banned IPs and access control</p></div>
        <button onClick={fetchBanned} className="p-2 glass border border-nova-border rounded-xl text-nova-muted hover:text-white transition-all"><FiRefreshCw size={16} /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass border border-nova-border rounded-2xl p-5">
          <p className="text-sm text-nova-muted mb-1">Total Banned IPs</p>
          <p className="text-3xl font-black text-nova-accent">{banned.length}</p>
        </div>
        <div className="glass border border-nova-border rounded-2xl p-5">
          <p className="text-sm text-nova-muted mb-1">Status</p>
          <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><p className="text-sm font-medium text-white">Shield Active</p></div>
        </div>
      </div>

      {/* Ban form */}
      <div className="glass border border-nova-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><FiPlus size={14} className="text-nova-accent" /> One-Click Ban</h3>
        <form onSubmit={banIp} className="flex flex-col sm:flex-row gap-3">
          <input value={newIp} onChange={e => setNewIp(e.target.value)} placeholder="IP Address (e.g. 192.168.1.1)" required
            className="flex-1 bg-nova-card border border-nova-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
          <input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="Reason (optional)"
            className="flex-1 bg-nova-card border border-nova-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-nova-accent/60 transition-colors" />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            type="submit" disabled={banning}
            className="flex items-center gap-2 px-5 py-2.5 bg-nova-accent hover:bg-nova-accent-hover text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60">
            <FiShield size={14} /> {banning ? 'Banning...' : 'Ban IP'}
          </motion.button>
        </form>
      </div>

      {/* Banned list */}
      <div className="glass border border-nova-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-nova-border bg-nova-card/50">
          <p className="text-sm font-semibold text-white">Banned IP Addresses</p>
        </div>
        {loading ? (
          <div className="p-8 text-center text-nova-muted text-sm">Loading...</div>
        ) : banned.length === 0 ? (
          <div className="p-8 text-center text-nova-muted text-sm">No banned IPs. The platform is clean.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-nova-border">
                <tr>{['IP Address', 'Reason', 'User Agent', 'Banned At', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-nova-muted uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {banned.map((b, i) => (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-nova-border/40 hover:bg-nova-card/20 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-nova-accent text-sm">{b.ip}</td>
                    <td className="px-5 py-3.5 text-nova-muted text-xs max-w-[150px] truncate">{b.reason || '—'}</td>
                    <td className="px-5 py-3.5 text-nova-muted text-xs max-w-[200px] truncate">{b.userAgent || '—'}</td>
                    <td className="px-5 py-3.5 text-nova-muted text-xs">{new Date(b.bannedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => unban(b.ip)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-nova-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <FiTrash2 size={12} /> Unban
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
