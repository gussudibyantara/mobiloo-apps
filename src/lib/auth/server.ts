import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');
  
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// Ekspor authClient dengan struktur objek auth yang valid
export const authClient = {
  getSession,
  auth: {
    exchangeCodeForSession: async (code: string) => {
      // Sesuaikan logic pertukaran kode sesi Anda di sini jika ada
      return { error: null };
    }
  }
};