import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Clock3,
  LayoutTemplate,
  MessageCircle,
  MousePointer2,
  PanelsTopLeft,
  RefreshCw,
  Search,
  Smartphone,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import { getWhatsAppLink, processSteps, services, siteConfig, type IconKey } from "@/data/site";

const iconMap: Partial<Record<IconKey, LucideIcon>> = {
  layout: LayoutTemplate,
  business: Building2,
  mobile: Smartphone,
  redesign: RefreshCw,
  onepage: PanelsTopLeft,
  conversion: MousePointer2,
  seo: Search,
  whatsapp: MessageCircle,
  fast: Clock3,
};

export const metadata: Metadata = {
  title: "Services",
  description:
    "Landing page design, business websites, redesigns, mobile-first layouts, SEO structure, and WhatsApp integration by Dionis Grecu.",
  alternates: {
    canonical: "/services",
  },
};

export default function ServicesPage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-[104rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-18">
        <SectionReveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading
            eyebrow="Services"
            title="Focused website services for fast, polished launches."
            description="Each service is built around practical outcomes: clear messaging, strong first impressions, mobile polish, and easy contact flow."
          />
          <div className="rounded-lg border border-slate-200 bg-white/78 p-5">
            <p className="font-display text-2xl font-semibold text-slate-950">
              Best for small businesses, creators, personal brands, local
              services, restaurants, and lean launches.
            </p>
          </div>
        </SectionReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] ?? LayoutTemplate;

            return (
              <SectionReveal key={service.title} delay={index * 0.03}>
                <article className="h-full rounded-lg border border-slate-200 bg-white/82 p-6 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.55)]">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold text-slate-950">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {service.description}
                  </p>
                </article>
              </SectionReveal>
            );
          })}
        </div>
      </section>

      <section className="section-border">
        <div className="mx-auto w-full max-w-[104rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
          <SectionReveal>
            <SectionHeading
              eyebrow="Process"
              title="A simple workflow that keeps the project moving."
              description="The process stays direct: define the goal, design the page, build it, review details, and launch."
              align="center"
            />
          </SectionReveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <SectionReveal key={step.title} delay={index * 0.04}>
                <article className="h-full rounded-lg border border-slate-200 bg-white/82 p-5">
                  <p className="font-display text-xl font-semibold text-slate-300">
                    0{index + 1}
                  </p>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal className="mt-8 rounded-lg bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_120%)] p-7 text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-3xl font-semibold">
                  Ready to shape the right website?
                </p>
                <p className="mt-2 text-sm leading-7 text-white/78 sm:text-base">
                  Send your idea and I will help choose the right page structure.
                </p>
              </div>
              <a
                href={getWhatsAppLink(
                  `Hi ${siteConfig.personName}, I want to discuss a website service.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="button-secondary justify-center border-white/20 bg-white text-slate-950"
              >
                Chat on WhatsApp
                <ArrowRight className="size-4" />
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>
    </SiteChrome>
  );
}
