import type { SeedCategory } from "./types";

/**
 * Prototype taxonomy — 3 demo categories per §3.2 of the prototype brief.
 * Brake discs / alternators / headlights cover new + reman + used naturally.
 */
export const categories: SeedCategory[] = [
  {
    slug: "brakes",
    name: "Freinage",
    name_i18n: { fr: "Freinage", en: "Brakes" },
    depth: 0,
    path: ["brakes"],
  },
  {
    slug: "brake-discs",
    parent_slug: "brakes",
    name: "Disques de frein",
    name_i18n: { fr: "Disques de frein", en: "Brake discs" },
    depth: 1,
    path: ["brakes", "brake-discs"],
  },
  {
    slug: "engine",
    name: "Moteur",
    name_i18n: { fr: "Moteur", en: "Engine" },
    depth: 0,
    path: ["engine"],
  },
  {
    slug: "alternators",
    parent_slug: "engine",
    name: "Alternateurs",
    name_i18n: { fr: "Alternateurs", en: "Alternators" },
    depth: 1,
    path: ["engine", "alternators"],
  },
  {
    slug: "lighting",
    name: "Éclairage",
    name_i18n: { fr: "Éclairage", en: "Lighting" },
    depth: 0,
    path: ["lighting"],
  },
  {
    slug: "headlights",
    parent_slug: "lighting",
    name: "Phares",
    name_i18n: { fr: "Phares", en: "Headlights" },
    depth: 1,
    path: ["lighting", "headlights"],
  },
];
