import type { Metadata } from "next";

interface Params {
  "part-number": string;
}

export const revalidate = 14400; // ISR: 4h

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const partNumber = params["part-number"];
  return {
    title: `Référence ${partNumber}`,
    description: `Comparez les prix pour la référence pièce ${partNumber} sur Torqued.`,
    alternates: { canonical: `/pieces/ref/${partNumber}` },
  };
}

export default async function PartRefPage({ params }: { params: Params }) {
  const partNumber = params["part-number"];

  // TODO: fetch listings by normalized part number from Supabase

  return (
    <main>
      <h1>Référence : {partNumber}</h1>
      {/* TODO: PartCard with cross-references and offer rows */}
    </main>
  );
}
