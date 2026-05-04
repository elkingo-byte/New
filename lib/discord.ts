const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  thumbnail?: { url: string };
  footer?: { text: string };
  timestamp?: string;
}

export async function sendDiscordAlert(content: string, embeds?: DiscordEmbed[]) {
  if (!WEBHOOK_URL) return;
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, embeds }),
    });
  } catch (err) {
    console.error('Discord webhook error:', err);
  }
}

export async function notifyNewMovie(movie: { title: string; poster?: string; genre?: string }) {
  await sendDiscordAlert('🎬 **New Movie Added on NovaMovies!**', [{
    title: movie.title,
    description: `Genre: ${movie.genre || 'N/A'}`,
    color: 0xe50914,
    thumbnail: movie.poster ? { url: movie.poster } : undefined,
    footer: { text: 'NovaMovies Admin' },
    timestamp: new Date().toISOString(),
  }]);
}

export async function notifySystemError(error: string) {
  await sendDiscordAlert('🚨 **System Error on NovaMovies**', [{
    title: 'Error Details',
    description: `\`\`\`${error}\`\`\``,
    color: 0xff0000,
    footer: { text: 'NovaMovies System' },
    timestamp: new Date().toISOString(),
  }]);
}

export async function notifyBannedUser(ip: string, reason?: string) {
  await sendDiscordAlert('🔨 **User Banned on NovaMovies**', [{
    title: 'Ban Executed',
    description: `IP: \`${ip}\`\nReason: ${reason || 'Admin decision'}`,
    color: 0xff6600,
    footer: { text: 'NovaMovies Security' },
    timestamp: new Date().toISOString(),
  }]);
}
