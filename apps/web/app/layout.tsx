import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Torqued — Comparateur de pièces auto",
    template: "%s | Torqued",
  },
  description:
    "Comparez les prix de pièces automobiles neuves, d'occasion et recyclées sur Torqued. Recherche par VIN ou véhicule. Livraison en France, Allemagne, UK, Espagne.",
  metadataBase: new URL("https://torqued.veloxlab.co"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: "Torqued",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>{children}</body>
    </html>
  );
}
