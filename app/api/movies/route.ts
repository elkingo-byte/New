import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const limited = rateLimit(req, 100);
  if (limited) return limited;
  await connectDB();
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const genre = searchParams.get('genre');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    const query: any = { isPublished: true };
    if (genre) query.genre = { $in: [genre] };
    if (search) query.$text = { $search: search };

    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Movie.countDocuments(query),
    ]);

    return NextResponse.json({ movies, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();
    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const movie = await Movie.create({ ...body, slug });
    return NextResponse.json(movie, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
