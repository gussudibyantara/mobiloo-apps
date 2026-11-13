import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';
import { authConfig } from '@/lib/auth/config';
export const metadata:Metadata={title:'Lupa kata sandi — TravelOS'};
export const dynamic='force-dynamic';
export default function Page(){return <AuthShell><AuthForm mode="forgot" configured={Boolean(authConfig())}/></AuthShell>;}
