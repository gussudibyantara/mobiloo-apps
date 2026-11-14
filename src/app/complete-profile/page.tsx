import { redirect } from 'next/navigation';
import AuthShell from '@/components/auth/auth-shell';
import ContactForm from '@/components/auth/contact-form';
import { authConfig } from '@/lib/auth/config';
import { getSession } from '@/lib/auth/server';
import { normalizeWhatsApp } from '@/lib/auth/contact';

export const metadata = { title: 'Lengkapi akun — TravelOS' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Perbaikan: authConfig diakses sebagai objek, bukan dipanggil sebagai fungsi ()
  if (!authConfig) {
    redirect('/login');
  }

  // Mengambil sesi user langsung dari backend PostgreSQL / Cookie lokal kita
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const user = session.user;

  // Memeriksa nomor WhatsApp dari metadata atau properti user PostgreSQL
  const whatsappNumber = user.whatsapp_number || user.user_metadata?.whatsapp_number || '';

  if (normalizeWhatsApp(whatsappNumber)) {
    redirect('/welcome');
  }

  return (
    <AuthShell>
      <ContactForm />
    </AuthShell>
  );
}