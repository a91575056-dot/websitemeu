import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.ADMIN_TEST_URL||'http://127.0.0.1:8888',host=new URL(base).hostname;
if(!['localhost','127.0.0.1'].includes(host)&&!/^[a-f0-9]+--enchanting-cajeta-137e06\.netlify\.app$/.test(host))throw Error('Use local or an explicit draft URL.');
const account=process.env.ADMIN_TEST_ACCOUNT_FILE?JSON.parse(readFileSync(process.env.ADMIN_TEST_ACCOUNT_FILE)):null;
const session=process.env.ADMIN_TEST_SESSION_FILE?JSON.parse(readFileSync(process.env.ADMIN_TEST_SESSION_FILE)):null;
if(!account&&!session)throw Error('Configure a private test account file or test session file.');
const proxyURL=!['localhost','127.0.0.1'].includes(host)&&process.env.HTTPS_PROXY?new URL(process.env.HTTPS_PROXY):null;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox'],proxy:proxyURL?{server:`${proxyURL.protocol}//${proxyURL.host}`,username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)}:undefined});
const context=await browser.newContext({userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36',viewport:{width:1440,height:1000}}),page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));const marker='Review verification '+Date.now();let key,etag,csrf,invitationKey;
async function api(action,body){return context.request.fetch(`${base}/api/admin?action=${action}`,{method:body?'POST':'GET',headers:body?{Origin:new URL(base).origin,'Content-Type':'application/json','X-CSRF-Token':csrf}:{},data:body});}
try{
 for(const action of ['reviews','analytics'])assert.equal((await api(action)).status(),401);
 await page.goto(base+'/feedback');await page.getByText('Review-uri numai prin invitație',{exact:true}).waitFor();assert.equal(await page.locator('form').count(),0);
 assert.equal((await context.request.post(base+'/api/feedback',{headers:{Origin:new URL(base).origin},data:{name:marker,message:'Direct spam attempt',rating:5}})).status(),403);
 if(session)await context.addCookies([{name:'__Host-dionis_admin',value:session.token,domain:host,path:'/',secure:true,httpOnly:true,sameSite:'Strict'}]);
 await page.goto(base+'/admin');
 if(account){await page.getByLabel('Utilizator',{exact:true}).fill(account.username);await page.getByLabel('Parolă',{exact:true}).fill(account.password);await page.getByRole('button',{name:'Autentificare',exact:true}).click();}
 await page.getByRole('heading',{name:'Panou de administrare'}).waitFor();csrf=(await (await api('session')).json()).csrf;
 await page.getByRole('button',{name:'Review-uri',exact:true}).click();await page.getByLabel('Client invitat',{exact:true}).fill(marker);await page.getByRole('button',{name:'Creează invitație',exact:true}).click();const linkInput=page.getByLabel('Link individual',{exact:true});await linkInput.waitFor();const link=await linkInput.inputValue();invitationKey=(await (await api('invitations')).json()).invitations.find(i=>i.client===marker).key;
 await page.goto(link);await page.getByLabel('Name',{exact:true}).fill(marker);await page.getByLabel('Feedback',{exact:true}).fill('Very clear communication and excellent website design.');await page.getByRole('checkbox').check();await page.waitForTimeout(2600);await page.getByRole('button',{name:'Submit feedback',exact:true}).click();await page.getByText('Thank you! Your feedback has been received and will appear only after approval.').waitFor();
 assert.equal((await (await context.request.get(base+'/api/feedback')).json()).feedback.some(x=>x.name===marker),false);
 await page.reload();await page.getByText('Review-uri numai prin invitație',{exact:true}).waitFor();
 await page.goto(base+'/admin');
 await page.getByRole('heading',{name:'Panou de administrare'}).waitFor();csrf=(await (await api('session')).json()).csrf;
 await page.getByRole('button',{name:'Review-uri',exact:true}).click();const card=page.locator('article').filter({has:page.getByRole('heading',{name:marker+' · 5/5',exact:true})});await card.waitFor();
 let item=(await (await api('reviews')).json()).reviews.find(x=>x.name===marker);key=item.key;etag=item.etag;assert.equal(item.status,'pending');
 assert.equal((await context.request.post(base+'/api/admin?action=review-save',{headers:{Origin:new URL(base).origin},data:{key,etag,remove:true}})).status(),403);
 await card.getByRole('button',{name:'Aprobă și publică'}).click();await page.getByRole('status').filter({hasText:'Review actualizat.'}).waitFor();assert.equal((await (await context.request.get(base+'/api/feedback')).json()).feedback.some(x=>x.name===marker),true);
 await page.goto(base+'/');await page.getByText(marker,{exact:true}).waitFor();
 await page.goto(base+'/feedbacks');await page.getByRole('heading',{name:marker,exact:true}).waitFor();
 await page.goto(base+'/admin');await page.getByRole('button',{name:'Review-uri',exact:true}).click();await card.getByRole('button',{name:'Editează review',exact:true}).click();await page.getByLabel('Review',{exact:true}).fill('Updated review text after checking persistence.');await page.getByRole('button',{name:'Salvează review',exact:true}).click();await page.getByRole('status').filter({hasText:'Review actualizat.'}).waitFor();await page.reload();await page.getByRole('button',{name:'Review-uri',exact:true}).click();await page.getByText('Updated review text after checking persistence.',{exact:true}).waitFor();
 await card.getByRole('button',{name:'Ascunde',exact:true}).click();await page.getByRole('status').filter({hasText:'Review actualizat.'}).waitFor();assert.equal((await (await context.request.get(base+'/api/feedback')).json()).feedback.some(x=>x.name===marker),false);
 await card.getByRole('button',{name:'Respinge',exact:true}).click();await page.getByRole('status').filter({hasText:'Review actualizat.'}).waitFor();assert.equal((await (await api('reviews')).json()).reviews.find(x=>x.name===marker).status,'rejected');
 await page.getByRole('button',{name:'Dashboard',exact:true}).click();await page.getByRole('heading',{name:'Statistici de trafic'}).waitFor();await page.getByLabel('Perioada',{exact:true}).selectOption('30');await page.getByRole('heading',{name:'Evoluție zilnică'}).waitFor();await page.getByRole('heading',{name:'Hartă detaliată · Moldova'}).waitFor();for(let i=0;i<10;i++)await page.getByRole('button',{name:'Zoom +',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Zoom +',exact:true}).isDisabled(),true);let stats=await (await api('analytics&days=30')).json();assert.ok(stats.pageviews>=3);assert.ok(stats.dailyUniqueSum>=1);assert.equal(stats.daily.length,30);assert.ok(stats.pages['/feedback']>=1);
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);mkdirSync('/workspace/.cloud-tools/artifacts',{recursive:true});await page.screenshot({path:'/workspace/.cloud-tools/artifacts/reviews-analytics-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS browser: client form, pending visibility, approval, shared homepage/reviews data, edit, reload, hide, reject, CSRF, actual analytics collection, periods and mobile.');
}finally{
 try{if(csrf){const items=(await (await api('reviews')).json()).reviews;const current=items?.find(x=>x.name===marker);if(current){const r=await api('review-save',{key:current.key,etag:current.etag,remove:true});assert.equal(r.status(),200);}if(invitationKey)assert.equal((await api('invitation-revoke',{key:invitationKey,remove:true})).status(),200);await api('logout',{});assert.equal((await api('analytics')).status(),401);}}finally{await browser.close();}
}
