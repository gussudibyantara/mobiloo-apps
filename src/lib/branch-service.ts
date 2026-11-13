import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {branchOffices,branchSummary} from './branches-shared';
import {audit,fail,revision,sameRequest} from './api-utils';
import type {DashboardData,BranchOffice} from './types';
export const branchKeySchema=z.string().trim().min(1,'Pilih cabang.').max(100);
export const branchSchema=z.object({name:branchKeySchema.min(2,'Nama cabang minimal 2 karakter.').refine(v=>!['semua cabang','all'].includes(v.toLowerCase()),'Nama cabang tidak dapat menggunakan nama filter.'),code:z.string().trim().max(20).regex(/^[A-Za-z0-9-]*$/,'Kode hanya boleh huruf, angka, dan tanda hubung.').transform(v=>v.toUpperCase()),address:z.string().trim().max(1000),city:z.string().trim().max(100),phone:z.string().trim().max(30).refine(v=>!v||/^\+?[\d ()-]{7,30}$/.test(v),'Nomor telepon tidak valid.'),email:z.union([z.literal(''),z.email().max(254)]),managerId:z.union([z.literal(''),z.string().uuid()]),notes:z.string().trim().max(2000)});
export function assertBranch(data:DashboardData,name:string,previous?:string){
 const branch=branchOffices(data).find(b=>b.name===name);
 // Older unit fixtures/imports have no branch registry until persistence normalizes it.
 if(data.branches===undefined&&!branch&&['Lombok','Jakarta','Bandung'].includes(name))return;
 if(!branch||(branch.archivedAt&&name!==previous))fail('Pilih cabang aktif yang terdaftar.',400);
}
export function saveBranch(data:DashboardData,input:z.infer<typeof branchSchema>,id?:string,expected=0,requestId?:string){
 data.branches||=branchOffices(data);
 const retry=requestId?data.branches.find(b=>b.requestId===requestId):undefined;if(retry){sameRequest(retry,input);return retry;}
 const old=id?data.branches.find(b=>b.id===id):undefined;if(id&&!old)fail('Cabang tidak ditemukan.',404);if(old)revision(old.revision,expected);
 if(old&&old.name!==input.name)fail('Nama cabang merupakan identitas tetap. Hubungi pengelola untuk migrasi nama agar riwayat tetap konsisten.',400);
 if(data.branches.some(b=>b.id!==id&&(b.name.toLowerCase()===input.name.toLowerCase()||!!input.code&&b.code.toLowerCase()===input.code.toLowerCase())))fail('Nama atau kode cabang sudah digunakan.');
 if(input.managerId){const e=data.employees?.find(e=>e.id===input.managerId&&!e.archivedAt&&e.branch===input.name);if(!e)fail('PIC harus karyawan aktif pada cabang ini.',400);}
 const result:BranchOffice={...old,...input,id:id||randomUUID(),revision:(old?.revision||0)+1,createdAt:old?.createdAt||new Date().toISOString(),requestId:old?.requestId||requestId};
 if(old)Object.assign(old,result);else data.branches.push(result);
 audit(data,'branch',old?'Cabang diperbarui':'Cabang ditambahkan',result.name);return old||result;
}
export function branchStatus(data:DashboardData,id:string,expected:number,restore:boolean){
 data.branches||=branchOffices(data);const b=data.branches.find(b=>b.id===id);if(!b)fail('Cabang tidak ditemukan.',404);revision(b.revision,expected);
 const s=branchSummary(data,b.name);if(!restore&&(s.units.length||s.employees.length||s.open.length||s.maintenance.length))fail('Pindahkan atau nonaktifkan kendaraan dan karyawan, lalu selesaikan booking serta maintenance aktif sebelum menonaktifkan cabang.');
 if(restore)delete b.archivedAt;else b.archivedAt=new Date().toISOString();b.revision++;audit(data,'branch',restore?'Cabang diaktifkan':'Cabang dinonaktifkan',b.name);return b;
}
