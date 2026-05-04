import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') || 'unknown';

  // Check banned IPs (in production, cache this in memory/Redis)
  const bannedIPsCookie = req.cookies.get('__banned_ips')?.value;
  if (bannedIPsCookie) {
    try {
      const bannedList: string[] = JSON.parse(bannedIPsCookie);
      if (bannedList.includes(ip)) {
        return new NextResponse(
          `<!DOCTYPE html><html><body style="background:#000;color:#e50914;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;text-align:center;">
           <h1 style="font-size:3rem;">🚫 Access Denied</h1>
           <p style="color:#999;font-size:1.2rem;">Your access to NovaMovies has been revoked.</p>
           <p style="color:#666;font-size:0.9rem;">If you believe this is an error, contact support.</p>
           </body></html>`,
          { status: 403, headers: { 'Content-Type': 'text/html' } }
        );
      }
    } catch {}
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const adminToken = req.cookies.get('nova_admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Visitor-IP', ip);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons).*)'],
};
