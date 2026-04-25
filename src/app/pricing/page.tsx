import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, MessageCircle } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteChrome } from "@/components/site-chrome";
import { getWhatsAppLink, pricing } from "@/data/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Website and landing page pricing from Dionis Grecu, with launch-ready packages starting from $40.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-[104rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-18">
        <SectionReveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Pricing"
            title="Clear starting points for fast, polished launches."
            description="Pricing stays accessible so small businesses and creators can launch professionally without agency complexity."
          />
          <a
            href={getWhatsAppLink("Hi Dionis, I would like a quote for a website project.")}
            target="_blank"
            rel="noreferrer"
            className="button-primary justify-center"
          >
            <MessageCircle className="size-4" />
            Ask for a quote
          </a>
        </SectionReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricing.map((plan, index) => (
            <SectionReveal key={plan.title} delay={index * 0.04}>
              <article
                className={`h-full rounded-lg border bg-white/82 p-7 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.55)] ${
                  plan.featured
                    ? "border-emerald-200 ring-1 ring-emerald-200/70"
                    : "border-slate-200"
                }`}
              >
                {plan.featured ? <span className="eyebrow mb-5">Most requested</span> : null}
                <h2 className="font-display text-2xl font-semibold text-slate-950">
                  {plan.title}
                </h2>
                <p className="mt-3 font-display text-4xl font-semibold text-slate-950">
                  {plan.price}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {plan.description}
                </p>

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
      </section>
    </SiteChrome>
  );
}
