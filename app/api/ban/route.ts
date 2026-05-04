import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import BannedIP from '@/models/BannedIP';
import { notifyBannedUser } from '@/lib/discord';

export async function GET(req: NextRequest) {
  await connectDB();
  const banned = await BannedIP.find().sort({ bannedAt: -1 }).lean();
  return NextResponse.json(banned);
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { ip, userAgent, reason } = await req.json();
    await BannedIP.findOneAndUpdate(
      { ip },
      { ip, userAgent, reason, bannedAt: new Date() },
      { upsert: true }
    );
    await notifyBannedUser(ip, reason);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const ip = searchParams.get('ip');
  if (!ip) return NextResponse.json({ error: 'IP required' }, { status: 400 });
  await BannedIP.deleteOne({ ip });
  return NextResponse.json({ success: true });
}
