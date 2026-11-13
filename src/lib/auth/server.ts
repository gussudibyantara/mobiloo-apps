import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig,localPreviewAllowed,workspaceAllowed } from './config';
import { fail } from '../api-utils';
export async function authClient(){
 const config=authConfig();
 if(!config)throw new Error('Autentikasi belum tersedia. Silakan coba lagi nanti.');
 const jar=await cookies();
 return createServerClient(config.url,config.key,{
  cookieOptions:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production'&&process.env.TRAVELOS_LOCAL_PREVIEW!=='1'},
  cookies:{
   getAll:()=>jar.getAll(),
   setAll:items=>{
    for(const {name,value,options}of items){
     try{jar.set(name,value,options);}catch{/* Read-only render; Proxy refreshes cookies. */}
    }
   },
  },
 });
}
/** Guard at the persistence boundary as well as at the HTTP Proxy. */
export async function assertWorkspaceAccess(){
 if(!authConfig()){if(localPreviewAllowed())return;fail('Autentikasi belum tersedia.',503);}
 const client=await authClient();const {data,error}=await client.auth.getUser();
 if(error||!data.user)fail('Silakan masuk terlebih dahulu.',401);
 if(!workspaceAllowed(data.user.id))fail('Akun belum terhubung ke workspace ini.',403);
}
