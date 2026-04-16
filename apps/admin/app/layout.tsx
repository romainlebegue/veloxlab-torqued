import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PartFinder Admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 bg-gray-900 text-gray-100 shrink-0 flex flex-col">
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-sm font-bold text-white">PartFinder</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {[
                { href: "/",          label: "Dashboard" },
                { href: "/ranking",   label: "Règles de ranking" },
                { href: "/scrapers",  label: "Jobs scrapers" },
                { href: "/sellers",   label: "Vendeurs" },
                { href: "/listings",  label: "Listings" },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
