import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Daftar halaman publik yang bisa diakses tanpa login
  const publicPaths = ['/login', '/signup'];
  if (publicPaths.includes(path) || path.startsWith('/api/') || path.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Cek keberadaan cookie session lokal
  const sessionCookie = request.cookies.get('auth_session');

  // Jika belum login dan mencoba mengakses halaman privat, arahkan ke /login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};