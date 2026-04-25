import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, Star } from "lucide-react";

import { FeedbackForm } from "@/components/feedback/feedback-form";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Leave public feedback about your collaboration with Dionis Web.",
  alternates: {
    canonical: "/feedback",
  },
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid w-full max-w-[104rem] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-16">
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="size-4" />
            Back to dionisweb.com
          </Link>

          <div className="space-y-5">
            <span className="eyebrow">Dionis Web Feedback</span>
            <h1 className="font-display max-w-2xl text-4xl font-semibold text-slate-950 sm:text-5xl">
              Leave feedback about our collaboration.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Your feedback will appear publicly on the Dionis Web review page
              and helps future clients understand what the process feels like.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
              <MessageSquareText className="size-5 text-teal-700" />
              <p className="mt-3 font-display text-xl font-semibold text-slate-950">
                Quick and direct
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Write what mattered most: communication, design, speed, or the
                final result.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <p className="mt-3 font-display text-xl font-semibold text-slate-950">
                Public on {siteConfig.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your review stays connected to dionisweb.com and can be viewed
                by anyone who receives the link.
              </p>
            </div>
          </div>
        </div>

        <FeedbackForm />
      </section>
    </main>
  );
}
