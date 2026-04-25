import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { ProjectVisual } from "@/components/project-visual";
import { SchemaScript } from "@/components/schema-script";
import { SectionReveal } from "@/components/section-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyWhatsApp } from "@/components/sticky-whatsapp";
import { getWhatsAppLink, portfolioProjects, siteConfig } from "@/data/site";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getProject(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}

export async function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {
      title: "Project not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/portfolio/${project.slug}`;
  const socialTitle = `${project.seoTitle} | ${siteConfig.name}`;
  const socialImageAlt = `${project.title} project by ${siteConfig.name}`;

  return {
    title: project.seoTitle,
    description: project.seoDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: socialTitle,
      description: project.seoDescription,
      url: canonicalPath,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: socialImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: project.seoDescription,
      images: [
        {
          url: "/opengraph-image",
          alt: socialImageAlt,
        },
      ],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.seoDescription,
    creator: {
      "@type": "Person",
      name: siteConfig.personName,
    },
    url: `${siteConfig.siteUrl}/portfolio/${project.slug}`,
  };

  return (
    <>
      <SchemaScript data={projectSchema} />
      <SiteHeader
        navItems={siteConfig.navItems}
        siteName={siteConfig.name}
        whatsappHref={getWhatsAppLink()}
      />

      <main>
        <section className="section-border">
          <div className="mx-auto w-full max-w-[104rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <SectionReveal className="space-y-8">
              <div className="flex flex-wrap gap-4">
                <Link href="/portfolio" className="button-secondary">
                  <ArrowLeft className="size-4" />
                  Back to portfolio
                </Link>
                <a
                  href={getWhatsAppLink(
                    `Hi Dionis, I saw the ${project.title} project and I would like something similar.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary"
                >
                  <MessageCircle className="size-4" />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div className="space-y-6">
                  <span className="eyebrow">{project.category}</span>
                  <div className="space-y-4">
                    <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                      {project.title}
                    </h1>
                    <p className="text-lg leading-8 text-slate-600 sm:text-xl">
                      {project.tagline}
                    </p>
                    <p className="text-base leading-8 text-slate-600 sm:text-lg">
                      {project.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="panel p-5">
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Audience
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {project.audience}
                      </p>
                    </div>
                    <div className="panel p-5">
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Timeline
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {project.timeline}
                      </p>
                    </div>
                    <div className="panel p-5">
                      <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                        Starting point
                      </p>
                      <p className="mt-2 font-semibold text-slate-950">
                        {project.priceLabel}
                      </p>
                    </div>
                  </div>
                </div>

                <ProjectVisual project={project} priority />
              </div>
            </SectionReveal>
          </div>
        </section>

        <section className="section-border">
          <div className="mx-auto grid w-full max-w-[104rem] gap-8 px-4 py-18 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
            <SectionReveal className="space-y-6">
              <div className="panel p-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Challenge
                </p>
                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  {project.challenge}
                </p>
              </div>

              <div className="panel p-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Solution
                </p>
                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  {project.solution}
                </p>
              </div>

              <div className="panel p-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Result
                </p>
                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  {project.result}
                </p>
              </div>
            </SectionReveal>

            <SectionReveal className="space-y-6">
              <div className="panel p-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Deliverables
                </p>
                <div className="mt-5 space-y-3">
                  {project.deliverables.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span className="text-sm leading-6 text-slate-600 sm:text-base">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel p-7">
                <p className="text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
                  Industries
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.industries.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_120%)] p-7 text-white">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  Want a similar direction for your business?
                </p>
                <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                  I can create a premium website or landing page with the same
                  level of clarity, polish, and mobile-first performance.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <a
                    href={getWhatsAppLink(
                      `Hi Dionis, I want a website inspired by ${project.title}.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="button-secondary bg-white text-slate-950"
                  >
                    Start on WhatsApp
                    <ArrowRight className="size-4" />
                  </a>
                  <Link href="/pricing" className="button-secondary border-white/20 bg-white/10 text-white">
                    View pricing
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>
      </main>

      <SiteFooter />
      <StickyWhatsApp />
    </>
  );
}
