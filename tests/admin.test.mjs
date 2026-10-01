import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../netlify/functions/admin.mjs';
import { empty, mutate, dashboard, passwordHash, verifyPassword, hash, cookie } from '../netlify/functions/lib/admin-core.mjs';
import { publicIPv4, checkSite } from '../netlify/functions/lib/admin-monitor-core.mjs';
class MemoryStore {
 constructor(){this.entries=new Map();this.counter=0;}
 async get(key){return structuredClone(this.entries.get(key)?.data||null);}
 async getWithMetadata(key){return structuredClone(this.entries.get(key)||null);}
 async setJSON(key,data,options={}) {
  const existing=this.entries.get(key);
  if((options.onlyIfNew&&existing)||(options.onlyIfMatch&&existing?.etag!==options.onlyIfMatch)) return {modified:false};
  this.entries.set(key,{data:structuredClone(data),etag:String(++this.counter)}); return {modified:true};
 }
 async delete(key){this.entries.delete(key);}
}
const password='test-only-not-a-production-password-4392';
process.env.ADMIN_USERNAME='dionis';process.env.ADMIN_PASSWORD_HASH=passwordHash(password);
const request=(action,body,headers={})=>new Request(`https://example.test/api/admin?action=${action}`,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json',Origin:'https://example.test',...headers}:headers,body:body?JSON.stringify(body):undefined});
async function login(handler){const r=await handler(request('login',{username:'dionis',password}),{ip:'1.2.3.4'});assert.equal(r.status,200);const p=await r.json();return {cookie:r.headers.get('set-cookie').split(';')[0],'x-csrf-token':p.csrf};}

test('password hashing rejects wrong passwords and malformed hashes',()=>{
 assert.ok(verifyPassword(password,process.env.ADMIN_PASSWORD_HASH));assert.equal(verifyPassword('wrong',process.env.ADMIN_PASSWORD_HASH),false);assert.equal(verifyPassword(password,'malformed'),false);
});
test('all admin actions reject anonymous access, including direct function URL',async()=>{
 const h=createHandler(()=>new MemoryStore());
 for(const action of ['data','session','save','logout','monitor']) {
  assert.equal((await h(request(action,action==='data'||action==='session'?undefined:{id:'x'}))).status,401);
 }
 const r=await h(new Request('https://example.test/.netlify/functions/admin'));assert.equal(r.status,401);
});
test('authentication, cookie security, CSRF, persistence, logout and revocation',async()=>{
 const db=new MemoryStore();const h=createHandler(()=>db);const auth=await login(h);
 assert.match(cookie(request('data'),'x',100),/__Host-/);assert.match(cookie(request('data'),'x',100),/HttpOnly; SameSite=Strict/);assert.match(cookie(request('data'),'x',100),/Secure/);
 assert.equal((await h(request('save',{revision:0,collection:'clients',record:{name:'Test'}},{cookie:auth.cookie}))).status,403);
 assert.equal((await h(request('save',{revision:0,collection:'clients',record:{name:'Test'}},{...auth,Origin:'https://evil.test'}))).status,403);
 const save=await h(request('save',{revision:0,collection:'clients',record:{name:'Test'}},auth));assert.equal(save.status,200);
 // A new handler reads the same persistent store, independent of frontend state.
 const fresh=createHandler(()=>db);const data=await (await fresh(request('data',undefined,auth))).json();assert.equal(data.clients[0].name,'Test');assert.equal(data.revision,1);
 assert.equal((await h(request('save',{revision:0,collection:'clients',record:{name:'Old'}},auth))).status,409);
 assert.equal((await h(request('logout',{},auth))).status,200);assert.equal((await fresh(request('data',undefined,auth))).status,401);
});
test('expired and non-admin sessions are rejected',async()=>{
 const db=new MemoryStore();const h=createHandler(()=>db);const auth=await login(h);const raw=auth.cookie.split('=')[1];const key=`sessions/${hash(raw)}`;const s=await db.get(key);
 await db.setJSON(key,{...s,role:'user'});assert.equal((await h(request('data',undefined,auth))).status,401);
 await db.setJSON(key,{...s,expires:0});assert.equal((await h(request('data',undefined,auth))).status,401);
 await db.setJSON(key,{...s,credential:'old-password'});assert.equal((await h(request('data',undefined,auth))).status,401);
});
test('login rate limiting persists across handler instances',async()=>{
 const db=new MemoryStore();for(let i=0;i<10;i++) assert.equal((await createHandler(()=>db)(request('login',{username:'dionis',password:'wrong'}),{ip:'1.2.3.5'})).status,401);
 assert.equal((await createHandler(()=>db)(request('login',{username:'dionis',password}),{ip:'1.2.3.5'})).status,429);
});
test('CRUD relations, money, received dates, separate currencies and dashboard',()=>{
 const d=empty();mutate(d,{collection:'clients',record:{name:'Client'}},'dionis');const clientId=d.clients[0].id;
 mutate(d,{collection:'projects',record:{name:'Site',clientId,status:'in_lucru',value:'1000.50',currency:'EUR',deadline:'2026-10-20'}},'dionis');const projectId=d.projects[0].id;
 mutate(d,{collection:'payments',record:{projectId,kind:'avans',amount:200,status:'incasata',receivedDate:'2026-10-01'}},'dionis');
 mutate(d,{collection:'payments',record:{projectId,kind:'rest',amount:800.50,status:'planificata',dueDate:'2020-01-01'}},'dionis');
 assert.deepEqual(dashboard(d).currencies.EUR,{contracted:100050,received:20000,outstanding:80050,overdue:80050});assert.equal(dashboard(d).activeProjects,1);
 assert.throws(()=>mutate(d,{collection:'clients',id:clientId,remove:true},'dionis'));
 assert.throws(()=>mutate(d,{collection:'payments',record:{projectId,kind:'avans',amount:-3,status:'incasata',receivedDate:'2026-10-01'}},'dionis'));
 assert.throws(()=>mutate(d,{collection:'payments',record:{projectId,kind:'avans',amount:3,status:'incasata'}},'dionis'));
 assert.throws(()=>mutate(d,{collection:'projects',record:{name:'Bad',clientId:'missing',status:'nou',value:1,currency:'EUR'}},'dionis'));
 assert.throws(()=>mutate(d,{collection:'projects',record:{name:'Bad',clientId,status:'nou',value:1,currency:'EUR',deadline:'2026-02-30'}},'dionis'));
 mutate(d,{collection:'sites',record:{name:'Site',url:'https://example.com',active:true,clientId}},'dionis');
 mutate(d,{collection:'maintenance',record:{siteId:d.sites[0].id,title:'Actualizare',status:'planificata',cost:30,currency:'EUR'}},'dionis');
 assert.equal(d.maintenance[0].costCents,3000);
});
test('monitor blocks private/reserved IPs and protocols, never follows redirects',async()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','172.16.0.1','192.168.0.1','100.64.0.1','0.0.0.0','::1','::ffff:127.0.0.1']) assert.equal(publicIPv4(ip),false,ip);
 assert.equal(publicIPv4('93.184.216.34'),true);
 for(const url of ['http://example.com','https://127.0.0.1','https://localhost','https://user:pass@example.com']) assert.equal((await checkSite(url)).ok,false);
});

test('monitor pins public DNS address, preserves TLS verification and does not follow redirect',async()=>{
 const { createCheckSite }=await import('../netlify/functions/lib/admin-monitor-core.mjs');
 const { EventEmitter }=await import('node:events');
 let requests=0;
 const check=createCheckSite(async()=>[{address:'93.184.216.34',family:4}],(url,options,callback)=>{
  requests++;assert.equal(url.protocol,'https:');assert.equal(options.method,'HEAD');assert.notEqual(options.rejectUnauthorized,false);
  options.lookup('rebound.invalid',{},(error,address,family)=>{assert.equal(error,null);assert.equal(address,'93.184.216.34');assert.equal(family,4);});
  const req=new EventEmitter();req.end=()=>callback({statusCode:302,resume(){}});req.destroy=()=>{};return req;
 });
 const result=await check('https://example.com');assert.equal(result.ok,true);assert.equal(result.status,302);assert.equal(requests,1);
 const blocked=createCheckSite(async()=>[{address:'169.254.169.254',family:4}],()=>assert.fail('Private address was requested'));
 assert.equal((await blocked('https://attacker.invalid')).ok,false);
});
test('scheduled monitor persists checks and skips inactive sites',async()=>{
 const {createMonitorHandler}=await import('../netlify/functions/admin-monitor.mjs');
 const db=new MemoryStore();const d=empty();d.sites=[{id:'a',url:'https://example.com',active:true},{id:'b',url:'https://inactive.example',active:false}];await db.setJSON('workspace',d);
 const h=createMonitorHandler(()=>db,async()=>({at:'2026-10-01T12:00:00Z',status:200,ok:true,latencyMs:15}));
 assert.equal((await h()).status,204);const result=await db.get('workspace');assert.equal(result.sites[0].checks[0].status,200);assert.equal(result.sites[1].checks,undefined);assert.equal(result.revision,1);
});

test('invalid payloads and URLs are rejected with validation errors',async()=>{
 const h=createHandler(()=>new MemoryStore());
 assert.equal((await h(request('login',[]))).status,400);
 assert.equal((await h(new Request('https://example.test/api/admin?action=login',{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json'},body:'null'}))).status,400);
 assert.throws(()=>mutate(empty(),{collection:'sites',record:{name:'Broken',url:'not a url'}},'dionis'),error=>error.status===400);
});
