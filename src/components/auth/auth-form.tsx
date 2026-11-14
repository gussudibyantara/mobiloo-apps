'use client';
import Link from 'next/link';
import WhatsAppFields from './whatsapp-fields';
import { normalizeWhatsApp } from '@/lib/auth/contact';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, Mail, CheckCircle2, LockKeyhole, Info } from 'lucide-react';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const copy = {
  login: { title: 'Selamat datang kembali', description: 'Masuk untuk melanjutkan pengelolaan rentalmu.', button: 'Masuk' },
  signup: { title: 'Mulai dengan akunmu', description: 'Buat akun untuk mulai mengelola bisnis rental.', button: 'Buat akun' },
  forgot: { title: 'Lupa kata sandi?', description: 'Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.', button: 'Kirim tautan pemulihan' },
  reset: { title: 'Buat kata sandi baru', description: 'Gunakan kata sandi yang kuat dan berbeda dari sebelumnya.', button: 'Simpan kata sandi' }
};

export default function AuthForm({
  mode,
  configured,
  sessionValid = false,
  initialError = '',
  notice = ''
}: {
  mode: AuthMode;
  configured: boolean;
  sessionValid?: boolean;
  initialError?: string;
  notice?: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState<'form' | 'google' | null>(null);
  const [whatsapp, setWhatsapp] = useState('');

  const info = copy[mode];
  const google = mode === 'login' || mode === 'signup';
  const hasPassword = mode !== 'forgot';
  const newPassword = mode === 'signup' || mode === 'reset';
  const disabled = !configured || busy !== null || (mode === 'reset' && !sessionValid);

  async function send(action: string, body: object) {
    // Memastikan aksi 'login' atau 'signup' langsung menembak ke rute /api/auth/[action]
    const response = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.message || 'Permintaan belum berhasil. Coba lagi.');
    return result as { redirect?: string; url?: string; message?: string };
  }

  async function oauth() {
    if (disabled) return;
    setBusy('google');
    setError('');
    try {
      const result = await send('google', {});
      if (!result.url) throw new Error('Google belum dapat dibuka. Coba lagi.');
      window.location.assign(result.url);
    } catch (e) {
      setError(e instanceof TypeError ? 'Koneksi terputus. Periksa koneksi lalu coba lagi.' : (e as Error).message);
      setBusy(null);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
    setError('');

    if (mode === 'signup' && !normalizeWhatsApp('+62' + whatsapp)) {
      setError('Masukkan nomor WhatsApp mulai dari 8, tanpa angka 0 atau kode negara.');
      return;
    }
    if (newPassword && password !== confirm) {
      setError('Konfirmasi kata sandi belum sesuai.');
      return;
    }

    setBusy('form');
    try {
      const actionName = mode === 'reset' ? 'update-password' : mode;
      const result = await send(actionName, {
        ...(mode !== 'reset' ? { email: email.trim() } : {}),
        ...(hasPassword ? { password } : {}),
        ...(mode === 'signup' ? { name: name.trim(), whatsapp: '+62' + whatsapp } : {})
      });

      if (result.redirect) {
        window.location.assign(result.redirect);
        return;
      }

      // Paksa arahkan ke /dashboard jika mode login sukses dan backend belum mengirim redirect
      if (mode === 'login') {
        window.location.assign('/dashboard');
        return;
      }

      setSuccess(result.message || 'Permintaan berhasil diproses.');
    } catch (e: any) {
      setError(e instanceof TypeError ? 'Koneksi terputus. Periksa koneksi lalu coba lagi.' : (e.message || 'Terjadi kesalahan pada server.'));
    } finally {
      setBusy(null);
    }
  }

  if (success) return (
    <div className="auth-card">
      <span className="auth-state-icon"><Mail size={25} /></span>
      <span className="auth-eyebrow">PERIKSA EMAILMU</span>
      <h1>{mode === 'forgot' ? 'Tautan pemulihan diminta' : 'Satu langkah lagi'}</h1>
      <p className="auth-description" role="status">{success}</p>
      <p className="auth-description">Buka tautan menggunakan browser yang sama. Jika belum terlihat, periksa folder spam.</p>
      <Link className="button primary auth-submit" href="/login">Kembali ke halaman masuk<ArrowRight size={16} /></Link>
      <button className="auth-text-button" type="button" onClick={() => { setSuccess(''); setError(''); }}>Gunakan email lain</button>
    </div>
  );

  return (
    <div className="auth-card">
      <span className="auth-eyebrow">{mode === 'signup' ? 'BUAT AKUN' : mode === 'login' ? 'MASUK KE WORKSPACE' : 'PEMULIHAN AKUN'}</span>
      <h1>{info.title}</h1>
      <p className="auth-description">{info.description}</p>
      
      {notice === 'password-updated' && <p className="auth-message auth-success" role="status"><CheckCircle2 size={17} />Kata sandi diperbarui. Silakan masuk kembali.</p>}
      {!configured && <p className="auth-message" role="status"><Info size={17} />Layanan akun belum tersedia saat ini. Silakan coba lagi nanti.</p>}
      {mode === 'reset' && configured && !sessionValid && <p className="auth-message" role="alert"><LockKeyhole size={17} />Buka tautan pemulihan dari email untuk melanjutkan. <Link href="/forgot-password">Minta tautan baru</Link></p>}
      
      {google && (
        <>
          <button className="auth-google" type="button" disabled={disabled} onClick={oauth}>
            {busy === 'google' ? <LoaderCircle size={18} className="spin" /> : <span className="auth-google-mark" aria-hidden="true">G</span>}
            {mode === 'signup' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
          </button>
          <div className="auth-divider"><span>atau gunakan email</span></div>
        </>
      )}

      <form className="auth-form" onSubmit={submit} aria-busy={busy === 'form'}>
        {mode === 'signup' && (
          <div className="auth-field">
            <label htmlFor="auth-name">Nama lengkap</label>
            <input id="auth-name" name="name" autoComplete="name" required minLength={2} maxLength={150} value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkapmu" disabled={busy !== null} />
          </div>
        )}

        {mode !== 'reset' && (
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@bisnismu.com" disabled={busy !== null} />
          </div>
        )}

        {mode === 'signup' && <WhatsAppFields value={whatsapp} onChange={setWhatsapp} disabled={busy !== null} />}

        {hasPassword && (
          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="auth-password">{mode === 'reset' ? 'Kata sandi baru' : 'Kata sandi'}</label>
              {mode === 'login' && <Link href="/forgot-password">Lupa kata sandi?</Link>}
            </div>
            <div className="auth-password">
              <input id="auth-password" name="password" type={visible ? 'text' : 'password'} autoComplete={newPassword ? 'new-password' : 'current-password'} required minLength={newPassword ? 8 : 1} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} placeholder={newPassword ? 'Minimal 8 karakter' : 'Masukkan kata sandi'} aria-describedby={newPassword ? 'auth-password-hint' : undefined} disabled={busy !== null} />
              <button type="button" aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={visible} onClick={() => setVisible(v => !v)}>
                {visible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {newPassword && <p className="auth-field-hint" id="auth-password-hint">Minimal 8 karakter. Gunakan kombinasi huruf, angka, dan simbol.</p>}
          </div>
        )}

        {newPassword && (
          <div className="auth-field">
            <label htmlFor="auth-confirm">Konfirmasi kata sandi</label>
            <input id="auth-confirm" name="password_confirmation" type={visible ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ulangi kata sandi" disabled={busy !== null} />
          </div>
        )}

        {error && <p className="auth-message auth-error" role="alert">{error}</p>}
        
        <button className="button primary auth-submit" disabled={disabled} type="submit">
          {busy === 'form' ? <><LoaderCircle size={17} className="spin" />Memproses…</> : <>{info.button}<ArrowRight size={16} /></>}
        </button>
      </form>

      {mode === 'forgot' ? (
        <>
          <p className="auth-field-hint auth-google-help">Jika biasanya masuk dengan Google, gunakan tombol Google di halaman masuk. Kata sandi Google dikelola melalui akun Google.</p>
          <Link className="auth-back" href="/login"><ArrowLeft size={15} />Kembali ke halaman masuk</Link>
        </>
      ) : mode === 'reset' ? (
        <Link className="auth-back" href="/forgot-password"><ArrowLeft size={15} />Minta tautan baru</Link>
      ) : (
        <p className="auth-bottom">{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'} <Link href={mode === 'login' ? '/signup' : '/login'}>{mode === 'login' ? 'Daftar sekarang' : 'Masuk'}</Link></p>
      )}
    </div>
  );
}