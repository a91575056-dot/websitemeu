import { leadsStore, submitLead } from './lib/leads-core.mjs';
import { sameOrigin, fail } from './lib/admin-core.mjs';
export function createLeadsHandler(getDb=leadsStore){return async(request,context)=>{
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 try{if(request.method!=='POST')return json({message:'Metodă nepermisă.'},405);sameOrigin(request);if(!request.headers.get('content-type')?.startsWith('application/json'))fail('JSON necesar.',415);const raw=await request.text();if(raw.length>8192)fail('Cerere prea mare.',413);let body;try{body=JSON.parse(raw);}catch{fail('JSON invalid.');}if(!body||typeof body!=='object'||Array.isArray(body))fail('Date invalide.');return json(await submitLead(getDb(context),body,context?.ip));}catch(e){return json({message:e.status?e.message:'Cererea nu poate fi salvată momentan.'},e.status||503);}
};}
export default createLeadsHandler();
