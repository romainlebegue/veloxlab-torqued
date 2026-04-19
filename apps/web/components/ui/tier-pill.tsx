type Tier = "OEM" | "OES" | "IAM" | "REC" | "USED";

interface TierPillProps {
  tier: Tier | string;
}

export function TierPill({ tier }: TierPillProps) {
  const cls =
    tier === "OEM" ? "badge badge-oem" :
    tier === "OES" ? "badge badge-oes" :
    tier === "IAM" ? "badge badge-iam" :
    tier === "REC" ? "badge badge-certified" :
    "badge badge-used";
  return <span className={cls}>{tier}</span>;
}
