'use client';
import { useEffect, useState } from 'react';
export function InboxSummary({onLeads,onReviews}:{onLeads:()=>void;onReviews:()=>void}){
 const [counts,setCounts]=useState<{leads:number;reviews:number}|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.all(['leads','reviews'].map(async action=>{const r=await fetch(`/api/admin?action=${action}`,{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.message);return d;})).then(([l,r])=>{if(active)setCounts({leads:l.leads.filter((x:{status:string})=>x.status==='noua').length,reviews:r.reviews.filter((x:{status:string})=>x.status==='pending').length});}).catch(e=>{if(active)setError(e.message);});return()=>{active=false;};},[]);
 return <section className="admin-card"><h2>Inbox · necesită atenție</h2>{error&&<p role="alert" className="admin-error">{error}</p>}{!counts&&!error?<p role="status">Se verifică inboxul…</p>:counts&&<div className="admin-summary"><button className="admin-card secondary" onClick={onLeads}><span>Cereri noi de ofertă</span><strong>{counts.leads}</strong><small>Deschide cererile</small></button><button className="admin-card secondary" onClick={onReviews}><span>Review-uri în așteptare</span><strong>{counts.reviews}</strong><small>Deschide moderarea</small></button></div>}</section>;
}
