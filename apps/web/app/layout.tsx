import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
