import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { FeedbackWall } from "@/components/feedback/feedback-wall";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Client Feedback",
  description: "Public client feedback for Dionis Web.",
  alternates: {
    canonical: "/feedbacks",
  },
  openGraph: {
    title: "Client Feedback | Dionis Web",
    description: "Public client feedback for Dionis Web.",
    url: `${siteConfig.siteUrl}/feedbacks`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default function FeedbacksPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto w-full max-w-[104rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
            >
              <ArrowLeft className="size-4" />
              dionisweb.com
            </Link>
            <div className="space-y-4">
              <span className="eyebrow">Client feedback</span>
              <h1 className="font-display max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl">
                Public feedback for Dionis Web.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Reviews left by clients after website, landing page, or
                redesign projects.
              </p>
            </div>
          </div>

          <a
            href={siteConfig.siteUrl}
            target="_blank"
            rel="noreferrer"
            className="button-secondary justify-center"
          >
            Main website
            <ExternalLink className="size-4" />
          </a>
        </div>

        <FeedbackWall />
      </section>
    </main>
  );
}
