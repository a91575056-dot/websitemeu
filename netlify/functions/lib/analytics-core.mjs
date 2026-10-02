import { createHmac } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { fail } from './admin-core.mjs';
export const paths=['/','/feedback','/feedbacks','/payment-success','/payment-cancel'];
export const events=['pageview','whatsapp_click','contact_click','checkout_start'];
export const analyticsStore=context=>getStore({name:context?.deploy&&!context.deploy.published?`analytics-preview-${context.deploy.id}`:'dionis-analytics-v1',consistency:'strong'});
const digest=(value)=>createHmac('sha256',process.env.ADMIN_PASSWORD_HASH||'').update(value).digest('hex');
export function classifySource(value,origin) {
 try {const u=new URL(value);if(u.origin===origin)return 'intern';const h=u.hostname;if(/(^|\.)google\.[a-z.]+$/.test(h))return 'Google';if(/(^|\.)(bing.com|duckduckgo.com)$/.test(h))return 'Căutare';if(/(^|\.)(facebook.com|instagram.com|linkedin.com|t.co|twitter.com|x.com)$/.test(h))return 'Social';return 'Alt site';}catch{return 'Direct / necunoscut';}
}
export async function recordEvent(db,body,request,context) {
 if(!process.env.ADMIN_PASSWORD_HASH)fail('Măsurarea nu este configurată.',503);
 if(!body||!paths.includes(body.path)||!events.includes(body.event)||!/^[-a-f0-9]{36}$/.test(body.id||''))fail('Eveniment invalid.');
 const ua=request.headers.get('user-agent')||'';
 if(/bot|crawler|spider|headless/i.test(ua)||request.headers.get('dnt')==='1'||request.headers.get('sec-gpc')==='1')return {ok:true,ignored:true};
 const day=new Date().toISOString().slice(0,10),identity=digest(`${day}|${context?.ip||'unknown'}|${ua}`),shard=parseInt(identity.slice(0,2),16)%16;
 const key=`days/${day}/${shard}.json`,now=Date.now(),minute=Math.floor(now/60000);
 const device=/ipad|tablet/i.test(ua)?'Tabletă':/mobile|android|iphone/i.test(ua)?'Mobil':'Desktop / altul';
 const source=classifySource(body.referrer,new URL(request.url).origin);
 for(let attempt=0;attempt<8;attempt++){
  const item=await db.getWithMetadata(key,{type:'json'});
  const d=item?.data||{day,pageviews:0,visitors:{},pages:{},sources:{},devices:{},events:{},ids:[]};
  if(d.ids.includes(body.id))return {ok:true};
  const previous=d.visitors[identity];const count=previous?.minute===minute?previous.count+1:1;if(count>60)fail('Prea multe evenimente.',429);
  if(!previous&&Object.keys(d.visitors).length>=10000)fail('Capacitate zilnică atinsă.',429);
  d.visitors[identity]={minute,count};d.ids=[body.id,...d.ids].slice(0,2000);
  d.events[body.event]=(d.events[body.event]||0)+1;
  if(body.event==='pageview') {d.pageviews++;for(const [field,label] of [['pages',body.path],['sources',source],['devices',device]])d[field][label]=(d[field][label]||0)+1;}
  const saved=await db.setJSON(key,d,item?{onlyIfMatch:item.etag}:{onlyIfNew:true});if(saved.modified){await db.setJSON('installed',{at:new Date(now).toISOString()},{onlyIfNew:true});return {ok:true};}
 }
 fail('Măsurare ocupată. Reîncearcă.',503);
}
export async function analyticsReport(db,days) {
 days=Number(days||7);if(![7,30,90].includes(days))fail('Perioadă invalidă.');
 const installed=await db.get('installed',{type:'json'}),daily=[];
 const report={installedAt:installed?.at||null,days,pageviews:0,dailyUniqueSum:0,pages:{},sources:{},devices:{},events:{},daily};
 for(let i=days-1;i>=0;i--)daily.push({day:new Date(Date.now()-i*86400000).toISOString().slice(0,10),pageviews:0,unique:0});
 const {blobs}=await db.list({prefix:'days/'});const wanted=new Set(daily.map(x=>x.day));
 const selected=blobs.filter(x=>wanted.has(x.key.split('/')[1]));
 // Bound read concurrency; never return hashes, IPs, event IDs or user agents to the browser.
 for(let start=0;start<selected.length;start+=16){const batch=await Promise.all(selected.slice(start,start+16).map(x=>db.get(x.key,{type:'json'})));for(const d of batch){if(!d)continue;const day=daily.find(x=>x.day===d.day);const unique=Object.keys(d.visitors).length;day.pageviews+=d.pageviews;day.unique+=unique;report.pageviews+=d.pageviews;report.dailyUniqueSum+=unique;for(const field of ['pages','sources','devices','events'])for(const [key,n] of Object.entries(d[field]))report[field][key]=(report[field][key]||0)+n;}}
 return report;
}
export async function cleanupAnalytics(db){const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10);const {blobs}=await db.list({prefix:'days/'});for(const b of blobs)if(b.key.split('/')[1]<=cutoff)await db.delete(b.key);}
