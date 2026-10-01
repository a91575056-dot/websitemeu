import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.ADMIN_TEST_URL||'http://127.0.0.1:8888';
const host=new URL(base).hostname;
if(!['127.0.0.1','localhost'].includes(host) && !/^[a-f0-9]+--enchanting-cajeta-137e06\.netlify\.app$/.test(host)) throw new Error('Use localhost or an explicit draft deploy URL; this test writes and cleans up isolated test records.');
const file=process.env.ADMIN_TEST_ACCOUNT_FILE;
if(!file) throw new Error('Set ADMIN_TEST_ACCOUNT_FILE to a private account file outside the repository.');
const account=JSON.parse(readFileSync(file,'utf8'));
const proxyUrl=!['localhost','127.0.0.1'].includes(host)&&process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const proxy=proxyUrl?{server:`${proxyUrl.protocol}//${proxyUrl.host}`,username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)}:undefined;
const browser=await chromium.launch({proxy,headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const marker=`Verificare ${Date.now()}`;
let csrf='';
const ids={clients:[],projects:[],payments:[],sites:[],maintenance:[]};
async function api(action,body){return context.request.fetch(`${base}/api/admin?action=${action}`,{method:body?'POST':'GET',headers:body?{Origin:new URL(base).origin,'Content-Type':'application/json','X-CSRF-Token':csrf}:{},data:body});}
async function submit(){await page.getByRole('button',{name:'Salvează',exact:true}).click();await page.getByRole('status').filter({hasText:'Înregistrarea a fost salvată.'}).waitFor();const d=await (await api('data')).json();for(const key of Object.keys(ids))for(const item of d[key])if((item.name||item.title||'').includes(marker)&&!ids[key].includes(item.id))ids[key].push(item.id);return d;}
try {
 assert.equal((await context.request.get(`${base}/api/admin`)).status(),401);
 assert.equal((await context.request.get(`${base}/.netlify/functions/admin`)).status(),401);
 await page.goto(`${base}/admin`);
 await page.getByLabel('Utilizator',{exact:true}).fill(account.username);
 await page.getByLabel('Parolă',{exact:true}).fill(account.password);
 await page.getByRole('button',{name:'Autentificare',exact:true}).click();
 await page.getByRole('heading',{name:'Panou de administrare'}).waitFor();
 csrf=(await (await api('session')).json()).csrf;
 await page.getByRole('button',{name:'Clienți',exact:true}).click();await page.getByRole('button',{name:'+ Adaugă',exact:true}).click();
 await page.getByLabel('Nume client *',{exact:true}).fill(marker);await page.getByLabel('Email',{exact:true}).fill('test@example.invalid');await submit();
 await page.getByRole('button',{name:'Proiecte',exact:true}).click();await page.getByRole('button',{name:'+ Adaugă',exact:true}).click();
 await page.getByLabel('Nume proiect *',{exact:true}).fill(marker+' proiect');await page.getByLabel('Client *',{exact:true}).selectOption({label:marker});await page.getByLabel('Status',{exact:true}).selectOption('in_lucru');await page.getByLabel('Valoare contract *',{exact:true}).fill('1250');await page.getByLabel('Termen',{exact:true}).fill('2026-12-15');await submit();
 await page.getByRole('button',{name:'Plăți',exact:true}).click();await page.getByRole('button',{name:'+ Adaugă',exact:true}).click();
 await page.getByLabel('Proiect *',{exact:true}).selectOption({label:marker+' proiect'});await page.getByLabel('Sumă (moneda proiectului) *',{exact:true}).fill('250');await page.getByLabel('Status',{exact:true}).selectOption('incasata');await page.getByLabel('Data încasării',{exact:true}).fill('2026-10-01');let d=await submit();ids.payments.push(d.payments.find(x=>x.projectId===ids.projects[0]).id);
 await page.getByRole('button',{name:'Site-uri',exact:true}).click();await page.getByRole('button',{name:'+ Adaugă',exact:true}).click();await page.getByLabel('Nume site *',{exact:true}).fill(marker+' site');await page.getByLabel('URL HTTPS *',{exact:true}).fill('https://127.0.0.1');await page.getByLabel('Client',{exact:true}).selectOption({label:marker});await submit();
 const siteCard=page.locator('article').filter({has:page.getByRole('heading',{name:marker+' site',exact:true})});await siteCard.getByRole('button',{name:'Verifică acum'}).click();await page.getByRole('status').filter({hasText:'Verificarea site-ului a fost înregistrată.'}).waitFor();await siteCard.getByText(/Verificare eșuată/).waitFor();
 await page.getByRole('button',{name:'Mentenanță',exact:true}).click();await page.getByRole('button',{name:'+ Adaugă',exact:true}).click();await page.getByLabel('Site *',{exact:true}).selectOption({label:marker+' site'});await page.getByLabel('Lucrare *',{exact:true}).fill(marker+' mentenanță');await page.getByLabel('Termen',{exact:true}).fill('2026-10-15');await page.getByLabel('Cost',{exact:true}).fill('50');await submit();
 const work=page.locator('article').filter({has:page.getByRole('heading',{name:marker+' mentenanță',exact:true})});await work.getByRole('button',{name:'Editează'}).click();await page.getByLabel('Status',{exact:true}).selectOption('finalizata');await page.getByLabel('Data finalizării',{exact:true}).fill('2026-10-01');await submit();
 await page.reload();await page.getByRole('heading',{name:'Panou de administrare'}).waitFor();d=await (await api('data')).json();assert.equal(d.projects.find(x=>x.id===ids.projects[0]).valueCents,125000);assert.equal(d.dashboard.currencies.EUR.received>=25000,true);assert.equal(d.maintenance.find(x=>x.id===ids.maintenance[0]).status,'finalizata');
 await page.getByRole('button',{name:'Dashboard',exact:true}).click();await page.getByRole('heading',{name:'Situația financiară'}).waitFor();
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.setViewportSize({width:1440,height:1100});
 mkdirSync('/workspace/.cloud-tools/artifacts',{recursive:true});await page.screenshot({path:'/workspace/.cloud-tools/artifacts/admin-dashboard.png',fullPage:true});
 const noCsrf=await context.request.post(`${base}/api/admin?action=save`,{headers:{Origin:new URL(base).origin},data:{revision:d.revision,collection:'clients',record:{name:'Forbidden'}}});assert.equal(noCsrf.status(),403);
 assert.deepEqual(errors,[]);
 console.log('PASS browser: login, all five modules, edit, persisted reload, dashboard, manual payments, blocked private monitor, responsive layout and CSRF');
} finally {
 try {
  if(csrf) for(const key of ['maintenance','payments','sites','projects','clients']) for(const id of ids[key]) {const data=await (await api('data')).json();const r=await api('save',{revision:data.revision,collection:key,id,remove:true});assert.equal(r.status(),200,`cleanup ${key}`);}
  if(csrf){const r=await api('logout',{});assert.equal(r.status(),200);assert.equal((await api('data')).status(),401);console.log('PASS cleanup and logout revocation');}
 } finally {await browser.close();}
}
