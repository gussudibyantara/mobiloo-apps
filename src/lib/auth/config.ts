export function authConfig(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 try{const parsed=new URL(url);if(!['https:','http:'].includes(parsed.protocol))return null;return {url,key};}catch{return null;}
}
export function localPreviewAllowed(){return process.env.NODE_ENV!=='production'||process.env.TRAVELOS_LOCAL_PREVIEW==='1';}
export function workspaceAllowed(userId:string){return (process.env.TRAVELOS_WORKSPACE_USER_IDS||'').split(',').map(id=>id.trim()).filter(Boolean).includes(userId);}
export function safeAuthNext(value:string|null|undefined){return value==='/reset-password'?value:'/welcome';}
