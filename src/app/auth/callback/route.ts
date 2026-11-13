import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth/server';
import { authConfig,safeAuthNext } from '@/lib/auth/config';
export async function GET(request:Request){
 const url=new URL(request.url),next=safeAuthNext(url.searchParams.get('next'));
 if(!authConfig()||url.searchParams.has('error'))return NextResponse.redirect(new URL('/login?error=callback',url.origin));
 const code=url.searchParams.get('code');
 if(code){try{const client=await authClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error){const response=NextResponse.redirect(new URL(next,url.origin));response.headers.set('Cache-Control','private, no-store');return response;}}catch{}}
 return NextResponse.redirect(new URL('/login?error=callback',url.origin));
}
