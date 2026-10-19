import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/env";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Hardworker Construction — Kıbrıs'ta Satılık Daire Projeleri",
    template: "%s | Hardworker Construction",
  },
  description:
    "Kuzey Kıbrıs Gazimağusa'da modern yaşam projeleri. Luxera Salamis, Sunrise Platinium ve Diamond projelerinde satılık daireler, kat planları ve ödeme planları.",
  keywords: [
    "Kıbrıs satılık daire", "KKTC emlak", "Gazimağusa daire",
    "Luxera Salamis", "Sunrise Platinium", "Kıbrıs yatırım",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Hardworker Construction",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#126fb2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} antialiased`}
        style={
          {
            "--font-display-stack": `var(--font-display), ui-sans-serif, system-ui, sans-serif`,
            "--font-sans-stack": `var(--font-sans), ui-sans-serif, system-ui, sans-serif`,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
