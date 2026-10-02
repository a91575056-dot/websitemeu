'use client';

import { useEffect, useState, type FormEvent } from 'react';
import './admin.css';
import Link from 'next/link';
import { ReviewsPanel } from './reviews-panel';
import { InboxSummary } from './inbox-summary';
import { LeadsPanel } from './leads-panel';
import { AnalyticsPanel } from './analytics-panel';

type Collection = 'clients' | 'projects' | 'payments' | 'sites' | 'maintenance';
type Check = { at: string; ok: boolean; status: number; latencyMs: number; message: string };
type Item = { id: string; name?: string; title?: string; clientId?: string; projectId?: string; siteId?: string; status?: string; currency?: string; valueCents?: number; amountCents?: number; costCents?: number; deadline?: string; dueDate?: string; receivedDate?: string; completedDate?: string; email?: string; phone?: string; company?: string; notes?: string; url?: string; kind?: string; reference?: string; active?: boolean; checks?: Check[] };
type Totals = { contracted: number; received: number; outstanding: number; overdue: number };
type Data = Record<Collection, Item[]> & { revision: number; dashboard: { currencies: Record<string, Totals>; activeProjects: number; clients: number }; audit: { at: string; username: string; collection: Collection; action: string }[] };
type Field = { key: string; label: string; type?: string; required?: boolean; options?: [string, string][]; relation?: Collection };
const labels: Record<Collection, string> = { clients: 'Clienți', projects: 'Proiecte', payments: 'Plăți', sites: 'Site-uri', maintenance: 'Mentenanță' };
const projectStatuses: [string,string][] = [['nou','Nou'],['in_lucru','În lucru'],['in_asteptare','În așteptare'],['finalizat','Finalizat'],['anulat','Anulat']];
const currencies: [string,string][] = ['EUR','USD','MDL','RON'].map(x=>[x,x]);
const fields: Record<Collection, Field[]> = {
 clients: [{key:'name',label:'Nume client',required:true},{key:'status',label:'Status',options:[['activ','Activ'],['inactiv','Inactiv']]},{key:'company',label:'Companie'},{key:'email',label:'Email',type:'email'},{key:'phone',label:'Telefon'},{key:'notes',label:'Notițe',type:'textarea'}],
 projects: [{key:'name',label:'Nume proiect',required:true},{key:'clientId',label:'Client',relation:'clients',required:true},{key:'status',label:'Status',options:projectStatuses},{key:'deadline',label:'Termen',type:'date'},{key:'value',label:'Valoare contract',type:'number',required:true},{key:'currency',label:'Monedă',options:currencies},{key:'notes',label:'Notițe',type:'textarea'}],
 payments: [{key:'projectId',label:'Proiect',relation:'projects',required:true},{key:'kind',label:'Tip plată',options:[['avans','Avans'],['transa','Tranșă'],['rest','Rest de plată']]},{key:'amount',label:'Sumă (moneda proiectului)',type:'number',required:true},{key:'dueDate',label:'Scadență',type:'date'},{key:'status',label:'Status',options:[['planificata','Planificată'],['incasata','Încasată']]},{key:'receivedDate',label:'Data încasării',type:'date'},{key:'reference',label:'Referință / metodă de plată'},{key:'notes',label:'Notițe',type:'textarea'}],
 sites: [{key:'name',label:'Nume site',required:true},{key:'url',label:'URL HTTPS',type:'url',required:true},{key:'clientId',label:'Client',relation:'clients'},{key:'active',label:'Monitorizare',options:[['true','Activă'],['false','Oprită']]},{key:'notes',label:'Notițe',type:'textarea'}],
 maintenance: [{key:'siteId',label:'Site',relation:'sites',required:true},{key:'title',label:'Lucrare',required:true},{key:'status',label:'Status',options:[['planificata','Planificată'],['in_lucru','În lucru'],['finalizata','Finalizată']]},{key:'dueDate',label:'Termen',type:'date'},{key:'completedDate',label:'Data finalizării',type:'date'},{key:'cost',label:'Cost',type:'number'},{key:'currency',label:'Monedă',options:currencies},{key:'notes',label:'Detalii intervenție',type:'textarea'}],
};
const money = (value=0,currency='EUR') => new Intl.NumberFormat('ro-RO',{style:'currency',currency}).format(value/100);
const dateLabel = (value?: string) => value ? new Date(value.length===10?value+'T12:00:00':value).toLocaleString('ro-RO',value.length===10?{dateStyle:'medium'}:{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Chisinau'}) : '—';
const statusLabel = (status?: string) => [...projectStatuses,['activ','Activ'],['inactiv','Inactiv'],['planificata','Planificată'],['incasata','Încasată'],['finalizata','Finalizată']].find(x=>x[0]===status)?.[1] || status || '—';

export default function AdminPanel() {
 const [session,setSession]=useState<{username:string;csrf:string}|null>(null);
 const [data,setData]=useState<Data|null>(null);
 const [tab,setTab]=useState<Collection|'dashboard'|'reviews'|'leads'>('dashboard');
 const [editing,setEditing]=useState<{collection:Collection;item:Item|null}|null>(null);
 const [draft,setDraft]=useState<Record<string,string>>({});
 const [busy,setBusy]=useState(false);
 const [checking,setChecking]=useState(true);
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [search,setSearch]=useState('');
 const [username,setUsername]=useState('');
 const [password,setPassword]=useState('');
 const [loginRequired,setLoginRequired]=useState(false);
 async function api(action:string,body?:unknown,csrf=session?.csrf) {
  const response=await fetch(`/api/admin?action=${action}`,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json','X-CSRF-Token':csrf||''}:undefined,body:body?JSON.stringify(body):undefined});
  const payload=await response.json();
  if(!response.ok) {
   if(response.status===401) { setSession(null); setData(null); setEditing(null); setLoginRequired(true); }
   throw new Error(payload.message||'Operația nu a reușit.');
  }
  return payload;
 }
 useEffect(()=>{
  let mounted=true;
  (async()=>{
   try {
    const response=await fetch('/api/admin?action=session',{cache:'no-store'});
    if(response.status===401) return;
    const payload=await response.json(); if(!response.ok) throw new Error(payload.message);
    const r=await fetch('/api/admin?action=data',{cache:'no-store'}); const d=await r.json();
    if(!r.ok) throw new Error(d.message);
    if(mounted) {setSession(payload);setData(d);}
   } catch(e) {if(mounted) setError(e instanceof Error?e.message:'Conexiune eșuată.');}
   finally {if(mounted) setChecking(false);}
  })();
  return ()=>{mounted=false;};
 },[]);
 async function run(operation:()=>Promise<void>) { setBusy(true);setError('');setNotice('');try {await operation();}catch(e){setError(e instanceof Error?e.message:'Eroare necunoscută.');}finally{setBusy(false);} }
 async function login(event:FormEvent) {
  event.preventDefault();
  await run(async()=>{ const s=await api('login',{username,password});setPassword('');setSession(s);setLoginRequired(false);setData(await api('data',undefined,s.csrf)); });
 }
 function edit(collection:Collection,item:Item|null) {
  const values:Record<string,string>={};
  for(const field of fields[collection]) {
   const raw=item?.[field.key as keyof Item];
   values[field.key]=raw===undefined?(field.options?.[0]?.[0]||''):String(raw);
  }
  if(item) {
   if(item.valueCents!==undefined) values.value=String(item.valueCents/100);
   if(item.amountCents!==undefined) values.amount=String(item.amountCents/100);
   if(item.costCents!==undefined) values.cost=String(item.costCents/100);
  }
  setDraft(values);setEditing({collection,item});setError('');setNotice('');
 }
 async function save(event:FormEvent) {
  event.preventDefault(); if(!editing||!data) return;
  await run(async()=>{
   const record={...draft,...(editing.collection==='sites'?{active:draft.active!=='false'}:{})};
   const d=await api('save',{revision:data.revision,collection:editing.collection,id:editing.item?.id,record});
   setData(d);setEditing(null);setNotice('Înregistrarea a fost salvată.');
  });
 }
 async function remove(collection:Collection,item:Item) {
  if(!data || !window.confirm('Ștergi această înregistrare? Operația nu poate fi anulată.')) return;
  await run(async()=>{setData(await api('save',{collection,id:item.id,remove:true,revision:data.revision}));setNotice('Înregistrarea a fost ștearsă.');});
 }
 const name=(collection:Collection,id?:string)=>data?.[collection].find(x=>x.id===id)?.name||'—';
 const projectRest=(project:Item)=>Math.max(0,(project.valueCents||0)-(data?.payments.filter(x=>x.projectId===project.id&&x.status==='incasata').reduce((s,x)=>s+(x.amountCents||0),0)||0));
 function detail(collection:Collection,item:Item) {
  if(collection==='clients') return [item.company,item.email,item.phone].filter(Boolean).join(' · ')||'Fără date de contact';
  if(collection==='projects') return `${name('clients',item.clientId)} · ${money(item.valueCents,item.currency)} · Rest: ${money(projectRest(item),item.currency)} · Termen: ${dateLabel(item.deadline)}`;
  if(collection==='payments') return `${name('projects',item.projectId)} · ${money(item.amountCents,data?.projects.find(x=>x.id===item.projectId)?.currency)} · Scadență: ${dateLabel(item.dueDate)} · Încasare: ${dateLabel(item.receivedDate)}`;
  if(collection==='sites') return `${item.url} · ${name('clients',item.clientId)} · ${item.active?'Monitorizare activă':'Monitorizare oprită'}`;
  return `${name('sites',item.siteId)} · Termen: ${dateLabel(item.dueDate)} · ${money(item.costCents,item.currency)} · Finalizare: ${dateLabel(item.completedDate)}`;
 }
 if(checking) return <main className="admin-shell" lang="ro"><p role="status">Se verifică sesiunea…</p></main>;
 if(!session) return <main className="admin-shell admin-login" lang="ro"><Link href="/">← Site public</Link><section className="admin-card"><span className="admin-eyebrow">DIONIS WEB</span><h1>Administrare</h1><p>Acces securizat pentru gestionarea activității.</p>{(error||loginRequired)&&<p className="admin-error" role="alert">{error||'Sesiunea a expirat. Autentifică-te din nou.'}</p>}<form onSubmit={login}><label>Utilizator<input autoComplete="username" required value={username} onChange={e=>setUsername(e.target.value)} /></label><label>Parolă<input type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)} /></label><button disabled={busy}>{busy?'Se autentifică…':'Autentificare'}</button></form></section></main>;
 return <main className="admin-shell" lang="ro">
  <header className="admin-header"><div><span className="admin-eyebrow">DIONIS WEB · ADMIN</span><h1>Panou de administrare</h1><p>Clienți, proiecte și încasări într-un singur loc.</p></div><div className="admin-actions"><Link href="/">Site public</Link><span>{session.username}</span><button className="secondary" disabled={busy} onClick={()=>run(async()=>{await api('logout',{});setSession(null);setData(null);setEditing(null);})}>Deconectare</button></div></header>
  <nav className="admin-tabs" aria-label="Secțiuni admin">{(['dashboard','leads','reviews',...Object.keys(labels)] as (Collection|'dashboard'|'reviews'|'leads')[]).map(key=><button className={tab===key?'selected':'secondary'} key={key} onClick={()=>{setTab(key);setSearch('');setEditing(null);}}>{key==='dashboard'?'Dashboard':key==='reviews'?'Review-uri':key==='leads'?'Cereri de ofertă':labels[key]}</button>)}</nav>
  {error&&<p className="admin-error" role="alert">{error}</p>}{notice&&<p className="admin-notice" role="status">{notice}</p>}
  <div className="admin-toolbar"><span>Reîncarcă datele pentru a vedea ultimele modificări.</span><button className="secondary" disabled={busy} onClick={()=>run(async()=>{setData(await api('data'));setNotice('Date actualizate.');})}>Actualizează</button><button className="secondary" disabled={!data||busy} onClick={()=>{if(!data)return;const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`dionis-admin-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}}>Export date</button></div>
  {!data?<p>Datele nu sunt încă disponibile. Folosește „Actualizează”.</p>:tab==='leads'?<LeadsPanel csrf={session.csrf} clients={data.clients} onNewClient={()=>{setTab('clients');edit('clients',null);}}/>:tab==='reviews'?<ReviewsPanel csrf={session.csrf}/>:tab==='dashboard'?<>
   <section className="admin-summary"><article className="admin-card"><span>Proiecte active</span><strong>{data.dashboard.activeProjects}</strong></article><article className="admin-card"><span>Clienți</span><strong>{data.dashboard.clients}</strong></article><article className="admin-card"><span>Site-uri cu ultima verificare eșuată</span><strong>{data.sites.filter(x=>x.active&&x.checks?.[0]?.ok===false).length}</strong></article><article className="admin-card"><span>Lucrări de mentenanță deschise</span><strong>{data.maintenance.filter(x=>x.status!=='finalizata').length}</strong></article></section>
   <InboxSummary onLeads={()=>setTab('leads')} onReviews={()=>setTab('reviews')}/>
   <section className="admin-card"><h2>Acces rapid</h2><div className="admin-actions"><button onClick={()=>setTab('leads')}>Cereri de ofertă</button><button className="secondary" onClick={()=>setTab('reviews')}>Moderează review-uri</button><button className="secondary" onClick={()=>{setTab('clients');edit('clients',null);}}>Adaugă client</button><button className="secondary" onClick={()=>setTab('sites')}>Starea site-urilor</button></div><h3>Necesită atenție</h3><p>{data.payments.filter(x=>x.status!=='incasata'&&x.dueDate&&x.dueDate<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Chisinau'}).format(new Date())).length} plăți restante · {data.sites.filter(x=>x.active&&x.checks?.[0]?.ok===false).length} site-uri cu erori</p></section>
   <AnalyticsPanel />
   <h2>Situația financiară</h2><p>Veniturile reprezintă plățile marcate manual ca încasate. Monedele sunt calculate separat, fără conversie.</p>
   {Object.entries(data.dashboard.currencies).length===0?<section className="admin-card">Adaugă un client și un proiect pentru a începe.</section>:Object.entries(data.dashboard.currencies).map(([currency,t])=><section key={currency} className="admin-card admin-finance"><h3>{currency}</h3><div><span>Valoare contractată</span><strong>{money(t.contracted,currency)}</strong></div><div><span>Venituri încasate</span><strong>{money(t.received,currency)}</strong></div><div><span>Rest de încasat</span><strong>{money(t.outstanding,currency)}</strong></div><div><span>Tranșe restante</span><strong>{money(t.overdue,currency)}</strong></div></section>)}
   <section className="admin-card"><h2>Scadențe și termene</h2>{[...data.payments.filter(x=>x.status!=='incasata'&&x.dueDate).map(x=>({id:x.id,date:x.dueDate!,title:`Plată · ${name('projects',x.projectId)}`,tab:'payments' as const})),...data.projects.filter(x=>!['finalizat','anulat'].includes(x.status||'')&&x.deadline).map(x=>({id:x.id,date:x.deadline!,title:`Proiect · ${x.name}`,tab:'projects' as const})),...data.maintenance.filter(x=>x.status!=='finalizata'&&x.dueDate).map(x=>({id:x.id,date:x.dueDate!,title:`Mentenanță · ${x.title}`,tab:'maintenance' as const}))].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12).map(x=><div className="admin-deadline" key={x.id}><button className="text-button" onClick={()=>setTab(x.tab)}>{x.title}</button><span className={x.date<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Chisinau'}).format(new Date())?'overdue':''}>{dateLabel(x.date)}</span></div>)}{!data.projects.length&&!data.payments.length&&!data.maintenance.length&&<p>Nu există termene înregistrate.</p>}</section>
   <section className="admin-card"><h2>Activitate recentă</h2>{data.audit.slice(0,10).map((x,i)=><p key={i}>{dateLabel(x.at)} · {labels[x.collection]} · {x.action} · {x.username}</p>)}{!data.audit.length&&<p>Nicio operație înregistrată.</p>}</section>
  </>:<>
   <section className="admin-section-heading"><h2>{labels[tab]}</h2><button disabled={busy} onClick={()=>edit(tab,null)}>+ Adaugă</button></section>
   {tab==='payments'&&<p>Evidență manuală. Marcarea unei plăți ca încasată nu inițiază o tranzacție. Restul de plată se calculează din valoarea proiectului minus încasări.</p>}
   {tab==='sites'&&<p>Verificări HTTPS periodice și la cerere; istoricul ultimelor 100 de verificări este păstrat. O redirecționare este raportată fără verificarea destinației.</p>}
   <label className="admin-search">Caută în {labels[tab].toLowerCase()}<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nume, status sau detalii…" /></label>
   {editing?.collection===tab&&<section className="admin-card"><h3>{editing.item?'Editează':'Adaugă'} {labels[tab].toLowerCase()}</h3><form onSubmit={save} className="admin-form">{fields[tab].map(field=><label key={field.key}>{field.label}{field.required?' *':''}{field.options||field.relation?<select aria-label={field.label+(field.required?' *':'')} required={field.required} value={draft[field.key]||''} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}>{field.relation&&<option value="">Alege…</option>}{(field.options||data[field.relation!].map(x=>[x.id,x.name||x.title||x.id])).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>:field.type==='textarea'?<textarea maxLength={1000} value={draft[field.key]||''} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}/>:<input type={field.type||'text'} required={field.required} min={field.type==='number'?0:undefined} step={field.type==='number'?'0.01':undefined} maxLength={field.type==='text'||!field.type?160:undefined} value={draft[field.key]||''} onChange={e=>setDraft({...draft,[field.key]:e.target.value})}/>}</label>)}<div className="admin-actions"><button disabled={busy}>{busy?'Se salvează…':'Salvează'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>setEditing(null)}>Anulează</button></div></form></section>}
   <section className="admin-list">{data[tab].filter(item=>`${item.name||item.title||''} ${detail(tab,item)} ${statusLabel(item.status)} ${item.notes||''}`.toLowerCase().includes(search.toLowerCase())).map(item=><article className="admin-card" key={item.id}><div className="admin-row"><div><h3>{item.name||item.title||(tab==='payments'?`${item.kind==='avans'?'Avans':item.kind==='rest'?'Rest de plată':'Tranșă'} · ${name('projects',item.projectId)}`:item.id)}</h3><p>{detail(tab,item)}</p>{item.status&&<span className="admin-badge">{statusLabel(item.status)}</span>}{item.notes&&<p className="admin-notes">{item.notes}</p>}</div><div className="admin-actions"><button className="secondary" disabled={busy} onClick={()=>edit(tab,item)}>Editează</button><button className="danger" disabled={busy} onClick={()=>remove(tab,item)}>Șterge</button>{tab==='sites'&&<button disabled={busy||!item.active} onClick={()=>run(async()=>{setData(await api('monitor',{id:item.id}));setNotice('Verificarea site-ului a fost înregistrată.');})}>Verifică acum</button>}</div></div>{tab==='sites'&&<details><summary>{item.checks?.[0]?`${item.checks[0].ok?'Disponibil':'Verificare eșuată'} · ${dateLabel(item.checks[0].at)} · ${item.checks[0].latencyMs} ms`:'Site neverificat'}</summary>{item.checks?.map((c,i)=><p key={i}>{dateLabel(c.at)} · {c.message} · {c.latencyMs} ms</p>)}</details>}</article>)}{!data[tab].length&&<section className="admin-card"><p>Nu există înregistrări. Adaugă prima înregistrare folosind butonul de mai sus.</p></section>}</section>
  </>}
  <footer className="admin-footer">Dionis Web · Administrarea activității · Plăți înregistrate manual</footer>
 </main>;
}
