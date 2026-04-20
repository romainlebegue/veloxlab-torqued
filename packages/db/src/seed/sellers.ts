import type { SeedSeller } from "./types";

/**
 * 8 demo sellers, multi-country, covering every condition type.
 * `is_demo=true` is forced by the seed runner. Names are plausible
 * but invented — don't point to real companies.
 */
export const sellers: SeedSeller[] = [
  {
    slug: "autoparts-paris",
    display_name: "AutoParts Paris",
    legal_name: "AutoParts Paris SAS",
    country_code: "FR",
    tier: "A",
    status: "active",
    mor_eligible: true,
    onboarded_at: "2025-10-15T09:00:00Z",
  },
  {
    slug: "teileprofi-berlin",
    display_name: "TeileProfi Berlin",
    legal_name: "TeileProfi GmbH",
    country_code: "DE",
    tier: "A",
    status: "active",
    mor_eligible: true,
    onboarded_at: "2025-11-02T11:30:00Z",
  },
  {
    slug: "motorspares-uk",
    display_name: "MotorSpares UK",
    legal_name: "MotorSpares Direct Ltd",
    country_code: "GB",
    tier: "B",
    status: "active",
    mor_eligible: false,
    onboarded_at: "2026-01-20T14:15:00Z",
  },
  {
    slug: "recambios-madrid",
    display_name: "Recambios Madrid",
    legal_name: "Recambios Madrid S.L.",
    country_code: "ES",
    tier: "B",
    status: "active",
    mor_eligible: false,
    onboarded_at: "2026-02-08T10:00:00Z",
  },
  {
    slug: "autoczesci-poznan",
    display_name: "AutoCzesci Poznan",
    legal_name: "AutoCzesci Sp. z o.o.",
    country_code: "PL",
    tier: "B",
    status: "active",
    mor_eligible: false,
    onboarded_at: "2026-02-22T08:45:00Z",
  },
  {
    slug: "recyclauto-lyon",
    display_name: "RecyclAuto Lyon",
    legal_name: "RecyclAuto SAS",
    country_code: "FR",
    tier: "A",
    status: "active",
    mor_eligible: true,
    onboarded_at: "2025-09-01T12:00:00Z",
  },
  {
    slug: "ovoko-dismantler",
    display_name: "Ovoko Partner Dismantler",
    legal_name: "UAB Ovoko Partner",
    country_code: "LT",
    tier: "B",
    status: "active",
    mor_eligible: false,
    onboarded_at: "2026-03-05T09:30:00Z",
  },
  {
    slug: "ricambi-milano",
    display_name: "Ricambi Milano",
    legal_name: "Ricambi Milano S.r.l.",
    country_code: "IT",
    tier: "C",
    status: "active",
    mor_eligible: false,
    onboarded_at: "2026-03-18T16:00:00Z",
  },
];
