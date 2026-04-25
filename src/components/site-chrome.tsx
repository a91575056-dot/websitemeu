import type { PropsWithChildren } from "react";

import { getWhatsAppLink, siteConfig } from "@/data/site";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StickyWhatsApp } from "./sticky-whatsapp";

export function SiteChrome({ children }: PropsWithChildren) {
  return (
    <>
      <SiteHeader
        navItems={siteConfig.navItems}
        siteName={siteConfig.name}
        whatsappHref={getWhatsAppLink()}
      />
      <main>{children}</main>
      <SiteFooter />
      <StickyWhatsApp />
    </>
  );
}
