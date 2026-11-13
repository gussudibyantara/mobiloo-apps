import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight,UserRound } from 'lucide-react';
import AuthShell from '@/components/auth/auth-shell';
import SignoutButton from '@/components/auth/signout-button';
import { normalizeWhatsApp } from '@/lib/auth/contact';
import { authConfig,workspaceAllowed } from '@/lib/auth/config';
import { authClient } from '@/lib/auth/server';
export const metadata={title:'Akun — TravelOS'};
export const dynamic='force-dynamic';
export default async function Page(){
 if(!authConfig())return <AuthShell><div className="auth-card"><h1>Masuk untuk melanjutkan</h1><p className="auth-description">Gunakan akunmu untuk membuka workspace yang terhubung.</p><Link className="button primary auth-submit" href="/login">Ke halaman masuk<ArrowRight size={16}/></Link></div></AuthShell>;
 const client=await authClient();const {data,error}=await client.auth.getUser();if(error||!data.user)redirect('/login');
 const user=data.user;if(!normalizeWhatsApp(user.user_metadata.whatsapp_number||''))redirect('/complete-profile');if(workspaceAllowed(user.id))redirect('/');
 return <AuthShell><div className="auth-card"><span className="auth-state-icon"><UserRound size={25}/></span><span className="auth-eyebrow">AKUN TRAVELOS</span><h1>Akunmu sudah siap</h1><p className="auth-description">Kamu masuk sebagai {user.email}. Akun ini belum terhubung ke workspace rental.</p><p className="auth-description">Hubungi pengelola untuk menghubungkan akunmu ke workspace yang sesuai.</p><div className="auth-welcome-actions"><SignoutButton/></div></div></AuthShell>;
}
