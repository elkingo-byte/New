import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Movie from '@/models/Movie';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const movie = await Movie.findOneAndUpdate(
      { $or: [{ _id: params.id.length === 24 ? params.id : null }, { slug: params.id }] },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
    if (!movie) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await req.json();
    const movie = await Movie.findByIdAndUpdate(params.id, body, { new: true });
    if (!movie) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(movie);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    await Movie.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
