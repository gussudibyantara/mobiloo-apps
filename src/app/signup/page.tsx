import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';
import { authConfig } from '@/lib/auth/config';
export const metadata:Metadata={title:'Daftar — TravelOS'};
export const dynamic='force-dynamic';
export default function Page(){return <AuthShell signup><AuthForm mode="signup" configured={Boolean(authConfig())}/></AuthShell>;}
