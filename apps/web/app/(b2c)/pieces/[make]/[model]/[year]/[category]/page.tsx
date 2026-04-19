import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ProductJsonLd } from "@/components/part/product-json-ld";
import { SortTabs } from "@/components/search/sort-tabs";
import { VehicleSearchBar } from "@/components/search/vehicle-search-bar";
import { ResultsClient } from "@/components/search/results-client";
import { searchByFitment } from "@/lib/search";
import { MOCK_GROUPS } from "@/lib/mock-data";

interface Params {
  make: string;
  model: string;
  year: string;
  category: string;
}

export const revalidate = 14400;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { make, model, year, category } = params;
  const makeLabel     = make.replace(/-/g, " ");
  const modelLabel    = model.replace(/-/g, " ");
  const categoryLabel = category.replace(/-/g, " ");
  const canonical     = `/pieces/${make}/${model}/${year}/${category}`;

  return {
    title: `${categoryLabel} ${makeLabel} ${modelLabel} ${year}`,
    description:
      `Comparez les prix de ${categoryLabel} pour ${makeLabel} ${modelLabel} (${year}). ` +
      `Pièces neuves OEM, OES, IAM, d'occasion et REC certifiées sur Torqued.`,
    alternates: { canonical },
  };
}

const PART_FAMILIES = [
  { slug: "disques-de-frein",      label: "Disques de frein" },
  { slug: "plaquettes-de-frein",   label: "Plaquettes" },
  { slug: "amortisseurs",          label: "Amortisseurs" },
  { slug: "filtres",               label: "Filtres" },
  { slug: "bougies",               label: "Bougies" },
  { slug: "courroie-distribution", label: "Courroie distrib." },
  { slug: "batterie",              label: "Batterie" },
  { slug: "embrayage",             label: "Embrayage" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { sort?: string; page?: string };
}) {
  const { make, model, year, category } = params;

  const useMock = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  let groups = useMock
    ? MOCK_GROUPS
    : (
        await searchByFitment({
          make, model, year, category,
          sort: searchParams.sort,
          page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
        })
      )?.results ?? [];

  if (!groups.length) notFound();

  const makeLabel     = make.charAt(0).toUpperCase() + make.slice(1).replace(/-/g, " ");
  const modelLabel    = model.replace(/-/g, " ").toUpperCase();
  const categoryLabel = category.replace(/-/g, " ");
  const canonicalUrl  = `/pieces/${make}/${model}/${year}/${category}`;
  const topGroup      = groups[0];
  const allOffers     = groups.flatMap((g) => g.offers);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-warm)" }}>
      <ProductJsonLd
        name={`${categoryLabel} ${makeLabel} ${modelLabel} ${year}`}
        brandName={topGroup.brand_name}
        partNumber={topGroup.part_number_normalized}
        description={`${categoryLabel} compatible ${makeLabel} ${modelLabel} ${year}. Comparez ${groups.length} références sur Torqued.`}
        imageUrls={groups.map((g) => g.image_url).filter((u): u is string => u !== null).slice(0, 5)}
        offers={allOffers}
        canonicalUrl={canonicalUrl}
      />

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--bg)", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <Logo size={24} />
          </Link>
          <div style={{ flex: 1, maxWidth: 560 }}>
            <VehicleSearchBar defaultValues={{ make, model, year, category }} />
          </div>
          <div style={{ flex: 1 }} />
          <nav style={{ display: "flex", gap: 18 }}>
            <a href="/marques/volkswagen" style={{ fontSize: 13, color: "var(--ink-mid)", textDecoration: "none" }}>Marques</a>
            <a href="/categories/disques-de-frein" style={{ fontSize: 13, color: "var(--ink-mid)", textDecoration: "none" }}>Catégories</a>
            <a href="/pro/nouveau-devis" style={{ fontSize: 13, color: "var(--ink-mid)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Pro
              <span style={{ fontFamily: "var(--font-mono)", background: "var(--ink)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 9 }}>B2B</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Vehicle context bar */}
      <div style={{ background: "var(--bg)", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: 40, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-mid)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13l2-6h14l2 6v5h-3M3 13v5h3M3 13h18M6 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-mid)", letterSpacing: "0.04em" }}>
            {makeLabel} {modelLabel} {year}
          </span>
          <span style={{ color: "var(--border-mid)", fontSize: 12 }}>›</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", letterSpacing: "0.04em", textTransform: "capitalize" }}>
            {categoryLabel}
          </span>
          <div style={{ flex: 1 }} />
          {/* Category nav pills */}
          <div style={{ display: "flex", gap: 6, overflow: "hidden" }}>
            {PART_FAMILIES.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/pieces/${make}/${model}/${year}/${slug}`}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, padding: "3px 10px",
                  borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap",
                  background: slug === category ? "var(--ink)" : "transparent",
                  color: slug === category ? "#fff" : "var(--ink-light)",
                  border: slug === category ? "none" : "0.5px solid var(--border-mid)",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px 24px 80px" }}>
        {/* Sort bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-light)" }}>
            {groups.length} référence{groups.length > 1 ? "s" : ""} · {allOffers.length} offres
          </span>
          <Suspense>
            <SortTabs />
          </Suspense>
        </div>

        {/* Filter + results grid */}
        <ResultsClient groups={groups} />

        {useMock && (
          <p style={{
            marginTop: 24, textAlign: "center", fontSize: 12, color: "var(--coral)",
            background: "var(--coral-bg)", border: "0.5px solid rgba(232,65,42,0.2)",
            borderRadius: 8, padding: "8px 16px",
          }}>
            Mode démo — données mockées. Connectez Supabase pour les vraies données.
          </p>
        )}
      </div>
    </div>
  );
}
