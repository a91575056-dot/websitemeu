import { getStore } from '@netlify/blobs';
import { randomUUID, createHmac } from 'node:crypto';
import { fail } from './admin-core.mjs';
import seeds from './review-seeds.json' with { type: 'json' };
export const reviewStore = context => getStore({name: context?.deploy && !context.deploy.published ? `reviews-preview-${context.deploy.id}` : 'dionis-feedback', consistency:'strong'});
export const publicReview = r => ({id:r.id,name:r.name,project:r.project||'',message:r.message,rating:r.rating,website:r.website||'',createdAt:r.createdAt||'',source:r.source||''});
export function validateReview(body) {
 if(!body || typeof body!=='object' || Array.isArray(body)) fail('Date invalide.');
 const text=(key,max,min=0)=>{const value=body[key]; if(value!==undefined && typeof value!=='string')fail('Text invalid.');const s=(value||'').replace(/\s+/g,' ').trim();if(s.length<min||s.length>max)fail(`Câmp invalid: ${key}.`);return s;};
 const name=text('name',80,2),project=text('project',100),message=text('message',900,12);
 const rating=Number(body.rating);if(!Number.isInteger(rating)||rating<1||rating>5)fail('Alege între 1 și 5 stele.');
 const website=text('clientWebsite',180);if(website){let u;try{u=new URL(website);}catch{fail('URL invalid.');}if(!['https:','http:'].includes(u.protocol)||u.username||u.password)fail('URL invalid.');}
 return {name,project,message,rating,website};
}
export async function initializeReviews(db) {
 if(await db.get('migration/static-v1'))return;
 for(const r of seeds)await db.setJSON(`entries/seed-${r.id}.json`,r,{onlyIfNew:true});
 await db.setJSON('migration/static-v1',{at:new Date().toISOString()},{onlyIfNew:true});
}
export async function listReviews(db,privateView=false) {
 await initializeReviews(db);
 const {blobs}=await db.list({prefix:'entries/'});
 const items=await Promise.all(blobs.map(async({key})=>{const item=await db.getWithMetadata(key,{type:'json'});if(!item?.data)return null;return {...item.data,key,etag:item.etag,status:item.data.status||'pending',published:item.data.status==='approved'&&item.data.published===true};}));
 return items.filter(r=>r&&!r.deleted&&(privateView||r.published)).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).map(r=>privateView?r:publicReview(r));
}
export async function saveReview(db,body,username) {
 if(typeof body.key!=='string'||!/^entries\/[a-zA-Z0-9_.-]+$/.test(body.key))fail('Review invalid.');
 const current=await db.getWithMetadata(body.key,{type:'json'});if(!current||current.data.deleted)fail('Review inexistent.',404);
 if(body.etag!==current.etag)fail('Review modificat. Reîncarcă datele.',409);
 let next;
 if(body.remove)next={id:current.data.id,deleted:true,updatedAt:new Date().toISOString(),updatedBy:username};
 else {
 const r=validateReview(body.record);const status=body.record.status;
 if(!['pending','approved','rejected'].includes(status))fail('Status invalid.');
 if(body.record.published!==false&&body.record.published!==true)fail('Publicare invalidă.');
 if(body.record.published&&status!=='approved')fail('Aprobă review-ul înainte de publicare.');
 next={...current.data,...r,status,published:body.record.published,updatedAt:new Date().toISOString(),updatedBy:username};
 }
 const saved=await db.setJSON(body.key,next,{onlyIfMatch:current.etag});if(!saved.modified)fail('Review modificat. Reîncarcă datele.',409);
 return {ok:true};
}
export async function limitSubmissions(db,ip) {
 if(!process.env.ADMIN_PASSWORD_HASH)fail('Protecția formularului nu este configurată.',503);
 const hour=Math.floor(Date.now()/3600000);
 const identity=createHmac('sha256',process.env.ADMIN_PASSWORD_HASH).update(`${hour}|${ip||'unknown'}`).digest('hex');
 const key=`limits/${hour}-${identity}`;
 const item=await db.getWithMetadata(key,{type:'json'});const count=(item?.data?.count||0)+1;
 if(count>5)fail('Prea multe review-uri. Reîncearcă peste o oră.',429);
 const r=await db.setJSON(key,{count},item?{onlyIfMatch:item.etag}:{onlyIfNew:true});if(!r.modified)fail('Reîncearcă mai târziu.',429);
}
export async function submitReview(db,body,ip) {
 if(body.website)return {ok:true};
 const r=validateReview(body);if(body.approvedForPublic!==true)fail('Confirmă acordul pentru publicare.');
 if(!Number.isFinite(body.startedAt)||Date.now()-body.startedAt<2500||Date.now()-body.startedAt>86400000)fail('Completează formularul și reîncearcă.');
 await limitSubmissions(db,ip);
 const id=randomUUID(),createdAt=new Date().toISOString();
 await db.setJSON(`entries/${createdAt.replaceAll(':','-')}-${id}.json`,{...r,id,createdAt,status:'pending',published:false,consentAt:createdAt,source:'client-form'},{onlyIfNew:true});
 return {ok:true,message:'Review primit. Va fi afișat numai după aprobare.'};
}

export async function cleanupReviewLimits(db){const {blobs}=await db.list({prefix:'limits/'});const hour=Math.floor(Date.now()/3600000);for(const b of blobs)if(Number(b.key.split('/')[1].split('-')[0])<hour-24)await db.delete(b.key);}
