import { beforeEach, describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/auth/[action]/route';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NODE_ENV', 'production');
});

const call = (action: string, input: object = {}, origin = 'http://localhost:3002') =>
  POST(
    new Request(`http://localhost:3002/api/auth/${action}`, {
      method: 'POST',
      headers: { host: 'localhost:3002', origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
    { params: Promise.resolve({ action }) }
  );

describe('Local Auth API & Security Tests', () => {
  it('rejects cross-origin auth requests', async () => {
    const res = await call('login', {}, 'https://evil.invalid');
    expect(res.status).toBe(403);
  });

  it('rejects invalid action routes', async () => {
    const res = await call('unknown-action', {});
    expect(res.status).toBe(404);
  });

  it('validates required fields on signup', async () => {
    const res = await call('signup', { name: 'A', email: 'invalid-email', password: '123' });
    expect(res.status).toBe(400);
  });
});