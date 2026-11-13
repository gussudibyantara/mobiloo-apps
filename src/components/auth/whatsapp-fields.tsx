'use client';
function nationalNumber(value:string){
 let number=value.replace(/[^\d+]/g,'');
 if(number.startsWith('+62'))number=number.slice(3);
 else if(number.startsWith('62'))number=number.slice(2);
 else if(number.startsWith('0'))number=number.slice(1);
 return number.replace(/\D/g,'').slice(0,13);
}
export default function WhatsAppFields({value,onChange,disabled=false}:{value:string;onChange:(value:string)=>void;disabled?:boolean}){
 return <div className="auth-field"><label htmlFor="auth-whatsapp">Nomor WhatsApp</label><div className="auth-whatsapp"><span id="auth-whatsapp-prefix">+62</span><input id="auth-whatsapp" name="whatsapp" type="tel" inputMode="numeric" autoComplete="tel-national" required maxLength={30} pattern="8[0-9]{7,12}" title="Masukkan nomor mulai dari 8, tanpa angka 0 atau kode negara." value={value} onChange={e=>onChange(nationalNumber(e.target.value))} placeholder="887 1234 5678" aria-describedby="auth-whatsapp-prefix auth-whatsapp-hint" disabled={disabled}/></div><p className="auth-field-hint" id="auth-whatsapp-hint">Gunakan nomor WhatsApp aktif, mulai dari 8 tanpa angka 0 di depan.</p></div>;
}
