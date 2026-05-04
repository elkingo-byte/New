import { Metadata } from 'next';
import MovieDetailClient from '@/components/MovieDetailClient';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/movies/${params.id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { title: 'Movie | NovaMovies' };
    const movie = await res.json();
    return {
      title: `${movie.title} (${movie.year || ''}) | NovaMovies`,
      description: movie.description?.slice(0, 160),
      openGraph: {
        title: movie.title,
        description: movie.description?.slice(0, 160),
        images: [{ url: movie.backdrop || movie.poster, width: 1200, height: 630 }],
        type: 'video.movie',
      },
      twitter: { card: 'summary_large_image', title: movie.title, images: [movie.poster] },
    };
  } catch { return { title: 'Movie | NovaMovies' }; }
}

export default function MoviePage({ params }: Props) {
  return <MovieDetailClient id={params.id} />;
}
