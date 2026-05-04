import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'NovaMovies — Watch Movies Online in HD',
  description: 'Stream thousands of movies in HD and 4K on NovaMovies. Watch the latest blockbusters, classics and more.',
};

export default function HomePage() {
  return <HomeClient />;
}
