'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHome, FiFilm, FiUsers, FiBarChart2, FiBell, FiShield, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { Toaster } from 'react-hot-toast';

const NAV = [
  { href: '/admin', icon: FiHome, label: 'Dashboard' },
  { href: '/admin/movies', icon: FiFilm, label: 'Movies' },
  { href: '/admin/users', icon: FiUsers, label: 'Users & Bans' },
  { href: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  { href: '/admin/notifications', icon: FiBell, label: 'Notifications' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    document.cookie = 'nova_admin_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#0a0a0a] border-r border-nova-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 py-5 border-b border-nova-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-nova-accent rounded-lg flex items-center justify-center"><span className="text-white font-black text-xs">N</span></div>
            <span className="font-black text-sm"><span className="text-white">Nova</span><span className="text-nova-accent">Movies</span></span>
          </div>
          <p className="text-xs text-nova-muted mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === href ? 'bg-nova-accent/15 text-nova-accent border border-nova-accent/25' : 'text-nova-muted hover:bg-nova-card hover:text-white'
              }`}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-nova-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-nova-muted">Admin</p>
            <p className="text-xs text-white font-medium truncate">youseffahmed74@proton.me</p>
          </div>
          <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-nova-muted hover:text-nova-accent hover:bg-nova-accent/10 w-full transition-all">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 md:ml-60">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-nova-border px-4 md:px-8 h-14 flex items-center justify-between">
          <button className="md:hidden text-nova-muted hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <h1 className="font-bold text-sm text-white">{NAV.find(n => n.href === pathname)?.label || 'Admin'}</h1>
          <div className="flex items-center gap-2">
            <FiShield size={14} className="text-nova-accent" />
            <span className="text-xs text-nova-muted">Secure Session</span>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#e5e5e5', border: '1px solid #1a1a1a' } }} />
    </div>
  );
}
