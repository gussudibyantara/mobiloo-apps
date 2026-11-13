'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {UserRound,Settings2,CreditCard,CircleHelp} from 'lucide-react';
import Drawer from './drawer';
import SignoutButton from './auth/signout-button';
import {authConfig} from '@/lib/auth/config';
export default function ProfileMenu({onHelp,onOpen}:{onHelp:()=>void;onOpen:()=>void}){
 const [open,setOpen]=useState(false),[section,setSection]=useState<'profile'|'settings'|'billing'>();
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
 useEffect(()=>{
  if(!open)return;
  root.current?.querySelector<HTMLButtonElement>('.profile-dropdown button')?.focus();
  const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 function select(value:'profile'|'settings'|'billing'|'help'){
  setOpen(false);trigger.current?.focus();
  if(value==='help')onHelp();else setSection(value);
 }
 return <><div className="profile-menu" ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
  <button type="button" ref={trigger} className="top-avatar profile-trigger" aria-label="Menu akun Azis Maliek" aria-expanded={open} aria-controls={id} onClick={()=>{if(!open)onOpen();setOpen(v=>!v);}}>AM</button>
  {open&&<div id={id} className="profile-dropdown"><div className="profile-menu-identity"><strong>Azis Maliek</strong><small>Owner workspace</small></div><ul aria-label="Menu akun">
   <li><button type="button" onClick={()=>select('profile')}><UserRound size={17}/>Profile</button></li>
   <li><button type="button" onClick={()=>select('settings')}><Settings2 size={17}/>Pengaturan<small>Segera</small></button></li>
   <li><button type="button" onClick={()=>select('billing')}><CreditCard size={17}/>Check billing<small>Segera</small></button></li>
   <li><button type="button" onClick={()=>select('help')}><CircleHelp size={17}/>Panduan Workspace</button></li>
   <li className="profile-signout"><SignoutButton className="profile-logout" label="Log out"/>{!authConfig()&&<small>Mode lokal · kembali ke halaman login</small>}</li>
  </ul></div>}
 </div>{section&&<Drawer title={{profile:'Profile',settings:'Pengaturan',billing:'Check billing'}[section]} subtitle="AKUN / WORKSPACE" onClose={()=>setSection(undefined)}><div className="drawer-body profile-account-body">{section==='profile'?<><span className="avatar">AM</span><h3>Azis Maliek</h3><p>Owner workspace</p><dl><div><dt>Workspace</dt><dd>BetterWorks Rental</dd></div><div><dt>Mode aplikasi</dt><dd>Workspace lokal</dd></div></dl><p className="field-hint">Identitas yang ditampilkan mengikuti workspace lokal. Pengelolaan profil akun belum tersedia.</p></>:<><p className="inline-info">{section==='settings'?'Pengaturan workspace belum tersedia.':'Pengelolaan paket, langganan, dan riwayat tagihan belum tersedia.'}</p><p className="field-hint">Fitur ini sedang disiapkan.</p></>}</div></Drawer>}</>;
}
