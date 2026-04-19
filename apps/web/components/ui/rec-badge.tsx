interface RecBadgeProps {
  grade: "A" | "B";
  compact?: boolean;
  donorVin?: string | null;
  donorKm?: number | null;
  dismantlerCert?: string | null;
}

export function RecBadge({ grade, compact = false, donorVin, donorKm, dismantlerCert }: RecBadgeProps) {
  const bg = grade === "A" ? "#D6F5E8" : "#E6F5D6";
  const fg = grade === "A" ? "#0A6640" : "#3F6B15";
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: compact ? "3px 8px" : "4px 10px",
        borderRadius: 999,
        background: bg, color: fg,
        fontFamily: "var(--font-mono)", fontSize: compact ? 10 : 11,
        fontWeight: 500, letterSpacing: "0.04em", whiteSpace: "nowrap",
        border: "0.5px solid rgba(10,102,64,0.25)",
      }}>
        <svg width={compact ? 10 : 12} height={compact ? 10 : 12} viewBox="0 0 24 24" fill="none"
          stroke={fg} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20c0-9 6-15 16-15 0 10-6 16-16 16z"/>
          <path d="M4 20c4-5 8-8 14-10"/>
        </svg>
        REC {grade}
      </span>
      {(donorVin || donorKm || dismantlerCert) && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-light)", paddingLeft: 2 }}>
          {donorVin && <span>VIN: {donorVin.slice(0, 8)}…</span>}
          {donorKm && <span style={{ marginLeft: 4 }}>· {Math.round(donorKm / 1000)}k km</span>}
          {dismantlerCert && <span style={{ marginLeft: 4 }}>· {dismantlerCert}</span>}
        </span>
      )}
    </span>
  );
}
