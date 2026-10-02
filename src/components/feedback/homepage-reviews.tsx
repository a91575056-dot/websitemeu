'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
type Review={id:string;name:string;project:string;message:string;rating:number};
export function HomepageReviews(){const [reviews,setReviews]=useState<Review[]>([]);const [error,setError]=useState(false);
 useEffect(()=>{let active=true;fetch('/api/feedback',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{if(active)setReviews(d.feedback);}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[]);
 return <><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{reviews.slice(0,4).map(r=><article className="panel h-full p-7" key={r.id}><div className="flex gap-1 text-amber-500" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} className={`size-4 ${i<r.rating?'fill-current':'text-slate-300'}`} />)}</div><p className="mt-5 text-base leading-8 text-slate-700">“{r.message}”</p><div className="mt-6"><p className="font-display text-lg font-semibold">{r.name}</p><p className="text-sm text-slate-500">{r.project}</p></div></article>)}</div>{error&&<p className="mt-5 text-center">Reviews are temporarily unavailable.</p>}<div className="mt-6 flex justify-center gap-4"><Link href="/feedbacks" className="button-secondary">View reviews</Link><Link href="/feedback" className="button-secondary">Leave feedback</Link></div></>;
}
