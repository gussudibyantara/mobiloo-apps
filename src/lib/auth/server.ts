import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  
  if (!sessionCookie) return null;
  
  try {
    // Mengurai data session user yang disimpan di cookie
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}