import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';
import Analytics from '@/models/Analytics';
import { getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const totalMovies = await Movie.countDocuments();
    const totalViews = await Movie.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const topMovies = await Movie.find().sort({ views: -1 }).limit(5).select('title views poster slug').lean();
    const recentViews = await Analytics.countDocuments({
      watchedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    return NextResponse.json({
      totalMovies,
      totalViews: totalViews[0]?.total || 0,
      topMovies,
      activeToday: recentViews,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { movieId } = await req.json();
    const ip = getClientIp(req);
    const ua = req.headers.get('user-agent') || '';
    await Analytics.create({ movieId, ip, userAgent: ua });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
