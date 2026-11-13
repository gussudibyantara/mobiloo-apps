import {z} from 'zod';
import {originAllowed} from '@/lib/request';
import {mutate,readDashboard} from '@/lib/store';
import {branchSchema,saveBranch} from '@/lib/branch-service';
import {branchOffices} from '@/lib/branches-shared';
import {apiError} from '@/lib/api-utils';
export const runtime='nodejs';
export async function GET(){try{return Response.json({branches:branchOffices(await readDashboard())},{headers:{'Cache-Control':'no-store'}});}catch(e){return apiError(e);}}
export async function POST(request:Request){if(!originAllowed(request))return Response.json({error:'Permintaan tidak diizinkan.'},{status:403});try{const b=z.object({requestId:z.string().uuid(),input:branchSchema}).parse(await request.json());const branch=await mutate(d=>saveBranch(d,b.input,undefined,0,b.requestId));return Response.json({branch},{status:201});}catch(e){return apiError(e);}}
