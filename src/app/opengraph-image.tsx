import { ImageResponse } from "next/og";

import { siteConfig } from "@/data/site";

export const dynamic = "force-static";

export const alt = `${siteConfig.name} website preview`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "52px",
          background:
            "linear-gradient(135deg, #f8f4ed 0%, #fff9f3 48%, #f4efe8 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: "36px",
            padding: "44px",
            border: "1px solid rgba(15,23,42,0.08)",
            background:
              "radial-gradient(circle at top left, rgba(15,118,110,0.16), transparent 36%), radial-gradient(circle at bottom right, rgba(196,125,79,0.18), transparent 30%), rgba(255,255,255,0.82)",
            boxShadow: "0 24px 80px rgba(15,23,42,0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  color: "white",
                  background: "linear-gradient(135deg, #0f172a, #0f766e)",
                }}
              >
                DG
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700 }}>
                  {siteConfig.name}
                </span>
                <span style={{ fontSize: "16px", color: "#475569" }}>
                  {siteConfig.role}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.86)",
                fontSize: "18px",
                color: "#475569",
              }}
            >
              Websites and landing pages from $40
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "20px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#64748b",
              }}
            >
              Premium freelance web design
            </div>
            <div
              style={{
                fontSize: "64px",
                lineHeight: 1.04,
                letterSpacing: "-0.04em",
                fontWeight: 700,
                maxWidth: "860px",
              }}
            >
              Modern websites that feel premium, fast, and ready to convert.
            </div>
            <div
              style={{
                fontSize: "26px",
                lineHeight: 1.45,
                color: "#475569",
                maxWidth: "780px",
              }}
            >
              Mobile-first design for small businesses, creators, and local
              brands, with direct WhatsApp lead flow and SEO-ready structure.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "14px",
              color: "#0f172a",
              fontSize: "20px",
            }}
          >
            {["Fast delivery", "Mobile-first", "WhatsApp-ready", "SEO-minded"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "999px",
                    padding: "12px 18px",
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(15,23,42,0.08)",
                  }}
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
