import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function Offline() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 16,
        padding: 24,
        background: "var(--bg)",
        color: "var(--ink)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" width={72} height={72} />
      <h1 className="serif" style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)", fontWeight: 900 }}>
        You{"’"}re offline
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "42ch" }}>
        No connection right now. Melado by Guluna is in University Town, Peshawar, open
        every day until 1 AM. Reconnect and refresh to see the reels.
      </p>
      <a className="btn pink" href="/" style={{ marginTop: 8 }}>
        Try again
      </a>
    </main>
  );
}
