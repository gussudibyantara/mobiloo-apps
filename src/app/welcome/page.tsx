import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, UserRound } from 'lucide-react';
import AuthShell from '@/components/auth/auth-shell';
import SignoutButton from '@/components/auth/signout-button';
import { normalizeWhatsApp } from '@/lib/auth/contact';
import { authConfig, workspaceAllowed } from '@/lib/auth/config';
import { getSession } from '@/lib/auth/server';

export const metadata = { title: 'Akun — TravelOS' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Perbaikan: authConfig dicek sebagai objek
  if (!authConfig) {
    return (
      <AuthShell>
        <div className="auth-card">
          <h1>Masuk untuk melanjutkan</h1>
          <p className="auth-description">Gunakan akunmu untuk membuka workspace yang terhubung.</p>
          <Link className="button primary auth-submit" href="/login">
            Ke halaman masuk <ArrowRight size={16} />
          </Link>
        </div>
      </AuthShell>
    );
  }

  // Mengambil sesi user dari database PostgreSQL / Cookie lokal kita
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const user = session.user;

  // Memeriksa nomor WhatsApp dari struktur data PostgreSQL lokal
  const whatsappNumber = user.whatsapp_number || user.user_metadata?.whatsapp_number || '';
  if (!normalizeWhatsApp(whatsappNumber)) {
    redirect('/complete-profile');
  }

  // Pengecekan workspace (workspaceAllowed dapat berupa fungsi atau boolean)
  const isWorkspaceAllowed = typeof workspaceAllowed === 'function' ? workspaceAllowed(user.id) : workspaceAllowed;
  if (isWorkspaceAllowed) {
    redirect('/');
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <span className="auth-state-icon">
          <UserRound size={25} />
        </span>
        <span className="auth-eyebrow">AKUN TRAVELOS</span>
        <h1>Akunmu sudah siap</h1>
        <p className="auth-description">
          Kamu masuk sebagai {user.email}. Akun ini belum terhubung ke workspace rental.
        </p>
        <p className="auth-description">
          Hubungi pengelola untuk menghubungkan akunmu ke workspace yang sesuai.
        </p>
        <div className="auth-welcome-actions">
          <SignoutButton />
        </div>
      </div>
    </AuthShell>
  );
}