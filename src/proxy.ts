import { createServerClient } from '@supabase/ssr';
import { NextResponse,type NextRequest } from 'next/server';
import { authConfig,localPreviewAllowed,workspaceAllowed } from './lib/auth/config';
const publicPaths=new Set(['/login','/signup','/forgot-password','/reset-password','/welcome','/complete-profile']);
export async function proxy(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(path.startsWith('/auth/')||path.startsWith('/api/auth/'))return NextResponse.next();
 const config=authConfig();
 if(!config){
  if(publicPaths.has(path)||localPreviewAllowed())return NextResponse.next();
  return path.startsWith('/api/')?NextResponse.json({error:'Autentikasi belum tersedia.'},{status:503}):NextResponse.redirect(new URL('/login',request.url));
 }
 let response=NextResponse.next({request});
 response.headers.set('Cache-Control','private, no-store');
 const client=createServerClient(config.url,config.key,{cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'&&process.env.TRAVELOS_LOCAL_PREVIEW!=='1'},cookies:{getAll:()=>request.cookies.getAll(),setAll:(items,headers)=>{items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));Object.entries(headers).forEach(([key,value])=>response.headers.set(key,value));response.headers.set('Cache-Control','private, no-store');}}});
 const finish=(next:NextResponse)=>{response.cookies.getAll().forEach(cookie=>next.cookies.set(cookie));for(const key of ['cache-control','expires','pragma']){const v=response.headers.get(key);if(v)next.headers.set(key,v);}return next;};
 try{
  const {data,error}=await client.auth.getClaims();const id=!error&&data?.claims.sub;
  if(publicPaths.has(path))return response;
  if(!id)return finish(path.startsWith('/api/')?NextResponse.json({error:'Silakan masuk terlebih dahulu.'},{status:401}):NextResponse.redirect(new URL('/login',request.url)));
  if(!workspaceAllowed(id))return finish(path.startsWith('/api/')?NextResponse.json({error:'Akun belum terhubung ke workspace ini.'},{status:403}):NextResponse.redirect(new URL('/welcome',request.url)));
  return response;
 }catch{
  if(publicPaths.has(path))return response;
  return finish(path.startsWith('/api/')?NextResponse.json({error:'Sesi tidak tersedia. Silakan masuk kembali.'},{status:401}):NextResponse.redirect(new URL('/login',request.url)));
 }
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)']};
