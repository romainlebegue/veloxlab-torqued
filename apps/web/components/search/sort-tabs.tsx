"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

type SortMode = "smart" | "price" | "eco" | "rating" | "delivery";

const TABS: { value: SortMode; label: string; icon: string }[] = [
  { value: "smart",    label: "Recommandé",  icon: "✦" },
  { value: "price",    label: "Prix",         icon: "€" },
  { value: "eco",      label: "Éco · REC",   icon: "♻" },
  { value: "rating",   label: "Avis",         icon: "★" },
  { value: "delivery", label: "Livraison",    icon: "⚡" },
];

/**
 * Sort mode tabs — updates ?sort= query param → triggers page re-render.
 */
export function SortTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get("sort") ?? "smart") as SortMode;

  function handleSelect(mode: SortMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", mode);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
      {TABS.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 500,
            whiteSpace: "nowrap", border: "none", cursor: "pointer", transition: "background 0.15s",
            background: current === value ? "var(--ink)" : "var(--bg-warm2)",
            color: current === value ? "#fff" : "var(--ink-mid)",
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
