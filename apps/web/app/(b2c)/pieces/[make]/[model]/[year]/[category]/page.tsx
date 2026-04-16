import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductJsonLd } from "@/components/part/product-json-ld";
import { PartCard } from "@/components/part/part-card";
import { SortTabs } from "@/components/search/sort-tabs";
import { VehicleSearchBar } from "@/components/search/vehicle-search-bar";
import { searchByFitment } from "@/lib/search";
import { MOCK_GROUPS } from "@/lib/mock-data";

interface Params {
  make: string;
  model: string;
  year: string;
  category: string;
}

export const revalidate = 14400; // ISR: 4h

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
  { slug: "disques-de-frein",    label: "Disques de frein" },
  { slug: "plaquettes-de-frein", label: "Plaquettes" },
  { slug: "amortisseurs",        label: "Amortisseurs" },
  { slug: "filtres",             label: "Filtres" },
  { slug: "bougies",             label: "Bougies" },
  { slug: "courroie-distribution", label: "Courroie distrib." },
  { slug: "batterie",            label: "Batterie" },
  { slug: "embrayage",           label: "Embrayage" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { sort?: string; page?: string };
}) {
  const { make, model, year, category } = params;

  // Use real API if Supabase is configured, otherwise fall back to mock data
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

  const makeLabel     = make.replace(/-/g, " ");
  const modelLabel    = model.replace(/-/g, " ");
  const categoryLabel = category.replace(/-/g, " ");
  const canonicalUrl  = `/pieces/${make}/${model}/${year}/${category}`;
  const topGroup      = groups[0];
  const allOffers     = groups.flatMap((g) => g.offers);

  return (
    <>
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
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
          <a href="/" className="text-lg font-bold text-blue-700 tracking-tight shrink-0">
            Torqued
          </a>
          <div className="flex-1 hidden md:block">
            <VehicleSearchBar
              defaultValues={{ make, model, year, category }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        {/* Left sidebar — part families */}
        <aside className="w-52 shrink-0 hidden lg:block">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Catégories
          </p>
          <nav className="flex flex-col gap-0.5">
            {PART_FAMILIES.map(({ slug, label }) => (
              <a
                key={slug}
                href={`/pieces/${make}/${model}/${year}/${slug}`}
                className={`px-3 py-2 rounded-lg text-sm transition-colors
                  ${slug === category
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5 flex-wrap capitalize">
            <a href="/" className="hover:text-gray-600">Accueil</a>
            <span>/</span>
            <a href={`/marques/${make}`} className="hover:text-gray-600">{makeLabel}</a>
            <span>/</span>
            <a href={`/pieces/${make}/${model}/${year}`} className="hover:text-gray-600">
              {modelLabel} {year}
            </a>
            <span>/</span>
            <span className="text-gray-600">{categoryLabel}</span>
          </nav>

          <h1 className="text-xl font-bold text-gray-900 mb-1 capitalize">
            {categoryLabel} — {makeLabel} {modelLabel} {year}
          </h1>
          <p className="text-sm text-gray-500 mb-4">
            {groups.length} référence{groups.length > 1 ? "s" : ""} · {allOffers.length} offre{allOffers.length > 1 ? "s" : ""} comparées
          </p>

          {/* Sort tabs */}
          <div className="mb-4">
            <Suspense>
              <SortTabs />
            </Suspense>
          </div>

          {/* Part cards */}
          <div className="space-y-3">
            {groups.map((group) => (
              <PartCard key={group.part_number_normalized} group={group} />
            ))}
          </div>

          {useMock && (
            <p className="mt-6 text-center text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg py-2 px-4">
              Mode démo — données mockées. Connectez Supabase pour les vraies données.
            </p>
          )}
        </main>
      </div>
    </>
  );
}
