import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProjectCard } from "@/components/project-card";
import { SectionHeading } from "@/components/section-heading";
import { SectionReveal } from "@/components/section-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyWhatsApp } from "@/components/sticky-whatsapp";
import { getWhatsAppLink, portfolioProjects, siteConfig } from "@/data/site";

const portfolioDescription =
  "Explore landing page and business website concepts for creators, local businesses, restaurants, service brands, and personal portfolios.";
const portfolioSocialTitle = `Portfolio | ${siteConfig.name}`;
const portfolioSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} portfolio preview`,
};

export const metadata: Metadata = {
  title: "Portfolio",
  description: portfolioDescription,
  alternates: {
    canonical: "/portfolio",
  },
  openGraph: {
    title: portfolioSocialTitle,
    description: portfolioDescription,
    url: "/portfolio",
    siteName: siteConfig.name,
    type: "website",
    images: [portfolioSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: portfolioSocialTitle,
    description: portfolioDescription,
    images: [
      {
        url: "/opengraph-image",
        alt: portfolioSocialImage.alt,
      },
    ],
  },
};

export default function PortfolioPage() {
  return (
    <>
      <SiteHeader
        navItems={siteConfig.navItems}
        siteName={siteConfig.name}
        whatsappHref={getWhatsAppLink()}
      />

      <main>
        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionReveal className="space-y-8">
              <Link href="/" className="button-secondary">
                <ArrowLeft className="size-4" />
                Back to home
              </Link>
              <SectionHeading
                eyebrow="Portfolio"
                title="Project concepts designed to look premium and convert."
                description="A focused collection of landing pages, service websites, restaurant pages, product promos, and personal brand concepts. Every example is designed to feel realistic, polished, and mobile-ready."
              />
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
      </main>

      <SiteFooter />
      <StickyWhatsApp />
    </>
  );
}

