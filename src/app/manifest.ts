import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dionis Grecu | Dionis Web",
    short_name: "Dionis Web",
    description:
      "Dionis Grecu freelance web developer portfolio for landing pages and business websites.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f4ed",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
