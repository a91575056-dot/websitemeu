import { randomBytes, createHash, scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';

export const store = () => getStore({ name: 'dionis-admin-v1', consistency: 'strong' });
export const hash = value => createHash('sha256').update(value).digest('hex');
export const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
export const empty = () => ({ revision: 0, clients: [], projects: [], payments: [], sites: [], maintenance: [], audit: [] });
export async function readWorkspace(db) {
  const item = await db.getWithMetadata('workspace', { type: 'json' });
  return { data: item?.data || empty(), etag: item?.etag };
}
export async function writeWorkspace(db, data, etag) {
  const result = await db.setJSON('workspace', data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
  if (!result.modified) fail('Datele au fost modificate în altă sesiune. Reîncarcă și încearcă din nou.', 409);
}
export function verifyPassword(password, encoded) {
  try {
    const [version, salt, digest] = encoded.split(':');
    if (version !== 'scrypt-v1' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(digest)) return false;
    return timingSafeEqual(scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }), Buffer.from(digest, 'hex'));
  } catch { return false; }
}
export function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt-v1:${salt}:${scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex')}`;
}
export const token = () => randomBytes(32).toString('base64url');
export function cookieName(request) { return new URL(request.url).protocol === 'https:' ? '__Host-dionis_admin' : 'dionis_admin_local'; }
export function cookie(request, value, maxAge) {
  return `${cookieName(request)}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export function sessionToken(request) {
  return (request.headers.get('cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(cookieName(request) + '='))?.split('=')[1] || '';
}
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) fail('Origine neautorizată.', 403);
}
export async function authenticate(request, db) {
  const raw = sessionToken(request);
  if (!/^[A-Za-z0-9_-]{43}$/.test(raw)) fail('Autentificare necesară.', 401);
  const session = await db.get(`sessions/${hash(raw)}`, { type: 'json' });
  if (!session || session.expires < Date.now() || session.role !== 'admin' || session.credential !== hash(process.env.ADMIN_PASSWORD_HASH || '') || session.username !== process.env.ADMIN_USERNAME) fail('Sesiune expirată. Autentifică-te din nou.', 401);
  return session;
}
export function authorizeMutation(request, session) {
  sameOrigin(request);
  if (!session.csrf || request.headers.get('x-csrf-token') !== session.csrf) fail('Solicitare neautorizată.', 403);
}
const text = (value, max=1000) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const required = (value, label) => { const result=text(value,160); if(!result) fail(`${label} este obligatoriu.`); return result; };
const date = (value) => { if(!value) return ''; if(!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value+'T00:00:00Z')) || new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value) fail('Dată invalidă.'); return value; };
const money = (value) => { const number=Number(value); if(!Number.isFinite(number) || number<0 || number>100000000) fail('Sumă invalidă.'); return Math.round(number*100); };
const choice = (value, allowed) => { if(!allowed.includes(value)) fail('Status invalid.'); return value; };
const ref = (data, collection, id, optional=false) => { if(optional && !id) return ''; if(!data[collection].some(x=>x.id===id)) fail('Înregistrarea asociată nu există.'); return id; };
export function validateRecord(collection, input, data) {
  if(!input || typeof input!=='object' || Array.isArray(input)) fail('Date invalide.');
  switch(collection) {
    case 'clients': return { status:choice(input.status||'activ',['activ','inactiv']), name: required(input.name,'Nume'), email:text(input.email,160), phone:text(input.phone,60), company:text(input.company,160), notes:text(input.notes) };
    case 'projects': return { name:required(input.name,'Proiect'), clientId:ref(data,'clients',input.clientId), status:choice(input.status,['nou','in_lucru','in_asteptare','finalizat','anulat']), deadline:date(input.deadline), valueCents:money(input.value), currency:choice(input.currency,['EUR','USD','MDL','RON']), notes:text(input.notes) };
    case 'payments': return { projectId:ref(data,'projects',input.projectId), kind:choice(input.kind,['avans','transa','rest']), amountCents:money(input.amount), dueDate:date(input.dueDate), receivedDate:date(input.receivedDate), status:choice(input.status,['planificata','incasata']), reference:text(input.reference,160), notes:text(input.notes) };
    case 'sites': { let url; try { url=new URL(required(input.url,'URL')); } catch { fail('URL invalid. Folosește un URL HTTPS complet.'); } if(url.protocol!=='https:' || url.username || url.password || url.port) fail('Folosește un URL HTTPS fără credențiale sau port.'); return { name:required(input.name,'Site'), url:url.toString(), clientId:ref(data,'clients',input.clientId,true), active:input.active!==false, notes:text(input.notes) }; }
    case 'maintenance': return { siteId:ref(data,'sites',input.siteId), title:required(input.title,'Lucrare'), status:choice(input.status,['planificata','in_lucru','finalizata']), dueDate:date(input.dueDate), completedDate:date(input.completedDate), costCents:money(input.cost||0), currency:choice(input.currency,['EUR','USD','MDL','RON']), notes:text(input.notes) };
    default: fail('Colecție invalidă.');
  }
}
export function mutate(data, { collection, record, id, remove }, username) {
  if(!['clients','projects','payments','sites','maintenance'].includes(collection)) fail('Colecție invalidă.');
  const existing=data[collection].find(x=>x.id===id);
  if(id && !existing) fail('Înregistrarea nu există.',404);
  if(remove) {
    if(collection==='clients' && [...data.projects,...data.sites].some(x=>x.clientId===id)) fail('Clientul are proiecte sau site-uri asociate.');
    if(collection==='projects' && data.payments.some(x=>x.projectId===id)) fail('Proiectul are plăți asociate.');
    if(collection==='sites' && data.maintenance.some(x=>x.siteId===id)) fail('Site-ul are lucrări asociate.');
    data[collection]=data[collection].filter(x=>x.id!==id);
  } else {
    const valid=validateRecord(collection,record||{},data);
    if(collection==='projects' && existing && existing.currency!==valid.currency && data.payments.some(x=>x.projectId===id)) fail('Moneda nu poate fi schimbată pentru un proiect cu plăți.');
    if(collection==='payments' && valid.amountCents===0) fail('Suma plății trebuie să fie mai mare decât zero.');
    if(collection==='payments' && valid.status==='incasata' && !valid.receivedDate) fail('Data încasării este obligatorie.');
    const updated={...existing,...valid,id:existing?.id||randomUUID(),updatedAt:new Date().toISOString()};
    if(existing) data[collection]=data[collection].map(x=>x.id===id?updated:x); else { if(data[collection].length>=2000) fail('Limita de înregistrări a fost atinsă.'); data[collection].push(updated); }
  }
  data.revision++;
  data.audit=[{at:new Date().toISOString(),username,collection,id:id||data[collection].at(-1)?.id,action:remove?'stergere':existing?'modificare':'creare'},...data.audit].slice(0,200);
  return data;
}
export function dashboard(data) {
  const totals={};
  for(const project of data.projects) {
    const total=totals[project.currency] ||= { contracted:0, received:0, outstanding:0, overdue:0 };
    const payments=data.payments.filter(x=>x.projectId===project.id);
    const received=payments.filter(x=>x.status==='incasata').reduce((s,x)=>s+x.amountCents,0);
    total.contracted+=project.status==='anulat'?0:project.valueCents;
    total.received+=received;
    total.outstanding+=project.status==='anulat'?0:Math.max(0,project.valueCents-received);
    total.overdue+=payments.filter(x=>x.status!=='incasata' && x.dueDate && x.dueDate<new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Chisinau'}).format(new Date())).reduce((s,x)=>s+x.amountCents,0);
  }
  return { currencies:totals, activeProjects:data.projects.filter(x=>['nou','in_lucru','in_asteptare'].includes(x.status)).length, clients:data.clients.length };
}
