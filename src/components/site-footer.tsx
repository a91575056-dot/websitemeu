import Image from "next/image";
import Link from "next/link";

import { getWhatsAppLink, siteConfig } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/85">
      <div className="mx-auto grid w-full max-w-[104rem] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.7fr_0.7fr] lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex items-center justify-center">
              <Image
                src="/logo-trim.png"
                alt="Dionis Web logo"
                width={337}
                height={311}
                className="h-7 w-auto object-contain sm:h-10"
              />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-slate-950">
                {siteConfig.name}
              </span>
              <span className="text-sm text-slate-500">{siteConfig.role}</span>
            </span>
          </Link>
          <p className="max-w-md text-sm leading-7 text-slate-600">
            Premium websites and landing pages for small businesses, personal
            brands, creators, and local services. Modern design, mobile-first
            performance, and direct WhatsApp communication.
          </p>
          <p className="text-sm text-slate-500">
            SEO-friendly, fast-loading website design from $40.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-slate-400 uppercase">
            Quick Links
          </p>
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/services">Services</Link>
            <Link href="/about">About</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/feedbacks">Feedback</Link>
            {siteConfig.showPortfolio ? <Link href="/portfolio">Portfolio</Link> : null}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-slate-400 uppercase">
            Contact
          </p>
          <div className="flex flex-col gap-3 text-sm text-slate-600">
            <a href={getWhatsAppLink()} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            {siteConfig.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-[104rem] flex-col gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            (c) {new Date().getFullYear()} {siteConfig.name}. Freelance web
            design, landing page design, and affordable business website
            creation.
          </p>
        </div>
      </div>
    </footer>
  );
}

