import SearchClient from '@/components/SearchClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Search | NovaMovies' };

export default function SearchPage() {
  return <SearchClient />;
}
