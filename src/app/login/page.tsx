import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';

export const metadata: Metadata = { title: 'Masuk — TravelOS' };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <AuthShell>
      <AuthForm 
        mode="login" 
        configured={true} 
        initialError={
          params.error === 'callback'
            ? 'Proses masuk atau tautan verifikasi tidak berhasil. Coba lagi atau minta tautan baru.'
            : ''
        } 
        notice={params.notice} 
      />
    </AuthShell>
  );
}