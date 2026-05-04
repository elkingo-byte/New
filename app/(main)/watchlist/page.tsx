import WatchlistClient from '@/components/WatchlistClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'My Watchlist | NovaMovies' };

export default function WatchlistPage() {
  return <WatchlistClient />;
}
