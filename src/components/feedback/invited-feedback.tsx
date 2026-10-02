"use client";
import {useEffect,useState} from 'react';
import {FeedbackForm} from './feedback-form';
export function InvitedFeedback(){
 const [token,setToken]=useState(''),[state,setState]=useState('loading');
 useEffect(()=>{const value=new URLSearchParams(window.location.hash.slice(1)).get('invitation')||'';fetch('/api/feedback',{cache:'no-store',headers:{'X-Review-Invitation':value||'invalid'}}).then(r=>{if(r.ok){setToken(value);setState('valid');}else setState('invalid');}).catch(()=>setState('invalid'));},[]);
 if(state==='loading')return <p>Verificăm invitația…</p>;
 if(state!=='valid')return <><h1>Review-uri numai prin invitație</h1><p>Formularul public a fost închis. Folosește invitația individuală primită de la Dionis. Invitațiile expirate sau utilizate nu mai acceptă trimiteri.</p></>;
 return <><h1 className="mb-6 text-3xl">Review despre colaborarea noastră</h1><FeedbackForm invitation={token}/></>;
}
