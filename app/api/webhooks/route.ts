import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAlert } from '@/lib/discord';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 10);
  if (limited) return limited;
  try {
    const { type, data } = await req.json();
    switch (type) {
      case 'new_movie':
        await sendDiscordAlert(`🎬 New movie added: **${data.title}**`, [{
          title: data.title, color: 0xe50914,
          thumbnail: data.poster ? { url: data.poster } : undefined,
          fields: [{ name: 'Genre', value: data.genre?.join(', ') || 'N/A', inline: true }],
          footer: { text: 'NovaMovies' }, timestamp: new Date().toISOString(),
        }]);
        break;
      case 'system_error':
        await sendDiscordAlert('🚨 System Error', [{
          title: 'Error', description: `\`\`\`${data.message}\`\`\``, color: 0xff0000,
          footer: { text: 'NovaMovies System' }, timestamp: new Date().toISOString(),
        }]);
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
