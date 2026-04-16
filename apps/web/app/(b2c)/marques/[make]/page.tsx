import type { Metadata } from "next";

interface Params {
  make: string;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const make = params.make;
  return {
    title: `Pièces ${make}`,
    description: `Comparez les prix de toutes les pièces pour ${make} sur Torqued.`,
    alternates: { canonical: `/marques/${make}` },
  };
}

export default async function MakePage({ params }: { params: Params }) {
  const { make } = params;

  // TODO: fetch models for this make

  return (
    <main>
      <h1>Pièces {make}</h1>
      {/* TODO: model list grid */}
    </main>
  );
}
