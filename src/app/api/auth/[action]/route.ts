import { z } from 'zod';
import { NextResponse } from 'next/server';
import { authClient } from '@/lib/auth/server';
import { authConfig } from '@/lib/auth/config';
import { authError } from '@/lib/auth/errors';
import { contactSchema,contactMetadata } from '@/lib/auth/contact';
import { originAllowed } from '@/lib/request';
export const runtime='nodejs';
const email=z.email().max(254),password=z.string().min(8,'Kata sandi minimal 8 karakter.').max(128);
const schemas={login:z.object({email,password:z.string().min(1).max(128)}),signup:contactSchema.extend({name:z.string().trim().min(2,'Nama minimal 2 karakter.').max(150),email,password}),forgot:z.object({email}),'update-password':z.object({password}),contact:contactSchema};
async function handlePost(request:Request,{params}:{params:Promise<{action:string}>}){
 if(!request.headers.get('origin')||!originAllowed(request))return NextResponse.json({error:'Permintaan tidak diizinkan.'},{status:403});
 const {action}=await params;
 if(!['login','signup','forgot','google','update-password','signout','contact'].includes(action))return NextResponse.json({error:'Halaman tidak ditemukan.'},{status:404});
 if(!authConfig())return NextResponse.json({error:'Autentikasi belum tersedia. Silakan coba lagi nanti.'},{status:503});
 try{
  const client=await authClient(),origin=new URL(request.headers.get('origin')!).origin;
  if(action==='google'){
   const {data,error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${origin}/auth/callback`,skipBrowserRedirect:true,queryParams:{prompt:'select_account'}}});
   if(error)return NextResponse.json({error:authError(error)},{status:400});
   if(!data.url)return NextResponse.json({error:'Google belum dapat dibuka. Coba lagi.'},{status:502});
   return NextResponse.json({url:data.url},{headers:{'Cache-Control':'no-store'}});
  }
  if(action==='signout'){const {error}=await client.auth.signOut({scope:'local'});if(error)return NextResponse.json({error:authError(error)},{status:400});return NextResponse.json({redirect:'/login'});}
  const schema=schemas[action as keyof typeof schemas],input=schema.parse(await request.json());
  if(action==='login'){
   const value=input as z.infer<typeof schemas.login>;const {error}=await client.auth.signInWithPassword(value);
   return error?NextResponse.json({error:authError(error)},{status:400}):NextResponse.json({redirect:'/welcome'});
  }
  if(action==='signup'){
   const {name,whatsapp,updatesOptIn,...credentials}=input as z.infer<typeof schemas.signup>;
   const {data,error}=await client.auth.signUp({...credentials,options:{data:{full_name:name,...contactMetadata({whatsapp,updatesOptIn})},emailRedirectTo:`${origin}/auth/callback`}});
   return error?NextResponse.json({error:authError(error)},{status:400}):NextResponse.json(data.session?{redirect:'/welcome'}:{message:'Jika alamat email dapat didaftarkan, tautan verifikasi akan dikirim. Periksa inbox dan folder spam.'});
  }
  if(action==='forgot'){
   const {email}=input as z.infer<typeof schemas.forgot>;const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:`${origin}/auth/callback?next=/reset-password`});
   return error?NextResponse.json({error:authError(error)},{status:400}):NextResponse.json({message:'Jika email terdaftar dan mendukung kata sandi, tautan pemulihan akan dikirim. Periksa inbox dan folder spam.'});
  }
  const {data,error:sessionError}=await client.auth.getUser();if(sessionError||!data.user)return NextResponse.json({error:action==='contact'?'Sesi berakhir. Silakan masuk kembali.':'Tautan tidak berlaku atau sesi berakhir. Minta tautan pemulihan baru.'},{status:401});
  if(action==='contact'){const {error}=await client.auth.updateUser({data:contactMetadata(input as z.infer<typeof contactSchema>)});return error?NextResponse.json({error:authError(error)},{status:400}):NextResponse.json({redirect:'/welcome'});}
  const {error}=await client.auth.updateUser(input as {password:string});
  if(error)return NextResponse.json({error:authError(error)},{status:400});
  await client.auth.signOut();return NextResponse.json({redirect:'/login?notice=password-updated'});
 }catch(error){if(error instanceof z.ZodError)return NextResponse.json({error:error.issues[0]?.message||'Periksa isian form.'},{status:400});if(error instanceof SyntaxError)return NextResponse.json({error:'Format permintaan tidak valid.'},{status:400});return NextResponse.json({error:authError(error)},{status:503});}
}

export async function POST(request:Request,context:{params:Promise<{action:string}>}){const response=await handlePost(request,context);response.headers.set("Cache-Control","private, no-store");response.headers.set("Pragma","no-cache");return response;}
