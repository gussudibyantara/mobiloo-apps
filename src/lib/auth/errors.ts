export function authError(error:{code?:string;status?:number}|unknown){
 const e=error as {code?:string;status?:number};
 if(e?.status===429||e?.code?.includes('rate_limit'))return 'Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.';
 if(e?.code==='invalid_credentials')return 'Email atau kata sandi tidak sesuai.';
 if(e?.code==='email_not_confirmed')return 'Verifikasi email terlebih dahulu, lalu coba masuk lagi.';
 if(e?.code==='weak_password')return 'Gunakan kata sandi yang lebih kuat, minimal 8 karakter.';
 if(e?.code==='same_password')return 'Gunakan kata sandi yang berbeda dari sebelumnya.';
 if(e?.code==='otp_expired'||e?.code==='flow_state_expired'||e?.code==='flow_state_not_found')return 'Tautan sudah tidak berlaku. Minta tautan baru dan buka dari browser yang sama.';
 if(e?.code==='provider_disabled')return 'Masuk dengan Google belum tersedia. Gunakan email atau coba lagi nanti.';
 return 'Permintaan belum berhasil. Periksa koneksi lalu coba lagi.';
}
