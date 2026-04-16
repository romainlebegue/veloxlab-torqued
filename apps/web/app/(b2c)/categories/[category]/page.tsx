import type { Metadata } from "next";

interface Params {
  category: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const category = params.category;
  return {
    title: `${category} — toutes marques`,
    description: `Comparez les prix de ${category} pour toutes marques sur Torqued.`,
    alternates: { canonical: `/categories/${category}` },
  };
}

export default async function CategoryIndexPage({
  params,
}: {
  params: Params;
}) {
  const { category } = params;

  // TODO: fetch top listings per make for this category

  return (
    <main>
      <h1>{category}</h1>
      {/* TODO: make/model filter + part cards */}
    </main>
  );
}
