'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      // Save to API for polling clients
      await fetch('/api/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, type }),
      });
      // Also broadcast via socket
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
      const socket = io(socketUrl);
      socket.emit('admin:announce', { message, type });
      setTimeout(() => socket.disconnect(), 1000);
      toast.success('Announcement sent to all users!');
      setMessage('');
    } catch { toast.error('Failed to send'); }
    setSending(false);
  };

  const TYPES = [
    { value: 'info', label: 'Info', color: 'bg-blue-600' },
    { value: 'warning', label: 'Warning', color: 'bg-yellow-600' },
    { value: 'error', label: 'Alert', color: 'bg-red-600' },
    { value: 'default', label: 'Promo', color: 'bg-nova-accent' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h2 className="text-xl font-black">Global Notifications</h2><p className="text-nova-muted text-sm">Send real-time announcements to all users</p></div>

      <div className="glass border border-nova-border rounded-2xl p-6">
        <h3 className="font-bold mb-5 flex items-center gap-2"><FiBell className="text-nova-accent" /> Send Announcement</h3>
        <form onSubmit={send} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-nova-muted font-medium block mb-2">Notification Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${type === t.value ? `${t.color} text-white` : 'glass border border-nova-border text-nova-muted hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-nova-muted font-medium block mb-2">Message *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
              placeholder="Enter your announcement message here..."
              className="w-full bg-nova-card border border-nova-border rounded-xl px-4 py-3 text-sm outline-none focus:border-nova-accent/60 transition-colors resize-none" />
          </div>
          {/* Preview */}
          {message && (
            <div className={`p-3 rounded-xl border text-sm flex items-start gap-2 ${
              type === 'info' ? 'border-blue-500/40 bg-blue-900/20' :
              type === 'warning' ? 'border-yellow-500/40 bg-yellow-900/20' :
              type === 'error' ? 'border-red-500/40 bg-red-900/20' :
              'border-nova-accent/40 bg-nova-accent/10'
            }`}>
              <FiBell size={14} className="mt-0.5 flex-shrink-0 text-nova-accent" />
              <span>{message}</span>
            </div>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={sending}
            className="flex items-center justify-center gap-2 py-3 bg-nova-accent hover:bg-nova-accent-hover text-white font-bold rounded-xl transition-colors disabled:opacity-60">
            <FiSend size={16} /> {sending ? 'Sending...' : 'Broadcast to All Users'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
