import WatchClient from '@/components/WatchClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Watch | NovaMovies' };

export default function WatchPage({ params }: { params: { id: string } }) {
  return <WatchClient id={params.id} />;
}
