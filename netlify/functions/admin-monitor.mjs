import { store, readWorkspace, writeWorkspace } from './lib/admin-core.mjs';
import { checkSite } from './lib/admin-monitor-core.mjs';

// Netlify scheduled functions are not callable through a public URL.
// Each batch is bounded so a slow remote site cannot exhaust the function runtime.
export const config = { schedule: '*/15 * * * *' };
export function createMonitorHandler(getDb=store, check=checkSite) {
 return async function handler() {
 const db=getDb();
 const initial=await readWorkspace(db);
 const sites=initial.data.sites.filter(x=>x.active).sort((a,b)=>(a.checks?.[0]?.at||'').localeCompare(b.checks?.[0]?.at||'' )).slice(0,10);
 const checks=await Promise.all(sites.map(async site=>({id:site.id,url:site.url,result:await check(site.url)})));
 if(!checks.length) return new Response(null,{status:204});
 for(let attempt=0;attempt<3;attempt++) {
  const {data,etag}=await readWorkspace(db);
  for(const check of checks) {
   const target=data.sites.find(x=>x.id===check.id && x.url===check.url);
   if(target) target.checks=[check.result,...(target.checks||[])].slice(0,100);
  }
  data.revision++;
  try { await writeWorkspace(db,data,etag); return new Response(null,{status:204}); }
  catch(error) { if(error.status!==409 || attempt===2) throw error; }
 }
 return new Response(null,{status:204});
};
}
export default createMonitorHandler();
