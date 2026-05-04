'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'youseffahmed74@proton.me';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        document.cookie = `nova_admin_token=${data.token}; path=/; max-age=86400; samesite=strict`;
        toast.success('Welcome back, Admin!');
        setTimeout(() => router.push('/admin'), 500);
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch { toast.error('Login failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-nova-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-nova-accent/30">
            <span className="text-white font-black text-2xl">N</span>
          </div>
          <h1 className="text-2xl font-black"><span className="text-white">Nova</span><span className="text-nova-accent">Movies</span></h1>
          <p className="text-nova-muted text-sm mt-1">Admin Dashboard</p>
        </div>
        <div className="glass border border-nova-border rounded-2xl p-8">
          <h2 className="text-lg font-bold mb-6 text-center">Sign In</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-nova-muted" size={16} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Admin email"
                className="w-full bg-nova-card border border-nova-border rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-nova-accent/60 transition-colors"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-nova-muted" size={16} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password"
                className="w-full bg-nova-card border border-nova-border rounded-xl pl-11 pr-11 py-3 text-sm outline-none focus:border-nova-accent/60 transition-colors"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-nova-muted hover:text-white">
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-bold rounded-xl transition-colors disabled:opacity-60 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
        </div>
        <p className="text-center text-xs text-nova-muted mt-4">NovaMovies Admin Panel — Restricted Access</p>
      </motion.div>
    </div>
  );
}
