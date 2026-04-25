import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";

import { QuickQuoteForm } from "@/components/quick-quote-form";
import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import { getWhatsAppLink, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Dionis Grecu for a landing page, business website, redesign, or mobile-first website project.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <SiteChrome>
      <section className="mx-auto grid w-full max-w-[104rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:px-8 lg:py-18">
        <SectionReveal className="space-y-6">
          <SectionHeading
            eyebrow="Contact"
            title="Tell me what you need and I will help shape the right website."
            description="The fastest path is WhatsApp, but you can also use email. Share your business type, the page you need, and your ideal style."
          />

          <div className="grid gap-4">
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 bg-white/82 p-5"
            >
              <MessageCircle className="size-5 text-teal-700" />
              <p className="mt-3 font-display text-xl font-semibold text-slate-950">
                WhatsApp
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Best for quick replies, project details, and simple feedback.
              </p>
            </a>

            <a
              href={`mailto:${siteConfig.email}`}
              className="rounded-lg border border-slate-200 bg-white/82 p-5"
            >
              <Mail className="size-5 text-teal-700" />
              <p className="mt-3 font-display text-xl font-semibold text-slate-950">
                {siteConfig.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Useful if you prefer to send references, content, or a longer
                project brief.
              </p>
            </a>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.06}>
          <QuickQuoteForm />
        </SectionReveal>
      </section>
    </SiteChrome>
  );
}
