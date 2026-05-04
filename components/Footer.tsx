'use client';
import Link from 'next/link';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-nova-border bg-nova-dark mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-nova-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">N</span>
              </div>
              <span className="text-xl font-black"><span className="text-white">Nova</span><span className="text-nova-accent">Movies</span></span>
            </div>
            <p className="text-nova-muted text-sm leading-relaxed max-w-xs">
              Premium movie streaming for cinephiles. Watch the latest and greatest in stunning HD and 4K.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Navigation</h4>
            <ul className="space-y-2 text-sm text-nova-muted">
              {[['/', 'Home'], ['/search', 'Movies'], ['/watchlist', 'Watchlist']].map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-nova-accent transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-nova-muted">
              <li><span className="cursor-pointer hover:text-nova-accent transition-colors">Privacy Policy</span></li>
              <li><span className="cursor-pointer hover:text-nova-accent transition-colors">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-nova-accent transition-colors">DMCA</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-nova-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-nova-muted text-xs">© 2024 NovaMovies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-nova-muted">
            <a href="mailto:youseffahmed74@proton.me" className="hover:text-nova-accent transition-colors"><FiMail size={18} /></a>
            <a href="#" className="hover:text-nova-accent transition-colors"><FiTwitter size={18} /></a>
            <a href="#" className="hover:text-nova-accent transition-colors"><FiGithub size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
