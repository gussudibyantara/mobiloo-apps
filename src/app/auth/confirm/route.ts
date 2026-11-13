import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth/server';
import { authConfig } from '@/lib/auth/config';
export async function GET(request:Request){
 const url=new URL(request.url),token_hash=url.searchParams.get('token_hash'),type=url.searchParams.get('type');
 if(authConfig()&&token_hash&&(type==='email'||type==='signup'||type==='recovery')){
  try{const client=await authClient();const {error}=await client.auth.verifyOtp({token_hash,type});if(!error){const response=NextResponse.redirect(new URL(type==='recovery'?'/reset-password':'/welcome',url.origin));response.headers.set('Cache-Control','private, no-store');return response;}}catch{}
 }
 return NextResponse.redirect(new URL('/login?error=callback',url.origin));
}
