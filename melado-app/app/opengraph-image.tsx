import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Melado by Guluna, artisan ice cream in University Town, Peshawar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const iconData = readFileSync(join(process.cwd(), "public/icons/icon-512.png"));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FBECF0",
          padding: "72px 90px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              color: "#6E545C",
              textTransform: "uppercase",
            }}
          >
            University Town, Peshawar
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 96,
              fontWeight: 800,
              color: "#2A1B22",
              lineHeight: 1,
            }}
          >
            Melado
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              fontStyle: "italic",
              color: "#B81A56",
              lineHeight: 1.02,
            }}
          >
            by Guluna
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#3A1224" }}>
            Artisan ice cream and pure fruit popsicles. Open till 1 AM.
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} width={320} height={320} alt="" />
      </div>
    ),
    { ...size }
  );
}
