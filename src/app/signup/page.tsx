import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Daftar — TravelOS' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <AuthShell>
      <AuthForm mode="signup" configured={true} />
    </AuthShell>
  );
}