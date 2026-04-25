import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import { faqs } from "@/data/site";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about website timelines, mobile-friendly design, redesigns, SEO basics, WhatsApp buttons, and landing pages.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return (
    <SiteChrome>
      <section className="mx-auto grid w-full max-w-[104rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-18">
        <SectionReveal className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <SectionHeading
            eyebrow="FAQ"
            title="Clear answers before you get started."
            description="Here are the questions clients usually ask before starting a landing page, business website, or redesign."
          />
          <Link href="/contact" className="button-primary">
            Start a project
            <ArrowRight className="size-4" />
          </Link>
        </SectionReveal>

        <div className="space-y-4">
          {faqs.map((item, index) => (
            <SectionReveal key={item.question} delay={index * 0.03}>
              <details className="group rounded-lg border border-slate-200 bg-white/82 p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                  <span className="font-display text-lg font-semibold text-slate-950">
                    {item.question}
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {item.answer}
                </p>
              </details>
            </SectionReveal>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
