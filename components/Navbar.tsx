'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBookmark, FiMenu, FiX, FiGlobe } from 'react-icons/fi';

const LANGS = [{ code: 'en', label: 'EN', dir: 'ltr' }, { code: 'ar', label: 'ع', dir: 'rtl' }];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'ar' : 'en';
    setLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const navLinks = [
    { href: '/', label: lang === 'ar' ? 'الرئيسية' : 'Home' },
    { href: '/search', label: lang === 'ar' ? 'أفلام' : 'Movies' },
    { href: '/watchlist', label: lang === 'ar' ? 'قائمتي' : 'Watchlist' },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nova-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">Nova</span>
              <span className="text-nova-accent">Movies</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-white ${
                pathname === href ? 'text-nova-accent' : 'text-nova-muted'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link href="/search" className="text-nova-muted hover:text-white transition-colors">
            <FiSearch size={20} />
          </Link>
          <Link href="/watchlist" className="text-nova-muted hover:text-white transition-colors">
            <FiBookmark size={20} />
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-nova-muted hover:text-white transition-colors text-sm font-medium"
          >
            <FiGlobe size={16} />
            {LANGS.find(l => l.code === lang)?.label}
          </button>
          <button className="md:hidden text-nova-muted hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-t border-nova-border"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 ${pathname === href ? 'text-nova-accent' : 'text-nova-muted'}`}>
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
