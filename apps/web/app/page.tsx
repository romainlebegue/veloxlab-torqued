import { Logo } from "@/components/ui/logo";
import { SearchHero } from "@/components/home/search-hero";

const STATS = [
  { value: "5 234", label: "références" },
  { value: "512",   label: "véhicules" },
  { value: "5",     label: "vendeurs certifiés" },
  { value: "FR · DE · UK · ES", label: "marchés" },
];

const CATEGORIES = [
  {
    slug: "disques-de-frein",
    name: "Disques de frein",
    count: 1240,
    description: "Neuf OEM / OES / IAM et pièces recyclées certifiées REC",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="17" stroke="var(--coral)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="7" fill="var(--coral-bg)" stroke="var(--coral)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="2.5" fill="var(--coral)" />
        <line x1="20" y1="3" x2="20" y2="10" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="30" x2="20" y2="37" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="20" x2="10" y2="20" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="20" x2="37" y2="20" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    slug: "alternateurs",
    name: "Alternateurs",
    count: 980,
    description: "Neuf toutes marques et reconditionné garanti 12 mois",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="17" stroke="var(--coral)" strokeWidth="1.5" />
        <path d="M14 22l4-8 4 6 3-4 3 6" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="20" r="3" fill="var(--coral)" />
      </svg>
    ),
  },
  {
    slug: "phares",
    name: "Phares",
    count: 760,
    description: "Optiques originaux et équivalents homologués CE",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <ellipse cx="16" cy="20" rx="10" ry="14" stroke="var(--coral)" strokeWidth="1.5" />
        <path d="M16 10 Q28 14 30 20 Q28 26 16 30" fill="var(--coral-bg)" stroke="var(--coral)" strokeWidth="1.5" />
        <line x1="26" y1="20" x2="37" y2="20" stroke="var(--coral)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="25" y1="15" x2="34" y2="11" stroke="var(--coral)" strokeWidth="1" strokeLinecap="round" />
        <line x1="25" y1="25" x2="34" y2="29" stroke="var(--coral)" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>

      {/* Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 border-b"
        style={{
          height: 56,
          background: "rgba(247,247,245,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--border)",
        }}
      >
        <Logo size={28} />
        <div className="flex items-center gap-4">
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "var(--coral)",
              background: "var(--coral-bg)",
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            prototype
          </span>
          <a
            href="/demo/seller-tool"
            className="text-ink-light hover:text-ink transition-colors"
            style={{ fontSize: 13 }}
          >
            Outil vendeur →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="flex flex-col items-center text-center pt-20 pb-16 px-5"
        style={{ background: "var(--bg-warm)" }}
      >
        <SearchHero />
      </div>

      {/* Stats bar */}
      <div
        className="border-y"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
      >
        <div
          className="page-container flex items-center justify-around"
          style={{ padding: "20px var(--space-5)" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span
                className="font-sans font-semibold text-ink"
                style={{ fontSize: 20, letterSpacing: "-0.02em" }}
              >
                {s.value}
              </span>
              <span className="text-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="page-container pt-16 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading" style={{ fontSize: 22 }}>
            Catégories phares
          </h2>
          <span className="text-label">3 catégories · démo prototype</span>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {CATEGORIES.map((cat) => (
            <a
              key={cat.slug}
              href={`/fr/categorie/${cat.slug}`}
              className="card group block no-underline"
              style={{ textDecoration: "none" }}
            >
              <div className="card-body flex flex-col gap-4" style={{ padding: "var(--space-6)" }}>
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 56, height: 56, background: "var(--coral-bg)" }}
                >
                  {cat.icon}
                </div>
                <div>
                  <h3
                    className="font-sans font-medium text-ink mb-1"
                    style={{ fontSize: 16, letterSpacing: "-0.01em" }}
                  >
                    {cat.name}
                  </h3>
                  <p className="text-body" style={{ fontSize: 13 }}>
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <span className="text-label">
                    {cat.count.toLocaleString("fr-FR")} références
                  </span>
                  <span className="text-coral" style={{ fontSize: 13, fontWeight: 500 }}>
                    Parcourir →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t text-center py-8"
        style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      >
        <p className="text-label">
          Torqued · prototype · données de démonstration uniquement
        </p>
      </footer>

    </div>
  );
}
