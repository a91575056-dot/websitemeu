import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { isIP } from 'node:net';

export function publicIPv4(address) {
 if(isIP(address)!==4) return false;
 const [a,b]=address.split('.').map(Number);
 return !(a===0 || a===10 || a===127 || a>=224 || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&(b===168||b===0||b===2||b===88)) || (a===100&&b>=64&&b<=127) || (a===198&&(b===18||b===19||b===51)) || (a===203&&b===0));
}
export function createCheckSite(resolveDNS=lookup, sendRequest=request) {
 return async function checkSite(input) {
 const started=Date.now();
 try {
  const url=new URL(input);
  if(url.protocol!=='https:' || url.port || url.username || url.password || url.hostname==='localhost') throw new Error('URL nepermis');
  const addresses=await Promise.race([resolveDNS(url.hostname,{all:true,family:4}),new Promise((_,reject)=>setTimeout(()=>reject(new Error('DNS timeout')),3000))]);
  if(!addresses.length || addresses.some(x=>!publicIPv4(x.address))) throw new Error('Adresă privată sau rezervată');
  const address=addresses[0];
  const status=await new Promise((resolve,reject)=>{
   // Pin the validated address: a second DNS lookup cannot redirect into an internal network.
   const req=sendRequest(url,{method:'HEAD',autoSelectFamily:false,lookup:(_host,_options,callback)=>callback(null,address.address,4),headers:{'User-Agent':'DionisWeb-Monitor/1.0'},timeout:5000},res=>{res.resume();resolve(res.statusCode);});
   req.on('timeout',()=>req.destroy(new Error('Timeout'))); req.on('error',reject); req.end();
  });
  // Redirects are reported, never followed to unvalidated destinations.
  return {at:new Date().toISOString(),status,ok:status>=200&&status<400,latencyMs:Date.now()-started,message:status>=300&&status<400?'Redirecționare (destinația nu a fost verificată)':`HTTP ${status}`};
 } catch { return {at:new Date().toISOString(),status:0,ok:false,latencyMs:Date.now()-started,message:'Conexiune eșuată, timeout sau adresă nepermisă'}; }
};
}
export const checkSite=createCheckSite();
