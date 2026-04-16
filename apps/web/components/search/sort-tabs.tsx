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
    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
      {TABS.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
            ${current === value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
        >
          <span className="text-base leading-none">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
