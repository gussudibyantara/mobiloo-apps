import { readDashboard } from '@/lib/store';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET() { try {return Response.json(await readDashboard(),{headers:{'Cache-Control':'no-store'}});}catch {return Response.json({error:'Data dashboard tidak dapat dibaca. Coba lagi atau periksa penyimpanan lokal.'},{status:500});} }
