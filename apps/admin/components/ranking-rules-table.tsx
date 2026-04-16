"use client";

import { useEffect, useState } from "react";

interface RankingRule {
  id: string;
  source: string;
  checkout_type: string;
  weight_checkout: number;
  weight_boost: number;
  weight_quality: number;
  weight_eco: number;
  weight_price: number;
  weight_shipping: number;
  is_active: boolean;
  valid_from: string | null;
  valid_to: string | null;
  notes: string | null;
}

const WEIGHT_COLS: { key: keyof RankingRule; label: string }[] = [
  { key: "weight_checkout", label: "Checkout" },
  { key: "weight_boost",    label: "Boost" },
  { key: "weight_quality",  label: "Qualité" },
  { key: "weight_eco",      label: "Éco (REC)" },
  { key: "weight_price",    label: "Prix" },
  { key: "weight_shipping", label: "Livraison" },
];

/**
 * Ranking rules table — inline editing of weights.
 * Changes are PATCH'd to /api/admin/ranking/[id].
 * Weights are returned by the API but never stored client-side beyond this session.
 */
export function RankingRulesTable() {
  const [rules, setRules] = useState<RankingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ranking")
      .then((r) => r.json())
      .then(setRules)
      .catch(() => setError("Impossible de charger les règles. Supabase connecté ?"))
      .finally(() => setLoading(false));
  }, []);

  async function handleWeightChange(
    id: string,
    field: keyof RankingRule,
    value: number
  ) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave(rule: RankingRule) {
    setSaving(rule.id);
    try {
      const res = await fetch(`/api/admin/ranking/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_checkout: rule.weight_checkout,
          weight_boost:    rule.weight_boost,
          weight_quality:  rule.weight_quality,
          weight_eco:      rule.weight_eco,
          weight_price:    rule.weight_price,
          weight_shipping: rule.weight_shipping,
          is_active:       rule.is_active,
          notes:           rule.notes,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setError(`Échec de la sauvegarde pour ${rule.source}`);
    } finally {
      setSaving(null);
    }
  }

  async function toggleActive(rule: RankingRule) {
    const updated = { ...rule, is_active: !rule.is_active };
    setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    await handleSave(updated);
  }

  if (loading) {
    return <p className="text-gray-400 text-sm">Chargement…</p>;
  }

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Checkout</th>
            {WEIGHT_COLS.map(({ key, label }) => (
              <th key={key} className="text-center px-3 py-3 font-medium text-gray-600 whitespace-nowrap">
                {label}
              </th>
            ))}
            <th className="text-left px-4 py-3 font-medium text-gray-600">Notes</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Actif</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rules.map((rule) => (
            <tr key={rule.id} className={rule.is_active ? "" : "opacity-50"}>
              <td className="px-4 py-3 font-mono text-xs text-gray-700">{rule.source}</td>
              <td className="px-4 py-3">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium
                  ${rule.checkout_type === "direct"   ? "bg-green-100 text-green-700" :
                    rule.checkout_type === "affiliate" ? "bg-blue-100 text-blue-700" :
                    rule.checkout_type === "cpc"       ? "bg-purple-100 text-purple-700" :
                                                         "bg-gray-100 text-gray-500"}`}>
                  {rule.checkout_type}
                </span>
              </td>
              {WEIGHT_COLS.map(({ key }) => (
                <td key={key} className="px-3 py-3 text-center">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="20"
                    value={rule[key] as number}
                    onChange={(e) =>
                      handleWeightChange(rule.id, key, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 text-center border border-gray-200 rounded px-1 py-0.5 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </td>
              ))}
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={rule.notes ?? ""}
                  onChange={(e) =>
                    setRules((prev) =>
                      prev.map((r) => r.id === rule.id ? { ...r, notes: e.target.value } : r)
                    )
                  }
                  placeholder="Commentaire…"
                  className="w-40 border-b border-gray-200 text-xs focus:outline-none focus:border-blue-400 bg-transparent"
                />
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => toggleActive(rule)}
                  className={`w-10 h-5 rounded-full transition-colors relative
                    ${rule.is_active ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${rule.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleSave(rule)}
                  disabled={saving === rule.id}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving === rule.id ? "…" : "Sauvegarder"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
