import { Pool } from 'pg';

// Mencegah error instance ganda saat proses hot-reload di development
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// Membuat pool koneksi menggunakan DATABASE_URL
// Mengatur ssl secara aman agar tidak memaksa SSL jika database lokal tidak mendukungnya
export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Jika ingin mendeteksi SSL via environment variable terpisah (misal DB_SSL=true)
    // Atau dimatikan total untuk koneksi internal Docker/VPS lokal
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
};