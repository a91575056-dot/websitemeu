import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Code2,
  Gauge,
  LayoutTemplate,
  MessageCircle,
  MousePointer2,
  PanelsTopLeft,
  PencilRuler,
  RefreshCcw,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
} from "lucide-react";

import { PayPalCheckout } from "@/components/paypal-checkout";
import { ProjectCard } from "@/components/project-card";
import { QuickQuoteForm } from "@/components/quick-quote-form";
import { SchemaScript } from "@/components/schema-script";
import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyWhatsApp } from "@/components/sticky-whatsapp";
import {
  aboutHighlights,
  faqs,
  getWhatsAppLink,
  heroMetrics,
  portfolioProjects,
  pricing,
  processSteps,
  reasons,
  services,
  siteConfig,
  testimonials,
  trustPoints,
  type IconKey,
} from "@/data/site";

const iconMap: Record<IconKey, LucideIcon> = {
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
  brief: ClipboardList,
  design: PencilRuler,
  develop: Code2,
  review: Search,
  launch: Rocket,
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
  const homeNavItems = siteConfig.showPortfolio
    ? siteConfig.navItems
    : siteConfig.navItems.filter(
        (item) => item.href !== "/#portfolio" && item.href !== "/portfolio",
      );

  return (
    <>
      <SchemaScript data={[serviceSchema, personSchema, websiteSchema]} />
      <SiteHeader
        navItems={homeNavItems}
        siteName={siteConfig.name}
        whatsappHref={getWhatsAppLink()}
      />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
            <SectionReveal className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div className="space-y-8">
                <div className="space-y-5">
                  <span className="eyebrow">Freelance web designer</span>
                  <div className="space-y-4">
                    <h1 className="font-display max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl">
                      {siteConfig.heroHeadline}
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                      {siteConfig.heroSubheadline}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="button-primary"
                  >
                    <MessageCircle className="size-4" />
                    Chat on WhatsApp
                  </a>
                  {siteConfig.showPortfolio ? (
                    <Link href="#portfolio" className="button-secondary">
                      View My Work
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <Link href="#services" className="button-secondary">
                      View Services
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>

                <p className="text-sm font-medium tracking-[0.12em] text-slate-500 uppercase">
                  {siteConfig.trustMicrocopy}
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {heroMetrics.map((item) => (
                    <div key={item.label} className="panel p-5">
                      <p className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {trustPoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-slate-600 sm:text-base"
                    >
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="panel hero-glow noise-grid relative overflow-hidden p-5 sm:p-7">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_55%)]" />

                  <div className="relative space-y-5">
                    <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-3 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.75)]">
                      <div className="overflow-hidden rounded-[1.55rem] bg-white">
                        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                          <span className="size-2.5 rounded-full bg-rose-400" />
                          <span className="size-2.5 rounded-full bg-amber-400" />
                          <span className="size-2.5 rounded-full bg-emerald-400" />
                          <span className="ml-3 rounded-full bg-white px-3 py-1 text-[11px] font-medium tracking-[0.24em] text-slate-500 uppercase">
                            Launch-ready website
                          </span>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">
                          <div className="rounded-[1.7rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)] p-6 text-white">
                            <p className="text-xs font-semibold tracking-[0.26em] text-white/75 uppercase">
                              Landing pages from $40
                            </p>
                            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                              Built to look premium, feel fast, and convert.
                            </h2>
                            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2.5 text-sm font-medium text-white/90">
                              <MessageCircle className="size-4" />
                              WhatsApp-first inquiry
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">
                            {[
                              "Clear offer sections",
                              "Tablet and mobile polished",
                              "SEO-ready architecture",
                            ].map((item) => (
                              <div
                                key={item}
                                className="rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-600"
                              >
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                          Lead flow
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
                          WhatsApp-first
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Faster replies and less friction for new inquiries.
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                          UX focus
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
                          Mobile-first
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Clean responsive behavior across phones, tablets, and desktops.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <section id="services" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal>
              <SectionHeading
                eyebrow="Services"
                title="Everything you need to launch a fast, modern website."
                description="Each service is designed to keep the process simple, professional, and focused on inquiries. The goal is always the same: make your brand look sharper and easier to trust online."
              />
            </SectionReveal>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {services.map((service, index) => {
                const Icon = iconMap[service.icon];

                return (
                  <SectionReveal key={service.title} delay={index * 0.04}>
                    <article className="panel h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="mt-5 font-display text-xl font-semibold text-slate-950">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
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
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="panel grid gap-10 overflow-hidden p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div className="space-y-5">
                <span className="eyebrow">Why choose me</span>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Premium execution without agency complexity.
                </h2>
                <p className="text-base leading-7 text-slate-600 sm:text-lg">
                  I focus on the essentials that matter for freelancers, local
                  businesses, startups, and creators: good design, smooth mobile
                  use, fast delivery, and direct communication.
                </p>
                <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_110%)] p-6 text-white">
                  <p className="text-xs font-semibold tracking-[0.24em] text-white/70 uppercase">
                    Positioned for value
                  </p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    Websites and landing pages starting from $40.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                    Affordable enough to launch quickly, polished enough to make
                    your business feel established.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {reasons.map((reason) => {
                  const Icon = iconMap[reason.icon];

                  return (
                    <div key={reason.title} className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-5">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-slate-950">
                        {reason.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {reason.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionReveal>
          </div>
        </section>

        {siteConfig.showPortfolio ? (
          <section id="portfolio" className="section-border scroll-mt-28">
            <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
              <SectionReveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                  eyebrow="Portfolio"
                  title="Realistic project concepts built to feel polished and credible."
                  description="These examples show the kind of premium direction I can create for landing pages, local businesses, restaurants, product promos, and personal brands."
                />
                <Link href="/portfolio" className="button-secondary">
                  Explore full portfolio
                  <ArrowRight className="size-4" />
                </Link>
              </SectionReveal>

              <div className="mt-10 space-y-6">
                {portfolioProjects.map((project, index) => (
                  <SectionReveal key={project.slug} delay={index * 0.04}>
                    <ProjectCard project={project} priority={index < 2} />
                  </SectionReveal>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="about" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div className="panel relative overflow-hidden p-6 sm:p-8">
                <div className="absolute inset-0 hero-glow opacity-80" />
                <div className="relative rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.76)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-100">
                    <Image
                      src="/dionis.png"
                      alt="Portrait of Dionis, freelance web designer"
                      fill
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      className="object-cover object-top"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/25 bg-slate-950/35 px-4 py-3 backdrop-blur-sm">
                      <p className="font-display text-lg font-semibold text-white">
                        Dionis Grecu
                      </p>
                      <p className="text-sm text-white/85">
                        Freelance Web Designer
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Focus
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        Clean, high-trust design
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Approach
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">
                        Friendly and direct collaboration
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <SectionHeading
                  eyebrow="About"
                  title="I build websites that help smaller brands look more established online."
                  description="I’m a freelance web designer focused on landing pages and business websites that feel clean, fast, mobile-friendly, and professional. The mission is simple: give businesses and creators a polished online presence without making the process expensive or complicated."
                />

                <p className="text-base leading-8 text-slate-600 sm:text-lg">
                  Whether you need a fast one-page launch, a redesign, or a
                  simple business website, I shape each project around clarity,
                  responsiveness, and trust. Good design should feel effortless
                  for the visitor and practical for the business owner.
                </p>

                <div className="grid gap-3">
                  {aboutHighlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-white/72 px-4 py-4"
                    >
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal>
              <SectionHeading
                eyebrow="Process"
                title="A simple workflow that keeps projects moving."
                description="You do not need a complicated agency process to get a strong website. The workflow stays streamlined, collaborative, and easy to understand."
                align="center"
              />
            </SectionReveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-5">
              {processSteps.map((step, index) => {
                const Icon = iconMap[step.icon];

                return (
                  <SectionReveal key={step.title} delay={index * 0.05}>
                    <article className="panel h-full p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          <Icon className="size-5" />
                        </div>
                        <span className="font-display text-xl text-slate-300">
                          0{index + 1}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-xl font-semibold text-slate-950">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {step.description}
                      </p>
                    </article>
                  </SectionReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Pricing"
                title="Accessible starting prices with a premium presentation."
                description="The goal is to make professional website design available without making the final result feel cheap. Starting prices are clear, while custom work stays flexible."
              />
              <a
                href={getWhatsAppLink("Hi Dionis, I would like a quote for a website project.")}
                target="_blank"
                rel="noreferrer"
                className="button-primary"
              >
                <MessageCircle className="size-4" />
                Ask for a quote
              </a>
            </SectionReveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {pricing.map((plan, index) => (
                <SectionReveal key={plan.title} delay={index * 0.05}>
                  <article
                    className={`panel h-full p-7 ${
                      plan.featured
                        ? "border border-emerald-200 ring-1 ring-emerald-200/70"
                        : ""
                    }`}
                  >
                    {plan.featured ? (
                      <span className="eyebrow mb-5">Most requested</span>
                    ) : null}
                    <div className="space-y-3">
                      <h3 className="font-display text-2xl font-semibold text-slate-950">
                        {plan.title}
                      </h3>
                      <p className="font-display text-4xl font-semibold tracking-tight text-slate-950">
                        {plan.price}
                      </p>
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                          <span className="text-sm leading-6 text-slate-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <a
                      href={getWhatsAppLink(
                        `Hi Dionis, I am interested in the ${plan.title.toLowerCase()} package.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="button-secondary mt-8"
                    >
                      Chat about this option
                      <ArrowRight className="size-4" />
                    </a>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="payment" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-6">
                <SectionHeading
                  eyebrow="Payment"
                  title="A simple PayPal deposit flow for confirmed projects."
                  description="Once we agree on the scope, you can secure your project slot with a deposit through PayPal. The checkout is handled by PayPal, while the site only confirms the selected deposit."
                />

                <div className="grid gap-3">
                  {[
                    "Good for landing pages, redesigns, and small business websites.",
                    "Choose a deposit only after we confirm the project together.",
                    "Card and PayPal wallet options are handled through PayPal checkout.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-white/72 px-4 py-4"
                    >
                      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-7 text-slate-600 sm:text-base">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <PayPalCheckout />
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal>
              <SectionHeading
                eyebrow="Testimonials"
                title="Feedback that feels believable because the work is practical."
                description="These sample testimonials reflect the kinds of businesses and founders this service is built for: local brands, creators, and small teams that need a cleaner online presence."
                align="center"
              />
            </SectionReveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <SectionReveal key={testimonial.author} delay={index * 0.04}>
                  <article className="panel h-full p-7">
                    <div className="flex gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-5 text-base leading-8 text-slate-700">
                      “{testimonial.quote}”
                    </p>
                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <p className="font-display text-lg font-semibold text-slate-950">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </article>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="FAQ"
                  title="Clear answers before you get started."
                  description="If you want to move quickly, the easiest path is to send a WhatsApp message with your idea, target audience, and any style references you like."
                />
                <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_120%)] p-6 text-white">
                  <p className="font-display text-2xl font-semibold tracking-tight">
                    Fast, modern, mobile-ready.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                    Perfect if you need a landing page only, a simple business
                    site, or a full refresh that feels more current.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {faqs.map((item) => (
                  <details key={item.question} className="group panel p-6">
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
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>

        <section id="contact" className="section-border scroll-mt-28">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
              <div className="space-y-6">
                <SectionHeading
                  eyebrow="Contact"
                  title="Tell me what you need and I'll help shape the right website."
                  description="The fastest path is WhatsApp, but you can also use email. Share your business type, the page you need, and your ideal style, and I can guide you from there."
                />

                <div className="panel space-y-5 p-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                      Primary contact
                    </p>
                    <p className="mt-2 font-display text-2xl font-semibold text-slate-950">
                      WhatsApp
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Best for quick replies, direct feedback, and simple project
                      coordination.
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
                      <span className="block text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Email
                      </span>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="mt-2 block font-semibold text-slate-950"
                      >
                        {siteConfig.email}
                      </a>
                    </div>
                    <div className="rounded-[1.25rem] border border-slate-200 bg-white/80 px-4 py-4">
                      <span className="block text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Availability
                      </span>
                      <p className="mt-2 font-semibold text-slate-950">
                        Open for landing pages, lean business sites, and redesigns
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <QuickQuoteForm />
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
            <SectionReveal className="panel overflow-hidden p-8 sm:p-10 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="space-y-5">
                  <span className="eyebrow">Final CTA</span>
                  <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                    Let’s build your website.
                  </h2>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    Websites and landing pages starting from $40, designed to
                    feel modern, premium, fast, and ready for real inquiries.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={getWhatsAppLink("Hi Dionis, I want to start my website project.")}
                      target="_blank"
                      rel="noreferrer"
                      className="button-primary"
                    >
                      <MessageCircle className="size-4" />
                      Chat on WhatsApp
                    </a>
                    {siteConfig.showPortfolio ? (
                      <Link href="/portfolio" className="button-secondary">
                        View portfolio
                        <ArrowRight className="size-4" />
                      </Link>
                    ) : (
                      <Link href="#contact" className="button-secondary">
                        Start now
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    "Premium look",
                    "Mobile-ready build",
                    "Clear call to action",
                    "Fast loading setup",
                  ].map((item) => (
                    <div key={item} className="rounded-[1.5rem] border border-slate-200 bg-white/82 px-5 py-5">
                      <p className="font-display text-xl font-semibold text-slate-950">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        <SiteFooter />
      </main>

      <StickyWhatsApp />
    </>
  );
}

