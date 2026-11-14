import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';
import { authConfig } from '@/lib/auth/config';
import { getSession } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Kata sandi baru — TravelOS' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Perbaikan: authConfig diakses sebagai objek (bukan dipanggil sebagai fungsi)
  const configured = Boolean(authConfig);
  let valid = false;

  if (configured) {
    try {
      // Mengambil sesi user dari database PostgreSQL / Cookie lokal kita
      const session = await getSession();
      valid = Boolean(session && session.user);
    } catch (err) {
      console.error('Reset password session check error:', err);
      valid = false;
    }
  }

  return (
    <AuthShell>
      <AuthForm mode="reset" configured={configured} sessionValid={valid} />
    </AuthShell>
  );
}