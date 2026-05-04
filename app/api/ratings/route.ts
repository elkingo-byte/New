import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Rating from '@/models/Rating';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get('movieId');
  if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });
  const ratings = await Rating.find({ movieId }).lean();
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;
  return NextResponse.json({ average: avg.toFixed(1), count: ratings.length });
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { movieId, score } = await req.json();
    const ip = getClientIp(req);
    await Rating.findOneAndUpdate(
      { movieId, ip },
      { movieId, ip, score },
      { upsert: true, new: true }
    );
    const ratings = await Rating.find({ movieId }).lean();
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length : 0;
    return NextResponse.json({ average: avg.toFixed(1), count: ratings.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
