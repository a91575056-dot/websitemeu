"use client";

import { ArrowRight, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { getWhatsAppLink, siteConfig } from "@/data/site";

const projectTypes = [
  "Landing page",
  "Business website",
  "Website redesign",
  "Personal brand site",
  "Restaurant or local business site",
];

const timelines = ["As soon as possible", "This week", "This month", "Flexible"];

export function QuickQuoteForm() {
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [timeline, setTimeline] = useState(timelines[0]);
  const [details, setDetails] = useState("");

  const [email,setEmail]=useState(''),[phone,setPhone]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const startedAt=useRef(0),submissionId=useRef('');
  useEffect(()=>{startedAt.current=Date.now();},[]);
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setBusy(true);setNotice('');
    try {
      submissionId.current ||= crypto.randomUUID();
      const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:submissionId.current,name,email,phone,business,projectType,timeline,details,consent,startedAt:startedAt.current,website:new FormData(event.currentTarget).get('website')})});
      const d=await r.json();if(!r.ok)throw Error(d.message);
      window.dispatchEvent(new Event('dionis-quote-start'));
      setNotice('Your request has been saved. Continue on WhatsApp below.');
      submissionId.current='';
    }catch(e){setNotice(e instanceof Error?e.message:'Please try again or contact us directly.');}finally{setBusy(false);}

  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-5 p-6 sm:p-7">
      <div className="space-y-2">
        <span className="eyebrow">Quick quote</span>
        <h3 className="font-display text-2xl font-semibold tracking-tight text-slate-950">
          Request a quote and get a fast reply.
        </h3>
        <p className="text-sm leading-6 text-slate-600 sm:text-base">
          Your request is securely sent to Dionis. You can also continue on WhatsApp after sending. Prefer
          email instead? Use{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Name
          <input
            required minLength={2} maxLength={160}
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="Your name"
            className="input-field"
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Business
          <input
            value={business}
            onChange={(event) => setBusiness(event.target.value)}
            type="text"
            placeholder="Your business or brand"
            className="input-field"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Project type
          <select
            value={projectType}
            onChange={(event) => setProjectType(event.target.value)}
            className="input-field"
          >
            {projectTypes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Timeline
          <select
            value={timeline}
            onChange={(event) => setTimeline(event.target.value)}
            className="input-field"
          >
            {timelines.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700">
        What do you need?
        <textarea
          required minLength={10} maxLength={2000}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={5}
          placeholder="Tell me about your service, offer, style, or goal."
          className="input-field min-h-32 resize-y"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">Email<input className="input-field" type="email" required maxLength={160} value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label className="space-y-2 text-sm font-medium text-slate-700">Phone (optional)<input className="input-field" type="tel" maxLength={60} value={phone} onChange={e=>setPhone(e.target.value)}/></label>
      </div>
      <label style={{display:'none'}} aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <label className="flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>I agree that Dionis may store my contact details and request to respond and prepare an offer. This does not subscribe me to marketing. I can request deletion by email.</label>
      {notice&&<p role="status" className="text-sm">{notice}</p>}
      {notice.startsWith('Your request has been saved')&&<a className="button-secondary" href={getWhatsAppLink(`Hi ${siteConfig.personName}, I sent a quote request. Name: ${name}. Email: ${email}. Project: ${projectType}. ${details}`)} target="_blank" rel="noopener noreferrer">Continue on WhatsApp</a>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button disabled={busy} type="submit" className="button-primary justify-center">
          <MessageCircle className="size-4" />
          {busy ? "Sending…" : "Send quote request"}
        </button>
        <a
          href={`mailto:${siteConfig.email}`}
          className="button-secondary justify-center"
        >
          Email instead
          <ArrowRight className="size-4" />
        </a>
      </div>
    </form>
  );
}
