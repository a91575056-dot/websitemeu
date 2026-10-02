import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { submitLead, saveLead, readLeads } from '../netlify/functions/lib/leads-core.mjs';
import { createLeadsHandler } from '../netlify/functions/leads.mjs';
import { recordEvent, analyticsReport } from '../netlify/functions/lib/analytics-core.mjs';
import { createHandler } from '../netlify/functions/admin.mjs';
import { passwordHash } from '../netlify/functions/lib/admin-core.mjs';
class DB {entries=new Map();counter=0;async get(k){return structuredClone(this.entries.get(k)?.data||null);}async getWithMetadata(k){return structuredClone(this.entries.get(k)||null);}async setJSON(k,data,o={}){const p=this.entries.get(k);if(o.onlyIfNew&&p||o.onlyIfMatch&&o.onlyIfMatch!==p?.etag)return {modified:false};this.entries.set(k,{data:structuredClone(data),etag:String(++this.counter)});return {modified:true};}async list({prefix='' }={}){return {blobs:[...this.entries.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))};}async delete(k){this.entries.delete(k);}}
process.env.ADMIN_USERNAME='unit';process.env.ADMIN_PASSWORD_HASH=passwordHash('unit-test-password');
const req=(action,body,headers={})=>new Request('https://example.test/api/admin?action='+action,{method:body?'POST':'GET',headers:{Origin:'https://example.test','Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined});
const lead=()=>({id:randomUUID(),name:'Test Client',email:'test@example.invalid',details:'A small website for my business.',consent:true,startedAt:Date.now()-5000});
test('lead validation, origin, public privacy, persistent rate limit and idempotency',async()=>{
 const db=new DB(),h=createLeadsHandler(()=>db),body=lead();
 assert.equal((await h(req('leads'))).status,405);
 assert.equal((await h(req('leads',body,{Origin:'https://other.test'}))).status,403);
 assert.equal((await h(req('leads',{...body,consent:false}))).status,400);
 assert.deepEqual(await (await h(req('leads',body),{ip:'test'})).json(),{ok:true});
 await submitLead(db,body,'test');assert.equal((await readLeads(db)).data.leads.length,1);
 for(let i=0;i<3;i++)await submitLead(db,lead(),'test');
 await assert.rejects(()=>submitLead(db,lead(),'test'),e=>e.status===429);
});
test('admin-only inbox, CSRF, statuses, client linkage, conflict and deletion',async()=>{
 const db=new DB(),inbox=new DB(),h=createHandler(()=>db,()=>new DB(),()=>new DB(),()=>inbox);await submitLead(inbox,lead(),'one');
 assert.equal((await h(req('leads'))).status,401);
 const login=await h(req('login',{username:'unit',password:'unit-test-password'}),{ip:'login'});const session=await login.json();const auth={cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':session.csrf};
 const data=await (await h(req('leads',undefined,auth))).json();const change={revision:data.revision,id:data.leads[0].id,status:'contactat',notes:'Call tomorrow'};
 assert.equal((await h(req('lead-save',change,{cookie:auth.cookie}))).status,403);
 assert.equal((await h(req('lead-save',{...change,clientId:'missing'},auth))).status,400);
 assert.equal((await h(req('lead-save',change,auth))).status,200);
 assert.equal((await h(req('lead-save',change,auth))).status,409);
 const fresh=(await readLeads(inbox)).data;assert.equal(fresh.leads[0].notes,'Call tomorrow');
 await saveLead(inbox,{revision:fresh.revision,id:change.id,remove:true},'unit');assert.equal((await readLeads(inbox)).data.leads.length,0);
});
test('previous-period arithmetic, incomplete baseline, bounded campaigns and page events',async()=>{
 const db=new DB(),request=req('analytics',{}, {'User-Agent':'Mozilla'}),body={path:'/',event:'pageview',id:randomUUID(),utmSource:'facebook',utmMedium:'social',utmCampaign:'autumn'};
 await recordEvent(db,body,request,{ip:'203.0.113.2'});await recordEvent(db,{...body,id:randomUUID(),event:'quote_start'},request,{ip:'203.0.113.2'});
 let r=await analyticsReport(db,7);assert.equal(r.campaigns['facebook / social / autumn'],1);assert.equal(r.pageEvents['/'].quote_start,1);assert.equal(r.previous.complete,false);
 const oldDay=new Date(Date.now()-8*86400000).toISOString().slice(0,10);await db.setJSON(`days/${oldDay}/0.json`,{day:oldDay,pageviews:4,visitors:{},events:{contact_click:2}});await db.setJSON('installed',{at:new Date(Date.now()-30*86400000).toISOString()});
 r=await analyticsReport(db,7);assert.equal(r.previous.pageviews,4);assert.equal(r.previous.events.contact_click,2);assert.equal(r.previous.complete,true);assert.equal((await analyticsReport(db,90)).previous.complete,false);
 await recordEvent(db,{...body,id:randomUUID(),utmSource:'constructor',utmMedium:'',utmCampaign:''},request,{ip:'203.0.113.2'});assert.equal(Object.hasOwn((await analyticsReport(db,7)).campaigns,'constructor'),false);
 await recordEvent(db,{...body,id:randomUUID(),utmCampaign:'private@example.com'},request,{ip:'203.0.113.2'});assert.doesNotMatch(JSON.stringify((await analyticsReport(db,7)).campaigns),/@example/);
});
