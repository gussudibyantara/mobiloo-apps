import {branchOffices} from './branches-shared';
import { assertWorkspaceAccess } from './auth/server';
import { syncFleetReminders } from './fleet-reminders';
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { makeEmptyData } from './empty-data';
import type { DashboardData } from './types';
const shared=globalThis as typeof globalThis & { travelosWriteQueue?: Promise<unknown> };
export function filePath() { return process.env.TRAVELOS_DATA_FILE || path.join(process.cwd(),'.local-data','dashboard.json'); }
async function read():Promise<DashboardData> {
 try {const data=JSON.parse(await readFile(filePath(),'utf8')) as DashboardData;if(data.version!==1||!Array.isArray(data.bookings))throw new Error('Format data lokal tidak didukung.');data.employees ||= [];data.partners ||= [];data.partnerAgreements ||= [];data.settlements ||= [];data.invoices ||= [];data.expenses ||= [];data.assets ||= [];data.maintenance ||= [];data.inspections ||= [];data.branches ||= branchOffices(data);syncFleetReminders(data);return data;}
 catch(error) {if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;const data=makeEmptyData();await persist(data);data.employees ||= [];data.partners ||= [];data.partnerAgreements ||= [];data.settlements ||= [];data.invoices ||= [];data.expenses ||= [];data.assets ||= [];data.maintenance ||= [];data.inspections ||= [];data.branches ||= branchOffices(data);syncFleetReminders(data);return data;}
}
async function persist(data:DashboardData) { const file=filePath();await mkdir(path.dirname(file),{recursive:true});const tmp=`${file}.${randomUUID()}.tmp`;await writeFile(tmp,JSON.stringify(data,null,2),'utf8');await rename(tmp,file); }
export async function mutate<T>(fn:(data:DashboardData)=>T|Promise<T>):Promise<T> {
 await assertWorkspaceAccess();const previous=shared.travelosWriteQueue||Promise.resolve();
 const result=previous.then(async()=>{const data=await read();const output=await fn(data);await persist(data);return output;});
 shared.travelosWriteQueue=result.catch(()=>{});return result;
}
export async function readDashboard():Promise<DashboardData> { await assertWorkspaceAccess();const result=(shared.travelosWriteQueue||Promise.resolve()).then(read);shared.travelosWriteQueue=result.catch(()=>{});return result; }
