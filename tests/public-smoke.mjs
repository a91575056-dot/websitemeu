import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const base=process.env.SITE_TEST_URL||'http://127.0.0.1:8888';
function get(path){const r=spawnSync('curl',['--silent','--show-error','--max-time','30','--write-out','\n%{http_code}',base+path],{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(r.status,0,`network ${path}`);const separator=r.stdout.lastIndexOf('\n');return {status:Number(r.stdout.slice(separator+1)),body:r.stdout.slice(0,separator)};}
for(const path of ['/','/feedback','/feedbacks','/payment-success','/payment-cancel','/admin']){const r=get(path);assert.equal(r.status,200,path);assert.ok(r.body.includes('Dionis'),path);console.log('PASS page '+path);}
for(const path of ['/portfolio','/portfolio/launchflow-coach']){assert.equal(get(path).status,301,path);console.log('PASS removed portfolio redirect '+path);}
assert.ok(!get('/sitemap.xml').body.includes('/portfolio'));
const config=get('/api/paypal/config');assert.equal(config.status,200);assert.equal(JSON.parse(config.body).paymentOptions.length,3);console.log('PASS existing PayPal config; no payment initiated');
const feedback=get('/api/feedback');assert.equal(feedback.status,200);assert.ok(Array.isArray(JSON.parse(feedback.body).feedback));console.log('PASS existing feedback GET; no deployed feedback written');
assert.equal(get('/api/admin').status,401);assert.equal(get('/.netlify/functions/admin').status,401);console.log('PASS protected admin API and direct function');
if(new URL(base).hostname!=='127.0.0.1'&&new URL(base).hostname!=='localhost') {
 const scheduled=get('/.netlify/functions/admin-monitor');assert.ok([401,403,404,405].includes(scheduled.status),'Scheduled function must not be publicly invokable');console.log('PASS scheduler URL protection');
}
