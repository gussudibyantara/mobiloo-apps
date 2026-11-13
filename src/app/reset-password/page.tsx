import type { Metadata } from 'next';
import AuthShell from '@/components/auth/auth-shell';
import AuthForm from '@/components/auth/auth-form';
import { authConfig } from '@/lib/auth/config';
import { authClient } from '@/lib/auth/server';
export const metadata:Metadata={title:'Kata sandi baru — TravelOS'};
export const dynamic='force-dynamic';
export default async function Page(){const configured=Boolean(authConfig());let valid=false;if(configured){try{const client=await authClient();const {data,error}=await client.auth.getUser();valid=!error&&Boolean(data.user);}catch{}}return <AuthShell><AuthForm mode="reset" configured={configured} sessionValid={valid}/></AuthShell>;}
