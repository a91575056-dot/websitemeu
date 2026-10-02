'use client';
import { useEffect } from 'react';
export function SiteAnalytics(){
 useEffect(()=>{
  if(location.pathname.startsWith('/admin')||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
  const path=location.pathname.replace(/\/$/,'')||'/';
  function send(event:string){if(document.visibilityState==='hidden'&&event==='pageview')return;void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),path,event,utmSource:new URLSearchParams(location.search).get('utm_source'),utmMedium:new URLSearchParams(location.search).get('utm_medium'),utmCampaign:new URLSearchParams(location.search).get('utm_campaign'),referrer:document.referrer?new URL(document.referrer).origin:''}),keepalive:true}).catch(()=>{});}
  send('pageview');
  function click(e:MouseEvent){const a=(e.target as Element)?.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(/wa.me|api.whatsapp.com|whatsapp:/.test(href))send('whatsapp_click');else if(/^(mailto:|tel:)|#contact$/.test(href))send('contact_click');}
  function quote(){send('quote_start');}
  window.addEventListener('dionis-quote-start',quote);
  function checkout(){send('checkout_start');}
  document.addEventListener('click',click);window.addEventListener('dionis-checkout-start',checkout);
  return()=>{window.removeEventListener('dionis-quote-start',quote);document.removeEventListener('click',click);window.removeEventListener('dionis-checkout-start',checkout);};
 },[]);
 return null;
}
