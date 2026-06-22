import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import Chat from "@/components/Chat";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://meladobyguluna.com";
const TITLE = "Melado by Guluna | Artisan Ice Cream in University Town, Peshawar";
const DESC =
  "Handcrafted artisan ice cream and pure fruit popsicles in University Town, Peshawar. Open till 1 AM. New Mingora, Swat branch soon.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s | Melado by Guluna",
  },
  description: DESC,
  applicationName: "Melado by Guluna",
  keywords: [
    "Melado by Guluna",
    "ice cream Peshawar",
    "ice cream University Town",
    "popsicles Peshawar",
    "best ice cream Peshawar",
    "Melado",
    "Guluna",
    "Mingora Swat ice cream",
  ],
  authors: [{ name: "Melado by Guluna" }],
  creator: "Melado by Guluna",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "Melado by Guluna",
    title: TITLE,
    description: DESC,
    url: "/",
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
  appleWebApp: {
    capable: true,
    title: "Melado",
    statusBarStyle: "default",
  },
  category: "food",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3A1224",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "IceCreamShop",
  name: "Melado by Guluna",
  image: `${SITE}/media/guluna/3914393213153081028.jpg`,
  url: SITE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "B1, Old Jamrud Road, near Bitani Plaza",
    addressLocality: "University Town, Peshawar",
    addressRegion: "Khyber Pakhtunkhwa",
    postalCode: "25000",
    addressCountry: "PK",
  },
  geo: { "@type": "GeoCoordinates", latitude: 33.9981, longitude: 71.4947 },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "12:00",
      closes: "01:00",
    },
  ],
  servesCuisine: ["Ice Cream", "Gelato", "Popsicles"],
  priceRange: "$$",
  sameAs: ["https://www.instagram.com/meladobyguluna/"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=zodiak@400,700,900&f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Chat />
        <ServiceWorkerRegister />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
