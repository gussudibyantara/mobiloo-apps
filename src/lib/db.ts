import { Pool } from 'pg';

// Mencegah error instance ganda saat proses hot-reload di development
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// Membuat pool koneksi menggunakan DATABASE_URL
export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
};