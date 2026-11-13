import { redirect } from 'next/navigation';
import AuthShell from '@/components/auth/auth-shell';
import ContactForm from '@/components/auth/contact-form';
import { authConfig } from '@/lib/auth/config';
import { authClient } from '@/lib/auth/server';
import { normalizeWhatsApp } from '@/lib/auth/contact';
export const metadata={title:'Lengkapi akun — TravelOS'};
export const dynamic='force-dynamic';
export default async function Page(){
 if(!authConfig())redirect('/login');const client=await authClient();const {data,error}=await client.auth.getUser();if(error||!data.user)redirect('/login');
 if(normalizeWhatsApp(data.user.user_metadata.whatsapp_number||''))redirect('/welcome');
 return <AuthShell><ContactForm/></AuthShell>;
}
