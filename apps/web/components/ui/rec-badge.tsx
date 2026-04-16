interface RecBadgeProps {
  grade: "A" | "B";
  donorVin?: string | null;
  donorKm?: number | null;
  dismantlerCert?: string | null;
}

/**
 * REC label — Recycled & Certified.
 * Full traceability line: donor VIN + mileage + dismantler cert.
 * See CLAUDE.md REC Certification section.
 */
export function RecBadge({ grade, donorVin, donorKm, dismantlerCert }: RecBadgeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
          ${grade === "A"
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "bg-lime-100 text-lime-800 border border-lime-200"
          }`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486z"
            clipRule="evenodd"
          />
        </svg>
        REC {grade}
      </span>

      {(donorVin || donorKm || dismantlerCert) && (
        <p className="text-[10px] text-gray-400 leading-tight pl-0.5">
          {donorVin && <span>VIN donor : {donorVin.slice(0, 8)}…</span>}
          {donorKm && <span className="ml-1">· {(donorKm / 1000).toFixed(0)}k km</span>}
          {dismantlerCert && <span className="ml-1">· {dismantlerCert}</span>}
        </p>
      )}
    </div>
  );
}
