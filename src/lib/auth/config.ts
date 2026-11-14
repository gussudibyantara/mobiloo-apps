import { query } from '@/lib/db';

// Fungsi untuk mencari user berdasarkan email di database PostgreSQL
export async function getUserByEmail(email: string) {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Fungsi untuk membuat user baru di database PostgreSQL
export async function createUser(email: string, passwordHash: string, name: string) {
  const result = await query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role',
    [email, passwordHash, name]
  );
  return result.rows[0];
}