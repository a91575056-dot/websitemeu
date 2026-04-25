import type { MetadataRoute } from "next";

import { portfolioProjects, siteConfig } from "@/data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.92 },
    { path: "/about", priority: 0.9 },
    { path: "/pricing", priority: 0.88 },
    { path: "/faq", priority: 0.72 },
    { path: "/contact", priority: 0.86 },
    { path: "/feedbacks", priority: 0.74 },
    { path: "/feedback", priority: 0.6 },
  ].map((route) => ({
    url: `${siteConfig.siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));

  const projectRoutes = portfolioProjects.map((project) => ({
    url: `${siteConfig.siteUrl}/portfolio/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    {
      url: `${siteConfig.siteUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...projectRoutes,
  ];
}
