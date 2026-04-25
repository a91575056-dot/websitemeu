import type { Metadata } from "next";
import type { Viewport } from "next";

import { siteConfig } from "@/data/site";

import "./globals.css";

const manrope = { variable: "--font-manrope" };
const spaceGrotesk = { variable: "--font-space-grotesk" };
const sharedSocialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${siteConfig.personName} and ${siteConfig.name} website preview`,
};
const sameAs = siteConfig.socials.map((social) => social.href);

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.personName} - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} by ${siteConfig.personName}`,
  authors: [{ name: siteConfig.personName, url: siteConfig.siteUrl }],
  creator: siteConfig.personName,
  publisher: `${siteConfig.personName} / ${siteConfig.name}`,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
  category: "web design",
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_US",
    images: [sharedSocialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        alt: sharedSocialImage.alt,
      },
    ],
  },
  icons: {
    icon: [{ url: "/icon.png?v=4", type: "image/png" }],
    shortcut: "/icon.png?v=4",
    apple: "/apple-icon.png?v=4",
  },
  other: {
    author: siteConfig.personName,
    designer: siteConfig.personName,
    developer: siteConfig.personName,
    owner: siteConfig.personName,
    brand: siteConfig.name,
    "profile:first_name": "Dionis",
    "profile:last_name": "Grecu",
    "article:author": sameAs[0],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
