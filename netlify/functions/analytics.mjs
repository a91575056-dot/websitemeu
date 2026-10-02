import { analyticsStore, recordEvent } from './lib/analytics-core.mjs';
import { sameOrigin, fail } from './lib/admin-core.mjs';
export function createAnalyticsHandler(getDb=analyticsStore){return async(request,context)=>{
 const json=(body,status)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 try{if(request.method!=='POST')return json({message:'Metodă nepermisă.'},405);sameOrigin(request);if(!request.headers.get('content-type')?.startsWith('application/json'))fail('JSON necesar.',415);const raw=await request.text();if(raw.length>2048)fail('Eveniment prea mare.',413);let body;try{body=JSON.parse(raw);}catch{fail('JSON invalid.');}return json(await recordEvent(getDb(context),body,request,context),200);}catch(e){return json({message:e.status?e.message:'Măsurare indisponibilă.'},e.status||503);}
};}
export default createAnalyticsHandler();
