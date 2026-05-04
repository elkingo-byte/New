import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get('movieId');
  if (!movieId) return NextResponse.json({ error: 'movieId required' }, { status: 400 });
  const comments = await Comment.find({ movieId }).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 20);
  if (limited) return limited;
  await connectDB();
  try {
    const { movieId, guestName, content } = await req.json();
    const ip = getClientIp(req);
    const comment = await Comment.create({ movieId, guestName: guestName || 'Anonymous', content, ip });
    return NextResponse.json(comment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
