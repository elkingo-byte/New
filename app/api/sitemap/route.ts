import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(req: NextRequest) {
  await connectDB();
  const movies = await Movie.find({ isPublished: true }).select('slug updatedAt').lean();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://novamoviess.vercel.app';
  const urls = [
    `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/watchlist</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
    ...movies.map(m => `<url><loc>${baseUrl}/movies/${m.slug}</loc><lastmod>${new Date(m.updatedAt).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
  ].join('\n');

  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
}
