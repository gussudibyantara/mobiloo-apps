import { z } from 'zod';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { originAllowed } from '@/lib/request';

export const runtime = 'nodejs';

// Fungsi helper sederhana untuk hashing password dengan scrypt bawaan Node.js
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });
}

const emailSchema = z.string().email().max(254);
const passwordSchema = z.string().min(8, 'Kata sandi minimal 8 karakter.').max(128);

const schemas = {
  login: z.object({ email: emailSchema, password: z.string().min(1).max(128) }),
  signup: z.object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(150),
    email: emailSchema,
    password: passwordSchema,
    whatsapp: z.string().min(5, 'Nomor WhatsApp tidak valid.').max(30).optional().or(z.literal('')),
  }),
};

async function handlePost(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if (!request.headers.get('origin') || !originAllowed(request)) {
    return NextResponse.json({ error: 'Permintaan tidak diizinkan.' }, { status: 403 });
  }
  
  const { action } = await params;
  
  // Izinkan 'signin' selain 'login', 'signup', dan 'signout'
  if (!['login', 'signin', 'signup', 'signout'].includes(action)) {
    return NextResponse.json({ error: 'Halaman tidak ditemukan.' }, { status: 404 });
  }

  try {
    const cookieStore = await cookies();

    if (action === 'signout') {
      cookieStore.delete('auth_session');
      return NextResponse.json({ redirect: '/login' });
    }

    const body = await request.json();

    if (action === 'signup') {
      const parsed = schemas.signup.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Periksa isian form.' }, { status: 400 });
      }
      const { name, email, password, whatsapp } = parsed.data;

      // Cek apakah email sudah terdaftar
      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Email sudah terdaftar. Silakan masuk.' }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);
      const insertResult = await query(
        'INSERT INTO users (email, password_hash, name, whatsapp) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, whatsapp',
        [email, passwordHash, name, whatsapp || null]
      );
      const user = insertResult.rows[0];

      // Set cookie session lokal
      cookieStore.set('auth_session', JSON.stringify({ userId: user.id, email: user.email, role: user.role }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 minggu
      });

      return NextResponse.json({ redirect: '/welcome' });
    }

    if (action === 'login' || action === 'signin') {
      const parsed = schemas.login.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Periksa isian form.' }, { status: 400 });
      }
      const { email, password } = parsed.data;

      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user || !(await verifyPassword(password, user.password_hash))) {
        return NextResponse.json({ error: 'Email atau kata sandi salah.' }, { status: 400 });
      }

      // Set cookie session lokal
      cookieStore.set('auth_session', JSON.stringify({ userId: user.id, email: user.email, role: user.role }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ redirect: '/dashboard' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server. Coba beberapa saat lagi.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const response = await handlePost(request, context);
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  return response;
}