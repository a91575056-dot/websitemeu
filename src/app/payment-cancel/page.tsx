import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyWhatsApp } from "@/components/sticky-whatsapp";
import { getWhatsAppLink, siteConfig } from "@/data/site";

export default function PaymentCancelPage() {
  return (
    <>
      <SiteHeader
        navItems={siteConfig.navItems}
        siteName={siteConfig.name}
        whatsappHref={getWhatsAppLink()}
      />

      <main>
        <section className="section-border">
          <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-18 sm:px-6 lg:px-8">
            <div className="panel w-full p-7 text-center sm:p-10">
              <span className="eyebrow">Payment cancelled</span>
              <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                No payment was completed.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                You can return to the site or message me if you want to adjust
                the deposit amount before paying.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={getWhatsAppLink("Hi Dionis, I want to discuss the PayPal deposit.")}
                  target="_blank"
                  rel="noreferrer"
                  className="button-primary justify-center"
                >
                  <MessageCircle className="size-4" />
                  Message on WhatsApp
                </a>
                <Link href="/#payment" className="button-secondary justify-center">
                  <ArrowLeft className="size-4" />
                  Back to payment
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>

      <StickyWhatsApp />
    </>
  );
}
