import type { BranchOffice, DashboardData } from './types';

/** Legacy records keep their branch key so issued documents remain unchanged. */
export function branchOffices(data:DashboardData):BranchOffice[]{
 if(data.branches)return data.branches;
 const names=[...new Set([...data.units.map(u=>u.branch),...(data.employees||[]).map(e=>e.branch),...(data.expenses||[]).map(e=>e.branch),...(data.invoices||[]).map(i=>i.source.branch),...(data.settlements||[]).flatMap(s=>[...s.rows.map(r=>r.branch),...s.payments.map(p=>p.branch)])].filter(Boolean))];
 return names.map(name=>({id:`legacy-${name}`,name,code:'',address:'',city:name,phone:'',email:'',managerId:'',notes:'',revision:0,createdAt:''}));
}
export function branchNames(data:DashboardData,activeOnly=false,current=''){
 return branchOffices(data).filter(b=>!activeOnly||!b.archivedAt||b.name===current).map(b=>b.name);
}
export function branchSummary(data:DashboardData,name:string){
 const units=data.units.filter(u=>u.branch===name&&!u.archivedAt),ids=new Set(data.units.filter(u=>u.branch===name).map(u=>u.id));
 const bookings=data.bookings.filter(b=>ids.has(b.unitId));
 return {units,employees:(data.employees||[]).filter(e=>e.branch===name&&!e.archivedAt),bookings,open:bookings.filter(b=>b.status==='confirmed'||b.status==='running'),maintenance:(data.maintenance||[]).filter(m=>ids.has(m.unitId)&&(m.status==='scheduled'||m.status==='in_progress'))};
}
