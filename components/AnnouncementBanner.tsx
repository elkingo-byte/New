'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBell, FiAlertTriangle, FiInfo } from 'react-icons/fi';

interface Announcement { message: string; type: string; createdAt: number; }

export default function AnnouncementBanner() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/notifications?since=${lastSeen}`);
        const data = await res.json();
        if (data) { setAnn(data); setVisible(true); setLastSeen(data.createdAt); }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [lastSeen]);

  if (!ann) return null;

  const icons: Record<string, React.ReactNode> = {
    info: <FiInfo />, warning: <FiAlertTriangle />, default: <FiBell />,
  };
  const colors: Record<string, string> = {
    info: 'border-blue-500/40 bg-blue-900/20',
    warning: 'border-yellow-500/40 bg-yellow-900/20',
    error: 'border-red-500/40 bg-red-900/20',
    default: 'border-nova-accent/40 bg-nova-accent/10',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          className={`fixed top-16 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 border-b backdrop-blur-md ${colors[ann.type] || colors.default}`}
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="text-nova-accent">{icons[ann.type] || icons.default}</span>
            <span className="text-nova-text">{ann.message}</span>
          </div>
          <button onClick={() => setVisible(false)} className="text-nova-muted hover:text-white transition-colors">
            <FiX size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
