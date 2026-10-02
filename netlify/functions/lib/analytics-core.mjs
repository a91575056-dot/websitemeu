import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { getStore } from '@netlify/blobs';
import { fail } from './admin-core.mjs';
export const paths=['/','/feedback','/feedbacks','/payment-success','/payment-cancel'];
export const events=['pageview','whatsapp_click','contact_click','checkout_start','quote_start'];
export const analyticsStore=context=>getStore({name:context?.deploy&&!context.deploy.published?`analytics-preview-${context.deploy.id}`:'dionis-analytics-v1',consistency:'strong'});
const digest=(value)=>createHmac('sha256',process.env.ADMIN_PASSWORD_HASH||'').update(value).digest('hex');
export function visitorLocation(context) {
 const text=value=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,100):'';
 const geo=context?.geo;
 return {ip:isIP(context?.ip||'')?context.ip:'',country:text(geo?.country?.name)||'Necunoscută',countryCode:/^[A-Z]{2}$/.test(geo?.country?.code||'')?geo.country.code:'',city:text(geo?.city)||'Necunoscut',region:text(geo?.subdivision?.name)};
}
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
 let campaign=[body.utmSource,body.utmMedium,body.utmCampaign].map(v=>typeof v==='string'&&/^[a-zA-Z0-9_. -]{1,64}$/.test(v)?v:'').join(' / ').replace(/^[ /]+|[ /]+$/g,'');
 if(['__proto__','constructor','prototype'].includes(campaign))campaign='';
 const source=classifySource(body.referrer,new URL(request.url).origin);
 for(let attempt=0;attempt<8;attempt++){
  const item=await db.getWithMetadata(key,{type:'json'});
  const d=item?.data||{day,pageviews:0,visitors:{},pages:{},sources:{},devices:{},events:{},ids:[]};
  if(d.ids.includes(body.id))return {ok:true};
  const previous=d.visitors[identity];const count=previous?.minute===minute?previous.count+1:1;if(count>60)fail('Prea multe evenimente.',429);
  if(!previous&&Object.keys(d.visitors).length>=10000)fail('Capacitate zilnică atinsă.',429);
  const location=visitorLocation(context),at=new Date(now).toISOString();
  d.visitors[identity]={...previous,minute,count,...location,firstSeen:previous?.firstSeen||at,lastSeen:at,pageviews:(previous?.pageviews||0)+(body.event==='pageview'?1:0),clicks:(previous?.clicks||0)+(['whatsapp_click','contact_click'].includes(body.event)?1:0)};d.ids=[body.id,...d.ids].slice(0,2000);
  d.events[body.event]=(d.events[body.event]||0)+1;
  d.pageEvents??={};const pe=d.pageEvents[body.path]??={};pe[body.event]=(pe[body.event]||0)+1;
  if(body.event==='pageview') {d.pageviews++;for(const [field,label] of [['pages',body.path],['sources',source],['devices',device],['countries',location.country],['cities',`${location.city} · ${location.country}`]]){d[field]??={};d[field][label]=(d[field][label]||0)+1;}}
  if(body.event==='pageview'&&campaign){d.campaigns??={};const tag=Object.keys(d.campaigns).length<100||campaign in d.campaigns?campaign:'Alte campanii';d.campaigns[tag]=(d.campaigns[tag]||0)+1;}
  const saved=await db.setJSON(key,d,item?{onlyIfMatch:item.etag}:{onlyIfNew:true});if(saved.modified){await db.setJSON('installed',{at},{onlyIfNew:true});await db.setJSON('locations-installed',{at},{onlyIfNew:true});return {ok:true};}
 }
 fail('Măsurare ocupată. Reîncearcă.',503);
}
export async function analyticsReport(db,days,offset=0) {
 days=Number(days||7);if(![7,30,90].includes(days))fail('Perioadă invalidă.');
 const installed=await db.get('installed',{type:'json'}),daily=[];
 const locationsInstalled=await db.get('locations-installed',{type:'json'}),connections=new Map();
 const report={installedAt:installed?.at||null,locationsInstalledAt:locationsInstalled?.at||null,days,pageviews:0,dailyUniqueSum:0,pages:{},sources:{},devices:{},events:{},countries:{},cities:{},connections:[],connectionCount:0,campaigns:{},pageEvents:{},daily};
 for(let i=days-1;i>=0;i--)daily.push({day:new Date(Date.now()-(i+offset)*86400000).toISOString().slice(0,10),pageviews:0,unique:0});
 const {blobs}=await db.list({prefix:'days/'});const wanted=new Set(daily.map(x=>x.day));
 const selected=blobs.filter(x=>wanted.has(x.key.split('/')[1]));
 // Bound read concurrency; never return hashes, IPs, event IDs or user agents to the browser.
 for(let start=0;start<selected.length;start+=16){const batch=await Promise.all(selected.slice(start,start+16).map(x=>db.get(x.key,{type:'json'})));for(const d of batch){if(!d)continue;const day=daily.find(x=>x.day===d.day);const unique=Object.keys(d.visitors).length;day.pageviews+=d.pageviews;day.unique+=unique;report.pageviews+=d.pageviews;report.dailyUniqueSum+=unique;for(const field of ['pages','sources','devices','events','countries','cities','campaigns'])for(const [key,n] of Object.entries(d[field]||{}))report[field][key]=(report[field][key]||0)+n;
  for(const [path,ev] of Object.entries(d.pageEvents||{})){report.pageEvents[path]??={};for(const [event,n] of Object.entries(ev))report.pageEvents[path][event]=(report.pageEvents[path][event]||0)+n;}
  for(const v of Object.values(d.visitors)){if(!v.ip)continue;const previous=connections.get(v.ip);const latest=!previous||v.lastSeen>previous.lastSeen?v:previous;connections.set(v.ip,{ip:v.ip,country:latest.country,countryCode:latest.countryCode,city:latest.city,region:latest.region,firstSeen:previous&&previous.firstSeen<v.firstSeen?previous.firstSeen:v.firstSeen,lastSeen:latest.lastSeen,pageviews:(previous?.pageviews||0)+(v.pageviews||0),clicks:(previous?.clicks||0)+(v.clicks||0)});}
 }}
 report.connectionCount=connections.size;report.connections=[...connections.values()].sort((a,b)=>b.lastSeen.localeCompare(a.lastSeen)).slice(0,500);
 if(!offset){const previous=await analyticsReport(db,days,days);report.previous={pageviews:previous.pageviews,dailyUniqueSum:previous.dailyUniqueSum,events:previous.events,complete:Boolean(installed?.at&&installed.at.slice(0,10)<=previous.daily[0].day&&days*2<=90),from:previous.daily[0].day,to:previous.daily.at(-1).day};}
 return report;
}
export async function cleanupAnalytics(db){const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10);const {blobs}=await db.list({prefix:'days/'});for(const b of blobs)if(b.key.split('/')[1]<=cutoff)await db.delete(b.key);}
