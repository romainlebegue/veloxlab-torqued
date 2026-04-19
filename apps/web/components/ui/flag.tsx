const FLAGS: Record<string, [string, string, string]> = {
  FR: ["#002654", "#fff",    "#ED2939"],
  DE: ["#000",    "#DD0000", "#FFCE00"],
  UK: ["#012169", "#fff",    "#C8102E"],
  ES: ["#AA151B", "#F1BF00", "#AA151B"],
  US: ["#002868", "#fff",    "#BF0A30"],
  LT: ["#FDB913", "#006A44", "#C1272D"],
};

interface FlagProps {
  code: string;
  size?: number;
}

export function Flag({ code, size = 14 }: FlagProps) {
  const c = FLAGS[code] ?? ["#999", "#ccc", "#999"];
  const w = Math.round(size * 1.4);

  return (
    <svg
      width={w} height={size}
      viewBox="0 0 21 15"
      style={{ borderRadius: 2, overflow: "hidden", flexShrink: 0, border: "0.5px solid rgba(15,25,35,0.15)" }}
    >
      {code === "FR" ? (
        <>
          <rect x="0" y="0" width="7"  height="15" fill={c[0]} />
          <rect x="7" y="0" width="7"  height="15" fill={c[1]} />
          <rect x="14" y="0" width="7" height="15" fill={c[2]} />
        </>
      ) : code === "DE" ? (
        <>
          <rect x="0" y="0"  width="21" height="5" fill={c[0]} />
          <rect x="0" y="5"  width="21" height="5" fill={c[1]} />
          <rect x="0" y="10" width="21" height="5" fill={c[2]} />
        </>
      ) : (
        <>
          <rect x="0" y="0" width="21" height="15" fill={c[0]} />
          <rect x="0" y="5" width="21" height="5"  fill={c[1]} />
        </>
      )}
    </svg>
  );
}
