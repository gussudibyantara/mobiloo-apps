'use client';
import { useState,type FormEvent } from 'react';
import { ArrowRight,LoaderCircle } from 'lucide-react';
import WhatsAppFields from './whatsapp-fields';
import { normalizeWhatsApp } from '@/lib/auth/contact';
import SignoutButton from './signout-button';
export default function ContactForm(){
 const [whatsapp,setWhatsapp]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setError('');if(!normalizeWhatsApp('+62'+whatsapp)){setError('Masukkan nomor WhatsApp mulai dari 8, tanpa angka 0 atau kode negara.');return;}setBusy(true);try{const response=await fetch('/api/auth/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({whatsapp:'+62'+whatsapp})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Nomor belum dapat disimpan. Coba lagi.');window.location.assign('/welcome');}catch(e){setError(e instanceof TypeError?'Koneksi terputus. Coba lagi.':(e as Error).message);setBusy(false);}}
 return <div className="auth-card"><span className="auth-eyebrow">PROFIL AKUN</span><h1>Lengkapi akunmu</h1><p className="auth-description">Tambahkan nomor WhatsApp untuk melengkapi profil TravelOS kamu.</p><form className="auth-form" onSubmit={submit}><WhatsAppFields value={whatsapp} onChange={setWhatsapp} disabled={busy}/>{error&&<p className="auth-message auth-error" role="alert">{error}</p>}<button className="button primary auth-submit" disabled={busy}>{busy?<><LoaderCircle size={16} className="spin"/>Menyimpan…</>:<>Simpan dan lanjutkan<ArrowRight size={16}/></>}</button></form><div className="auth-welcome-actions"><SignoutButton/></div></div>;
}
