import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Gauge, MessageCircle, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import { aboutHighlights, getWhatsAppLink, reasons, siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About Dionis Grecu",
  description:
    "About Dionis Grecu, freelance web developer behind Dionis Web, building modern landing pages and business websites.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <SiteChrome>
      <section className="mx-auto grid w-full max-w-[104rem] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:px-8 lg:py-18">
        <SectionReveal className="panel relative overflow-hidden p-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image
              src="/dionis.png"
              alt="Portrait of Dionis Grecu"
              fill
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/36 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/25 bg-slate-950/42 px-4 py-3 backdrop-blur-sm">
              <p className="font-display text-xl font-semibold text-white">
                {siteConfig.personName}
              </p>
              <p className="text-sm text-white/85">{siteConfig.role}</p>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal className="space-y-6" delay={0.06}>
          <SectionHeading
            eyebrow="About"
            title="I help smaller brands look more established online."
            description="Dionis Web is my focused web design and development studio for landing pages, lean business websites, and redesigns that feel clean, fast, and professional."
          />

          <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            The goal is to keep the process simple while giving your business a
            stronger first impression. I focus on structure, visual trust,
            mobile usability, and direct contact paths so visitors can quickly
            understand what you offer and message you.
          </p>

          <div className="grid gap-3">
            {aboutHighlights.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white/78 p-4">
                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/services" className="button-secondary justify-center">
              View services
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="button-primary justify-center"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
          </div>
        </SectionReveal>
      </section>

      <section className="section-border">
        <div className="mx-auto w-full max-w-[104rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <div className="grid gap-4 lg:grid-cols-3">
            {reasons.slice(0, 3).map((reason, index) => {
              const Icon = index === 0 ? Gauge : index === 1 ? Sparkles : MessageCircle;

              return (
                <SectionReveal key={reason.title} delay={index * 0.04}>
                  <article className="h-full rounded-lg border border-slate-200 bg-white/82 p-6">
                    <Icon className="size-6 text-teal-700" />
                    <h2 className="mt-5 font-display text-xl font-semibold text-slate-950">
                      {reason.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {reason.description}
                    </p>
                  </article>
                </SectionReveal>
              );
            })}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
