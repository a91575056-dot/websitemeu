import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { fail, hash } from './admin-core.mjs';
export const leadsStore=context=>getStore({name:context?.deploy&&!context.deploy.published?`leads-preview-${context.deploy.id}`:'dionis-leads-v1',consistency:'strong'});
const clean=(v,n=160)=>typeof v==='string'?v.trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,n):'';
export const statuses=['noua','contactat','oferta_trimisa','castigata','pierduta'];
export async function readLeads(db){return await db.getWithMetadata('inbox',{type:'json'})||{data:{revision:0,leads:[]},etag:null};}
export async function submitLead(db,body,ip){
 if(body.website)return {ok:true};
 const name=clean(body.name),email=clean(body.email),details=clean(body.details,2000);
 if(body.consent!==true||name.length<2||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||details.length<10||!Number.isFinite(body.startedAt)||Date.now()-body.startedAt<2000)fail('Completează numele, emailul și detaliile și acceptă prelucrarea cererii.');
 if(!/^[a-f0-9-]{36}$/.test(body.id||''))fail('Identificator invalid.');
 const limitKey=`limits/${hash(ip||'unknown')}/${Math.floor(Date.now()/3600000)}`;
 const counter=await db.getWithMetadata(limitKey,{type:'json'});if((counter?.data.count||0)>=5)fail('Prea multe cereri. Reîncearcă mai târziu.',429);
 if(!(await db.setJSON(limitKey,{count:(counter?.data.count||0)+1},counter?{onlyIfMatch:counter.etag}:{onlyIfNew:true})).modified)fail('Reîncearcă trimiterea.',429);
 for(let attempt=0;attempt<8;attempt++){
  const {data,etag}=await readLeads(db);if(data.leads.some(x=>x.submissionId===body.id))return {ok:true};if(data.leads.length>=5000)fail('Formular indisponibil. Contactează-ne direct.',503);
  const at=new Date().toISOString();data.leads.unshift({id:randomUUID(),submissionId:body.id,name,email,phone:clean(body.phone,60),business:clean(body.business),projectType:clean(body.projectType),timeline:clean(body.timeline),details,status:'noua',notes:'',clientId:'',createdAt:at,updatedAt:at,consentAt:at});data.revision++;
  if((await db.setJSON('inbox',data,etag?{onlyIfMatch:etag}:{onlyIfNew:true})).modified)return {ok:true};
 }fail('Formular ocupat. Reîncearcă.',503);
}
export async function saveLead(db,body,username,clients=[]){
 const {data,etag}=await readLeads(db);if(body.revision!==data.revision)fail('Cererile au fost modificate. Actualizează lista.',409);
 const lead=data.leads.find(x=>x.id===body.id);if(!lead)fail('Cerere inexistentă.',404);
 if(body.remove)data.leads=data.leads.filter(x=>x.id!==body.id);
 else {if(!statuses.includes(body.status))fail('Status invalid.');if(body.clientId&&!clients.some(x=>x.id===body.clientId))fail('Client inexistent.');Object.assign(lead,{status:body.status,notes:clean(body.notes,2000),clientId:body.clientId||'',updatedAt:new Date().toISOString(),updatedBy:username});}
 data.revision++;if(!(await db.setJSON('inbox',data,etag?{onlyIfMatch:etag}:{onlyIfNew:true})).modified)fail('Conflict de salvare. Actualizează lista.',409);return data;
}
