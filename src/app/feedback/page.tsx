import type { Metadata } from 'next';
import { InvitedFeedback } from '@/components/feedback/invited-feedback';
export const metadata:Metadata={title:'Invitație review',robots:{index:false,follow:false}};
export default function Page(){return <main className="mx-auto max-w-3xl px-4 py-16"><InvitedFeedback/></main>;}
