/**
 * Ranking rules editor — reads/writes ranking_rules table.
 * Weights are NEVER sent to the browser — this is a protected admin UI.
 * Access should be restricted at the infrastructure level (Vercel password protection / VPN).
 */

import { RankingRulesTable } from "@/components/ranking-rules-table";

export const dynamic = "force-dynamic";

export default function RankingPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Règles de ranking</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Modifiez les poids sans redéploiement. Actif immédiatement.
          </p>
        </div>
        <a
          href="/ranking/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Nouvelle règle
        </a>
      </div>

      <RankingRulesTable />
    </div>
  );
}
