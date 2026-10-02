import { leadsStore, readLeads, saveLead } from './lib/leads-core.mjs';
import { reviewStore, listReviews, saveReview, createInvitation, listInvitations, revokeInvitation } from './lib/reviews-core.mjs';
import { analyticsStore, analyticsReport } from './lib/analytics-core.mjs';
import { store, hash, fail, verifyPassword, token, cookie, sessionToken, sameOrigin, authenticate, authorizeMutation, readWorkspace, writeWorkspace, mutate, dashboard } from './lib/admin-core.mjs';
import { checkSite } from './lib/admin-monitor-core.mjs';

const respond=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export function createHandler(getDb=store, getReviews=reviewStore, getAnalytics=analyticsStore, getLeads=leadsStore) {
 return async (request, context) => {
  try {
    const url=new URL(request.url);
    const action=url.searchParams.get('action')||'data';
    if(!['GET','POST'].includes(request.method)) return respond({message:'Metodă nepermisă.'},405,{Allow:'GET, POST'});
    const db=getDb();
    if(request.method==='POST' && Number(request.headers.get('content-length')||0)>32768) fail('Solicitare prea mare.',413);
    let body={};
    if(request.method==='POST') {
      sameOrigin(request);
      if(!request.headers.get('content-type')?.startsWith('application/json')) fail('Format JSON necesar.',415);
      const raw=await request.text(); if(raw.length>32768) fail('Solicitare prea mare.',413);
      try { body=JSON.parse(raw); } catch { fail('JSON invalid.'); }
      if(!body || typeof body!=='object' || Array.isArray(body)) fail('Obiect JSON necesar.');
    }
    if(action==='login' && request.method==='POST') {
      if(!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) fail('Contul admin nu este configurat.',503);
      const ip=context?.ip||'unknown';
      // Global and per-IP counters are persisted with conditional writes, fail closed on races.
      for(const bucket of ['global',hash(ip)]) {
        const key=`login-limits/${bucket}-${Math.floor(Date.now()/900000)}`;
        const item=await db.getWithMetadata(key,{type:'json'});
        const count=(item?.data?.count||0)+1;
        if(count>(bucket==='global'?100:10)) fail('Prea multe încercări. Reîncearcă în 15 minute.',429);
        const saved=await db.setJSON(key,{count},item?.etag?{onlyIfMatch:item.etag}:{onlyIfNew:true});
        if(!saved.modified) fail('Reîncearcă autentificarea.',429);
      }
      const password=typeof body.password==='string'?body.password:'';
      const valid=password.length<=256 && verifyPassword(password,process.env.ADMIN_PASSWORD_HASH);
      if(body.username!==process.env.ADMIN_USERNAME || !valid) fail('Utilizator sau parolă incorectă.',401);
      const raw=token(); const session={username:process.env.ADMIN_USERNAME,role:'admin',csrf:token(),expires:Date.now()+8*3600000,credential:hash(process.env.ADMIN_PASSWORD_HASH)};
      await db.setJSON(`sessions/${hash(raw)}`,session);
      return respond({username:session.username,csrf:session.csrf},200,{'Set-Cookie':cookie(request,raw,8*3600)});
    }
    const session=await authenticate(request,db);
    if(action==='session' && request.method==='GET') return respond({username:session.username,csrf:session.csrf});
    if(request.method==='POST') authorizeMutation(request,session);
    if(action==='logout' && request.method==='POST') { await db.delete(`sessions/${hash(sessionToken(request))}`); return respond({ok:true},200,{'Set-Cookie':cookie(request,'',0)}); }
    if(action==='invitation-create' && request.method==='POST')return respond(await createInvitation(getReviews(context),body,session.username));
    if(action==='invitations' && request.method==='GET')return respond({invitations:await listInvitations(getReviews(context))});
    if(action==='invitation-revoke' && request.method==='POST')return respond(await revokeInvitation(getReviews(context),body));
    if(action==='reviews' && request.method==='GET') return respond({reviews:await listReviews(getReviews(context),true)});
    if(action==='review-save' && request.method==='POST') return respond(await saveReview(getReviews(context),body,session.username));
    if(action==='leads' && request.method==='GET')return respond((await readLeads(getLeads(context))).data);
    if(action==='lead-save' && request.method==='POST')return respond(await saveLead(getLeads(context),body,session.username,(await readWorkspace(db)).data.clients));
    if(action==='analytics' && request.method==='GET') return respond(await analyticsReport(getAnalytics(context),url.searchParams.get('days')));
    if(action==='data' && request.method==='GET') { const {data}=await readWorkspace(db); return respond({...data,dashboard:dashboard(data)}); }
    if(action==='save' && request.method==='POST') {
      const {data,etag}=await readWorkspace(db);
      if(body.revision!==data.revision) fail('Date modificate. Reîncarcă înainte de salvare.',409);
      mutate(data,body,session.username);
      await writeWorkspace(db,data,etag);
      return respond({...data,dashboard:dashboard(data)});
    }
    if(action==='monitor' && request.method==='POST') {
      const current=await readWorkspace(db); const site=current.data.sites.find(x=>x.id===body.id);
      if(!site) fail('Site inexistent.',404);
      if(!site.active) fail('Monitorizarea este oprită pentru acest site.',409);
      const result=await checkSite(site.url);
      const {data,etag}=await readWorkspace(db);
      const target=data.sites.find(x=>x.id===site.id);
      if(!target || target.url!==site.url) fail('Site modificat. Reîncearcă.',409);
      target.checks=[result,...(target.checks||[])].slice(0,100); data.revision++;
      await writeWorkspace(db,data,etag); return respond({...data,dashboard:dashboard(data)});
    }
    fail('Operație inexistentă.',404);
  } catch(error) {
    if(!error.status) console.error('Admin operation failed:',error.name);
    return respond({message:error.status?error.message:'Eroare internă. Reîncearcă mai târziu.'},error.status||500);
  }
 };
}
export default createHandler();
