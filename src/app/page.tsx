import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleDollarSign,
  Clock3,
  Gauge,
  LayoutTemplate,
  MessageCircle,
  MousePointer2,
  PanelsTopLeft,
  RefreshCcw,
  Search,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";

import { SchemaScript } from "@/components/schema-script";
import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import {
  getWhatsAppLink,
  heroMetrics,
  pricing,
  reasons,
  services,
  siteConfig,
  testimonials,
  trustPoints,
  type IconKey,
} from "@/data/site";

const iconMap: Partial<Record<IconKey, LucideIcon>> = {
  layout: LayoutTemplate,
  business: Building2,
  mobile: Smartphone,
  redesign: RefreshCcw,
  onepage: PanelsTopLeft,
  conversion: MousePointer2,
  seo: Search,
  whatsapp: MessageCircle,
  fast: Clock3,
  modern: Sparkles,
  affordable: CircleDollarSign,
  experience: Gauge,
  communication: MessageCircle,
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${siteConfig.name} by ${siteConfig.personName}`,
  alternateName: siteConfig.alternateNames,
  description: siteConfig.description,
  url: siteConfig.siteUrl,
  areaServed: "Worldwide",
  priceRange: "$40+",
  email: siteConfig.email,
  founder: {
    "@type": "Person",
    name: siteConfig.personName,
    jobTitle: siteConfig.role,
    url: siteConfig.siteUrl,
    sameAs: siteConfig.socials.map((social) => social.href),
  },
  brand: {
    "@type": "Brand",
    name: siteConfig.name,
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.personName,
  alternateName: siteConfig.alternateNames,
  jobTitle: siteConfig.role,
  url: siteConfig.siteUrl,
  image: `${siteConfig.siteUrl}/dionis.png`,
  description: siteConfig.description,
  knowsAbout: siteConfig.keywords,
  sameAs: siteConfig.socials.map((social) => social.href),
  worksFor: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.siteUrl,
  },
  brand: {
    "@type": "Brand",
    name: siteConfig.name,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.alternateNames,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  creator: {
    "@type": "Person",
    name: siteConfig.personName,
  },
  publisher: {
    "@type": "Person",
    name: siteConfig.personName,
  },
};

export default function Home() {
  const previewServices = services.slice(0, 4);
  const proofPoints = reasons.slice(0, 3);
  const featuredPlan = pricing.find((plan) => plan.featured) ?? pricing[0];

  return (
    <>
      <SchemaScript data={[serviceSchema, personSchema, websiteSchema]} />
      <SiteChrome>
        <section className="relative overflow-hidden">
          <div className="mx-auto grid w-full max-w-[104rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.78fr] lg:items-center lg:px-8 lg:py-18">
            <SectionReveal className="space-y-8">
              <div className="space-y-5">
                <span className="eyebrow">Dionis Grecu - Freelance web developer</span>
                <div className="space-y-4">
                  <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                    Premium websites that look established from day one.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                    I build fast, mobile-first landing pages and business
                    websites for small brands, creators, and local companies.
                    Launch packages start from $40.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary justify-center"
                >
                  <MessageCircle className="size-4" />
                  Start on WhatsApp
                </a>
                <Link href="/services" className="button-secondary justify-center">
                  View services
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {heroMetrics.map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-white/78 p-4">
                    <p className="font-display text-2xl font-semibold text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-2">
                {trustPoints.slice(0, 2).map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600 sm:text-base">
                    <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </SectionReveal>

            <SectionReveal delay={0.08} className="panel hero-glow relative overflow-hidden p-5 sm:p-6">
              <div className="relative rounded-[1.35rem] border border-white/70 bg-white/78 p-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <Image
                    src="/dionis.png"
                    alt="Dionis Grecu, freelance web developer"
                    fill
                    sizes="(max-width: 1024px) 100vw, 36vw"
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/42 via-transparent to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/25 bg-slate-950/45 px-4 py-3 backdrop-blur-sm">
                    <p className="font-display text-lg font-semibold text-white">
                      Dionis Grecu
                    </p>
                    <p className="text-sm text-white/85">Dionis Web</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {["Landing pages", "Business websites", "Website redesigns"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/82 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {item}
                        <ArrowRight className="size-4 text-slate-400" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <SectionReveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Services"
                title="The core pages small businesses actually need."
                description="Most projects do not need a huge website. They need a clear offer, a premium first impression, mobile polish, and an easy path to contact you."
              />
              <Link href="/services" className="button-secondary">
                All services
                <ArrowRight className="size-4" />
              </Link>
            </SectionReveal>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {previewServices.map((service, index) => {
                const Icon = iconMap[service.icon] ?? LayoutTemplate;

                return (
                  <SectionReveal key={service.title} delay={index * 0.04}>
                    <article className="h-full rounded-lg border border-slate-200 bg-white/82 p-5">
                      <div className="flex size-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                        <Icon className="size-5" />
                      </div>
                      <h2 className="mt-4 font-display text-xl font-semibold text-slate-950">
                        {service.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {service.description}
                      </p>
                    </article>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid w-full max-w-[104rem] gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-18">
            <SectionReveal className="rounded-lg bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_120%)] p-7 text-white">
              <span className="text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">
                Starting point
              </span>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">
                {featuredPlan.title} websites from $40.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                A clean, fast, mobile-ready page with the right structure for
                trust, clarity, and inquiries.
              </p>
              <Link href="/pricing" className="button-secondary mt-6 border-white/20 bg-white text-slate-950">
                See pricing
                <ArrowRight className="size-4" />
              </Link>
            </SectionReveal>

            <SectionReveal delay={0.08} className="grid gap-4 sm:grid-cols-3">
              {proofPoints.map((reason) => {
                const Icon = iconMap[reason.icon] ?? Gauge;

                return (
                  <div key={reason.title} className="rounded-lg border border-slate-200 bg-white/82 p-5">
                    <Icon className="size-5 text-teal-700" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-slate-950">
                      {reason.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {reason.description}
                    </p>
                  </div>
                );
              })}
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid w-full max-w-[104rem] gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-8 lg:py-18">
            <SectionReveal className="space-y-5">
              <span className="eyebrow">Client feedback</span>
              <h2 className="font-display max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Built to make smaller brands feel more credible online.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                The goal is simple: make your business easier to trust, easier
                to understand, and easier to contact.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/feedbacks" className="button-secondary justify-center">
                  View feedback
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/contact" className="button-primary justify-center">
                  Start a project
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.08} className="rounded-lg border border-slate-200 bg-white/82 p-6">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-5 text-base leading-8 text-slate-700">
                &ldquo;{testimonials[0].quote}&rdquo;
              </p>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="font-display text-lg font-semibold text-slate-950">
                  {testimonials[0].author}
                </p>
                <p className="text-sm text-slate-500">{testimonials[0].role}</p>
              </div>
            </SectionReveal>
          </div>
        </section>
      </SiteChrome>
    </>
  );
}
