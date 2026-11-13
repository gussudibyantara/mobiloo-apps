import {z} from 'zod';
import {originAllowed} from '@/lib/request';
import {mutate} from '@/lib/store';
import {branchSchema,saveBranch,branchStatus} from '@/lib/branch-service';
import {apiError} from '@/lib/api-utils';
export const runtime='nodejs';
const schema=z.discriminatedUnion('action',[z.object({action:z.literal('update'),revision:z.number().int().min(0),input:branchSchema}),z.object({action:z.enum(['archive','restore']),revision:z.number().int().min(0)})]);
export async function PATCH(request:Request,ctx:{params:Promise<{id:string}>}){if(!originAllowed(request))return Response.json({error:'Permintaan tidak diizinkan.'},{status:403});try{const {id}=await ctx.params,b=schema.parse(await request.json());const branch=await mutate(d=>b.action==='update'?saveBranch(d,b.input,id,b.revision):branchStatus(d,id,b.revision,b.action==='restore'));return Response.json({branch});}catch(e){return apiError(e);}}
