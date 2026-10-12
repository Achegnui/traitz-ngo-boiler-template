import { ImageResponse } from "next/og";
import { palette, siteName } from "@/theme/brand.config";

export const ogSize = { width: 1200, height: 630 };

/** 1200x630 preview card in the brand palette. Used by every opengraph-image route. */
export function ogImage({ kicker, title }: { kicker: string; title: string }) {
  const p = palette();
  const size = title.length > 70 ? 56 : title.length > 40 ? 68 : 80;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#fff",
        background: `linear-gradient(135deg, ${p.anchor} 0%, ${p.anchor} 55%, ${p.accent} 160%)` }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: p.accent }}>{kicker}</div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: p.accent }} />
          {siteName()}
        </div>
      </div>
    ),
    ogSize,
  );
}
