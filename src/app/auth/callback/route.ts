import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth/server';
import { authConfig, safeAuthNext } from '@/lib/auth/config';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextParam = url.searchParams.get('next');
  const next = safeAuthNext(nextParam);

  if (!authConfig || url.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/login?error=callback', url.origin));
  }

  const code = url.searchParams.get('code');
  if (code) {
    try {
      const { error } = await authClient.auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(new URL(next, url.origin));
        response.headers.set('Cache-Control', 'private, no-store');
        return response;
      }
    } catch (err) {
      console.error('Auth callback error:', err);
    }
  }

  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}