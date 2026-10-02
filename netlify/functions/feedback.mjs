import { reviewStore, listReviews, submitReview, validInvitation } from './lib/reviews-core.mjs';
import { sameOrigin, fail } from './lib/admin-core.mjs';
export function createFeedbackHandler(getDb=reviewStore) {
 return async(request,context)=>{
 const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 try {
  if(request.method==='GET' && request.headers.has('X-Review-Invitation')) {await validInvitation(getDb(context),request.headers.get('X-Review-Invitation'));return json({ok:true});}
  if(request.method==='GET') {const feedback=await listReviews(getDb(context));return json({feedback,total:feedback.length,averageRating:feedback.length?feedback.reduce((s,r)=>s+r.rating,0)/feedback.length:0});}
  if(request.method!=='POST')return json({message:'Metodă nepermisă.'},405);
  sameOrigin(request);
  if(!request.headers.get('content-type')?.startsWith('application/json'))fail('JSON necesar.',415);
  const raw=await request.text();if(raw.length>8192)fail('Formular prea mare.',413);
  let body;try{body=JSON.parse(raw);}catch{fail('JSON invalid.');}
  if(!body||typeof body!=='object'||Array.isArray(body))fail('Date invalide.');
  return json(await submitReview(getDb(context),body,context?.ip));
 }catch(e){return json({message:e.status?e.message:'Review-urile nu sunt disponibile momentan.'},e.status||503);}
 };
}
export default createFeedbackHandler();
