import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VinDecoder } from "@/components/search/vin-decoder";
import { decodeVinLocal } from "@/lib/vin";

interface Params {
  vin: string;
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  return {
    title: `VIN ${params.vin}`,
    description: `Trouvez les pièces compatibles avec le VIN ${params.vin} sur Torqued.`,
    robots: { index: false },   // VIN pages not indexed (privacy + no SEO value)
  };
}

export default async function VinPage({ params }: { params: Params }) {
  const vin = params.vin.toUpperCase();
  const local = decodeVinLocal(vin);

  // Server-side: try Supabase lookup and redirect immediately if match found
  if (local.isValid && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      const { data } = await supabase
        .from("vehicles")
        .select("make, model, year_from")
        .contains("vin_prefix", [vin.slice(0, 3)])
        .order("year_from", { ascending: false })
        .limit(1)
        .returns<{ make: string; model: string; year_from: number }[]>()
        .maybeSingle();

      if (data) {
        const makeSlug  = data.make.toLowerCase().replace(/\s+/g, "-");
        const modelSlug = data.model.toLowerCase().replace(/[\s/]+/g, "-");
        redirect(`/pieces/${makeSlug}/${modelSlug}/${data.year_from}`);
      }
    } catch {
      // Supabase not connected — fall through to client-side decoder
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center">
          <a href="/" className="text-lg font-bold text-blue-700">
            Torqued
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Recherche par VIN
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Nous identifions votre véhicule et trouvons les pièces compatibles.
        </p>

        {/* Show local decode preview if VIN is in URL */}
        {local.isValid && local.make && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <p className="font-medium text-blue-900">{local.make}</p>
            <p className="text-blue-700 mt-0.5">
              {local.modelYear && <span>Année modèle : {local.modelYear}</span>}
              {local.country && <span className="ml-2">· {local.country}</span>}
            </p>
            <p className="text-blue-400 mt-1 font-mono text-xs">{vin}</p>
          </div>
        )}

        {!local.isValid && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
            {local.error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <VinDecoder />
        </div>
      </main>
    </div>
  );
}
