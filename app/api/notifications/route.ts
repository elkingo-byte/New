import { NextRequest, NextResponse } from 'next/server';

// In-memory notification store (use Redis in production)
let globalNotification: { message: string; type: string; createdAt: number } | null = null;

export async function GET(req: NextRequest) {
  const since = parseInt(req.nextUrl.searchParams.get('since') || '0');
  if (globalNotification && globalNotification.createdAt > since) {
    return NextResponse.json(globalNotification);
  }
  return NextResponse.json(null);
}

export async function POST(req: NextRequest) {
  try {
    const { message, type } = await req.json();
    globalNotification = { message, type: type || 'info', createdAt: Date.now() };
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
