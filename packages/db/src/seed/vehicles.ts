import type { SeedVehicle } from "./types";

/**
 * Top ~20 FR makes/models × common engine variants (2010-present).
 * Real powertrain codes (EB2F, DV5R, EA211, K9K, etc.) and years.
 * `ktype_nr` values are sequential placeholders — replace with real
 * TecDoc KType when we get the license.
 */

type Engine = {
  code: string;
  cc: number;
  kw: number;
  hp: number;
  fuel: "petrol" | "diesel" | "hybrid" | "electric" | "lpg";
  name: string;
};

type Generation = {
  variant: string; // "I", "II", "F30", "W177"...
  year_from: number;
  year_to: number | null;
  body_type: "hatchback" | "sedan" | "suv" | "estate" | "coupe" | "van";
  engines: Engine[];
};

type ModelSpec = {
  make: string;
  model: string;
  slugBase: string;
  generations: Generation[];
};

const MODELS: ModelSpec[] = [
  {
    make: "Peugeot", model: "208", slugBase: "peugeot-208",
    generations: [
      {
        variant: "II", year_from: 2019, year_to: null, body_type: "hatchback",
        engines: [
          { code: "EB2FA", cc: 1199, kw: 55, hp: 75,  fuel: "petrol", name: "1.2 PureTech 75" },
          { code: "EB2ADT", cc: 1199, kw: 74, hp: 100, fuel: "petrol", name: "1.2 PureTech 100" },
          { code: "EB2ADTS", cc: 1199, kw: 96, hp: 130, fuel: "petrol", name: "1.2 PureTech 130" },
          { code: "DV5RC", cc: 1499, kw: 74, hp: 100, fuel: "diesel", name: "1.5 BlueHDi 100" },
          { code: "ZKE", cc: 0, kw: 100, hp: 136, fuel: "electric", name: "e-208 136" },
        ],
      },
      {
        variant: "I", year_from: 2012, year_to: 2019, body_type: "hatchback",
        engines: [
          { code: "EB0", cc: 999, kw: 50, hp: 68,  fuel: "petrol", name: "1.0 VTi 68" },
          { code: "EB2F", cc: 1199, kw: 60, hp: 82,  fuel: "petrol", name: "1.2 VTi 82" },
          { code: "DV6D", cc: 1560, kw: 55, hp: 75,  fuel: "diesel", name: "1.6 HDi 75" },
          { code: "DV6C", cc: 1560, kw: 68, hp: 92,  fuel: "diesel", name: "1.6 HDi 92" },
        ],
      },
    ],
  },
  {
    make: "Peugeot", model: "308", slugBase: "peugeot-308",
    generations: [
      {
        variant: "III", year_from: 2021, year_to: null, body_type: "hatchback",
        engines: [
          { code: "EB2ADTS", cc: 1199, kw: 96, hp: 130, fuel: "petrol", name: "1.2 PureTech 130" },
          { code: "DV5RC", cc: 1499, kw: 96, hp: 130, fuel: "diesel", name: "1.5 BlueHDi 130" },
          { code: "EP6FADTXHP", cc: 1598, kw: 133, hp: 180, fuel: "hybrid", name: "1.6 Hybrid 180" },
        ],
      },
      {
        variant: "II", year_from: 2013, year_to: 2021, body_type: "hatchback",
        engines: [
          { code: "EB2", cc: 1199, kw: 60, hp: 82,  fuel: "petrol", name: "1.2 PureTech 82" },
          { code: "EB2DT", cc: 1199, kw: 81, hp: 110, fuel: "petrol", name: "1.2 PureTech 110" },
          { code: "EP6FDT", cc: 1598, kw: 110, hp: 150, fuel: "petrol", name: "1.6 THP 150" },
          { code: "DV6C", cc: 1560, kw: 68, hp: 92,  fuel: "diesel", name: "1.6 HDi 92" },
          { code: "DV6FC", cc: 1560, kw: 88, hp: 120, fuel: "diesel", name: "1.6 BlueHDi 120" },
          { code: "DW10F", cc: 1997, kw: 110, hp: 150, fuel: "diesel", name: "2.0 BlueHDi 150" },
        ],
      },
    ],
  },
  {
    make: "Peugeot", model: "3008", slugBase: "peugeot-3008",
    generations: [
      {
        variant: "II", year_from: 2016, year_to: null, body_type: "suv",
        engines: [
          { code: "EB2ADT", cc: 1199, kw: 96, hp: 130, fuel: "petrol", name: "1.2 PureTech 130" },
          { code: "EP6FDT", cc: 1598, kw: 133, hp: 180, fuel: "petrol", name: "1.6 THP 180" },
          { code: "DV6FC", cc: 1560, kw: 88, hp: 120, fuel: "diesel", name: "1.6 BlueHDi 120" },
          { code: "DW10F", cc: 1997, kw: 130, hp: 177, fuel: "diesel", name: "2.0 BlueHDi 177" },
        ],
      },
    ],
  },
  {
    make: "Renault", model: "Clio", slugBase: "renault-clio",
    generations: [
      {
        variant: "V", year_from: 2019, year_to: null, body_type: "hatchback",
        engines: [
          { code: "H4D", cc: 999, kw: 49, hp: 67,  fuel: "petrol", name: "1.0 SCe 65" },
          { code: "H5H", cc: 999, kw: 74, hp: 100, fuel: "petrol", name: "1.0 TCe 100" },
          { code: "H4J", cc: 1333, kw: 103, hp: 140, fuel: "petrol", name: "1.3 TCe 140" },
          { code: "K9K", cc: 1461, kw: 63, hp: 85,  fuel: "diesel", name: "1.5 Blue dCi 85" },
          { code: "K9K", cc: 1461, kw: 85, hp: 115, fuel: "diesel", name: "1.5 Blue dCi 115" },
          { code: "H4M", cc: 1598, kw: 103, hp: 140, fuel: "hybrid", name: "E-Tech 140" },
        ],
      },
      {
        variant: "IV", year_from: 2012, year_to: 2019, body_type: "hatchback",
        engines: [
          { code: "D4F", cc: 1149, kw: 55, hp: 75,  fuel: "petrol", name: "1.2 16V 75" },
          { code: "H4B", cc: 898,  kw: 66, hp: 90,  fuel: "petrol", name: "0.9 TCe 90" },
          { code: "H5F", cc: 1197, kw: 87, hp: 118, fuel: "petrol", name: "1.2 TCe 120" },
          { code: "K9K", cc: 1461, kw: 55, hp: 75,  fuel: "diesel", name: "1.5 dCi 75" },
          { code: "K9K", cc: 1461, kw: 66, hp: 90,  fuel: "diesel", name: "1.5 dCi 90" },
        ],
      },
    ],
  },
  {
    make: "Renault", model: "Captur", slugBase: "renault-captur",
    generations: [
      {
        variant: "II", year_from: 2019, year_to: null, body_type: "suv",
        engines: [
          { code: "H5H", cc: 999, kw: 67, hp: 91,  fuel: "petrol", name: "1.0 TCe 90" },
          { code: "H4J", cc: 1333, kw: 103, hp: 140, fuel: "petrol", name: "1.3 TCe 140" },
          { code: "K9K", cc: 1461, kw: 70, hp: 95,  fuel: "diesel", name: "1.5 Blue dCi 95" },
          { code: "H4M", cc: 1598, kw: 105, hp: 145, fuel: "hybrid", name: "E-Tech 145" },
        ],
      },
      {
        variant: "I", year_from: 2013, year_to: 2019, body_type: "suv",
        engines: [
          { code: "H4B", cc: 898, kw: 66, hp: 90,  fuel: "petrol", name: "0.9 TCe 90" },
          { code: "H5F", cc: 1197, kw: 87, hp: 118, fuel: "petrol", name: "1.2 TCe 120" },
          { code: "K9K", cc: 1461, kw: 66, hp: 90,  fuel: "diesel", name: "1.5 dCi 90" },
        ],
      },
    ],
  },
  {
    make: "Renault", model: "Megane", slugBase: "renault-megane",
    generations: [
      {
        variant: "IV", year_from: 2015, year_to: 2023, body_type: "hatchback",
        engines: [
          { code: "H4B", cc: 898, kw: 66, hp: 90,  fuel: "petrol", name: "0.9 TCe 90" },
          { code: "H5F", cc: 1197, kw: 85, hp: 115, fuel: "petrol", name: "1.2 TCe 115" },
          { code: "H4J", cc: 1333, kw: 103, hp: 140, fuel: "petrol", name: "1.3 TCe 140" },
          { code: "K9K", cc: 1461, kw: 81, hp: 110, fuel: "diesel", name: "1.5 dCi 110" },
          { code: "R9M", cc: 1749, kw: 96, hp: 130, fuel: "diesel", name: "1.7 Blue dCi 130" },
        ],
      },
    ],
  },
  {
    make: "Citroen", model: "C3", slugBase: "citroen-c3",
    generations: [
      {
        variant: "III", year_from: 2016, year_to: null, body_type: "hatchback",
        engines: [
          { code: "EB2F", cc: 1199, kw: 60, hp: 82,  fuel: "petrol", name: "1.2 PureTech 83" },
          { code: "EB2DT", cc: 1199, kw: 81, hp: 110, fuel: "petrol", name: "1.2 PureTech 110" },
          { code: "DV5RC", cc: 1499, kw: 75, hp: 102, fuel: "diesel", name: "1.5 BlueHDi 100" },
        ],
      },
    ],
  },
  {
    make: "Citroen", model: "C4", slugBase: "citroen-c4",
    generations: [
      {
        variant: "III", year_from: 2020, year_to: null, body_type: "hatchback",
        engines: [
          { code: "EB2ADT", cc: 1199, kw: 74, hp: 100, fuel: "petrol", name: "1.2 PureTech 100" },
          { code: "EB2ADT", cc: 1199, kw: 96, hp: 130, fuel: "petrol", name: "1.2 PureTech 130" },
          { code: "DV5RC", cc: 1499, kw: 96, hp: 130, fuel: "diesel", name: "1.5 BlueHDi 130" },
        ],
      },
    ],
  },
  {
    make: "Volkswagen", model: "Golf", slugBase: "volkswagen-golf",
    generations: [
      {
        variant: "VIII", year_from: 2019, year_to: null, body_type: "hatchback",
        engines: [
          { code: "DLAA", cc: 999, kw: 66, hp: 90,  fuel: "petrol", name: "1.0 TSI 90" },
          { code: "DLAB", cc: 999, kw: 81, hp: 110, fuel: "petrol", name: "1.0 TSI 110" },
          { code: "DFYA", cc: 1498, kw: 110, hp: 150, fuel: "petrol", name: "1.5 TSI 150" },
          { code: "DTRD", cc: 1968, kw: 85, hp: 115, fuel: "diesel", name: "2.0 TDI 115" },
          { code: "DTSB", cc: 1968, kw: 110, hp: 150, fuel: "diesel", name: "2.0 TDI 150" },
        ],
      },
      {
        variant: "VII", year_from: 2012, year_to: 2019, body_type: "hatchback",
        engines: [
          { code: "CJZA", cc: 1197, kw: 63, hp: 85,  fuel: "petrol", name: "1.2 TSI 85" },
          { code: "CJZC", cc: 1197, kw: 77, hp: 105, fuel: "petrol", name: "1.2 TSI 105" },
          { code: "CHPA", cc: 1395, kw: 90, hp: 122, fuel: "petrol", name: "1.4 TSI 122" },
          { code: "CRBC", cc: 1968, kw: 81, hp: 110, fuel: "diesel", name: "2.0 TDI 110" },
          { code: "CRLB", cc: 1968, kw: 110, hp: 150, fuel: "diesel", name: "2.0 TDI 150" },
          { code: "CUNA", cc: 1968, kw: 135, hp: 184, fuel: "diesel", name: "2.0 TDI 184 GTD" },
        ],
      },
    ],
  },
  {
    make: "Volkswagen", model: "Polo", slugBase: "volkswagen-polo",
    generations: [
      {
        variant: "VI", year_from: 2017, year_to: null, body_type: "hatchback",
        engines: [
          { code: "CHYA", cc: 999, kw: 48, hp: 65,  fuel: "petrol", name: "1.0 MPI 65" },
          { code: "DLAA", cc: 999, kw: 70, hp: 95,  fuel: "petrol", name: "1.0 TSI 95" },
          { code: "DLAB", cc: 999, kw: 85, hp: 115, fuel: "petrol", name: "1.0 TSI 115" },
          { code: "DGTA", cc: 1598, kw: 59, hp: 80,  fuel: "diesel", name: "1.6 TDI 80" },
        ],
      },
    ],
  },
  {
    make: "Dacia", model: "Sandero", slugBase: "dacia-sandero",
    generations: [
      {
        variant: "III", year_from: 2020, year_to: null, body_type: "hatchback",
        engines: [
          { code: "H4D", cc: 999, kw: 49, hp: 67,  fuel: "petrol", name: "1.0 SCe 65" },
          { code: "H5H", cc: 999, kw: 67, hp: 91,  fuel: "petrol", name: "1.0 TCe 90" },
          { code: "HR10DET", cc: 999, kw: 74, hp: 100, fuel: "lpg",    name: "1.0 Bi-Fuel ECO-G 100" },
        ],
      },
      {
        variant: "II", year_from: 2012, year_to: 2020, body_type: "hatchback",
        engines: [
          { code: "D4F", cc: 1149, kw: 55, hp: 75, fuel: "petrol", name: "1.2 16V 75" },
          { code: "H4B", cc: 898,  kw: 66, hp: 90, fuel: "petrol", name: "0.9 TCe 90" },
          { code: "K9K", cc: 1461, kw: 55, hp: 75, fuel: "diesel", name: "1.5 dCi 75" },
        ],
      },
    ],
  },
  {
    make: "Toyota", model: "Yaris", slugBase: "toyota-yaris",
    generations: [
      {
        variant: "IV", year_from: 2020, year_to: null, body_type: "hatchback",
        engines: [
          { code: "M15A-FKS", cc: 1490, kw: 88, hp: 120, fuel: "petrol", name: "1.5 VVT-iE 120" },
          { code: "M15A-FXE", cc: 1490, kw: 85, hp: 116, fuel: "hybrid", name: "1.5 Hybrid 116" },
        ],
      },
      {
        variant: "III", year_from: 2011, year_to: 2020, body_type: "hatchback",
        engines: [
          { code: "1KR-FE", cc: 998,  kw: 51, hp: 69,  fuel: "petrol", name: "1.0 VVT-i 69" },
          { code: "1NR-FE", cc: 1329, kw: 73, hp: 99,  fuel: "petrol", name: "1.33 VVT-i 99" },
          { code: "1NR-FXE", cc: 1497, kw: 55, hp: 75, fuel: "hybrid", name: "1.5 Hybrid 100" },
          { code: "1ND-TV",  cc: 1364, kw: 66, hp: 90,  fuel: "diesel", name: "1.4 D-4D 90" },
        ],
      },
    ],
  },
  {
    make: "Ford", model: "Fiesta", slugBase: "ford-fiesta",
    generations: [
      {
        variant: "VII", year_from: 2017, year_to: 2023, body_type: "hatchback",
        engines: [
          { code: "M0JA", cc: 999, kw: 55, hp: 75,  fuel: "petrol", name: "1.0 EcoBoost 75" },
          { code: "M1JA", cc: 999, kw: 74, hp: 100, fuel: "petrol", name: "1.0 EcoBoost 100" },
          { code: "M2GA", cc: 999, kw: 92, hp: 125, fuel: "petrol", name: "1.0 EcoBoost 125" },
          { code: "XUJE", cc: 1499, kw: 63, hp: 85,  fuel: "diesel", name: "1.5 TDCi 85" },
        ],
      },
    ],
  },
  {
    make: "Ford", model: "Focus", slugBase: "ford-focus",
    generations: [
      {
        variant: "IV", year_from: 2018, year_to: null, body_type: "hatchback",
        engines: [
          { code: "M1DA", cc: 999, kw: 74, hp: 100, fuel: "petrol", name: "1.0 EcoBoost 100" },
          { code: "M2DA", cc: 999, kw: 92, hp: 125, fuel: "petrol", name: "1.0 EcoBoost 125" },
          { code: "UFMA", cc: 1499, kw: 110, hp: 150, fuel: "petrol", name: "1.5 EcoBoost 150" },
          { code: "XXDA", cc: 1499, kw: 88, hp: 120, fuel: "diesel", name: "1.5 EcoBlue 120" },
          { code: "YLDA", cc: 1995, kw: 110, hp: 150, fuel: "diesel", name: "2.0 EcoBlue 150" },
        ],
      },
    ],
  },
  {
    make: "Opel", model: "Corsa", slugBase: "opel-corsa",
    generations: [
      {
        variant: "F", year_from: 2019, year_to: null, body_type: "hatchback",
        engines: [
          { code: "EB2F",   cc: 1199, kw: 55, hp: 75,  fuel: "petrol", name: "1.2 75" },
          { code: "EB2ADT", cc: 1199, kw: 74, hp: 100, fuel: "petrol", name: "1.2 Turbo 100" },
          { code: "EB2ADT", cc: 1199, kw: 96, hp: 130, fuel: "petrol", name: "1.2 Turbo 130" },
          { code: "DV5RC",  cc: 1499, kw: 75, hp: 102, fuel: "diesel", name: "1.5 Diesel 102" },
        ],
      },
    ],
  },
  {
    make: "BMW", model: "Serie 3", slugBase: "bmw-serie-3",
    generations: [
      {
        variant: "G20", year_from: 2019, year_to: null, body_type: "sedan",
        engines: [
          { code: "B48",  cc: 1998, kw: 135, hp: 184, fuel: "petrol", name: "320i 184" },
          { code: "B48",  cc: 1998, kw: 190, hp: 258, fuel: "petrol", name: "330i 258" },
          { code: "B47",  cc: 1995, kw: 140, hp: 190, fuel: "diesel", name: "320d 190" },
          { code: "B57",  cc: 2993, kw: 210, hp: 286, fuel: "diesel", name: "M340d 286" },
        ],
      },
      {
        variant: "F30", year_from: 2011, year_to: 2019, body_type: "sedan",
        engines: [
          { code: "N20",   cc: 1997, kw: 135, hp: 184, fuel: "petrol", name: "320i 184" },
          { code: "B48",   cc: 1998, kw: 185, hp: 252, fuel: "petrol", name: "330i 252" },
          { code: "N47",   cc: 1995, kw: 135, hp: 184, fuel: "diesel", name: "320d 184" },
          { code: "N47D20C",cc: 1995, kw: 110, hp: 150, fuel: "diesel", name: "318d 150" },
          { code: "N57",   cc: 2993, kw: 190, hp: 258, fuel: "diesel", name: "330d 258" },
        ],
      },
    ],
  },
  {
    make: "Mercedes-Benz", model: "Classe A", slugBase: "mercedes-classe-a",
    generations: [
      {
        variant: "W177", year_from: 2018, year_to: null, body_type: "hatchback",
        engines: [
          { code: "M282", cc: 1332, kw: 100, hp: 136, fuel: "petrol", name: "A 180 136" },
          { code: "M260", cc: 1991, kw: 140, hp: 190, fuel: "petrol", name: "A 220 190" },
          { code: "OM608", cc: 1461, kw: 85,  hp: 116, fuel: "diesel", name: "A 180 d 116" },
          { code: "OM654", cc: 1950, kw: 110, hp: 150, fuel: "diesel", name: "A 200 d 150" },
        ],
      },
      {
        variant: "W176", year_from: 2012, year_to: 2018, body_type: "hatchback",
        engines: [
          { code: "M270", cc: 1595, kw: 90,  hp: 122, fuel: "petrol", name: "A 180 122" },
          { code: "M270", cc: 1991, kw: 135, hp: 184, fuel: "petrol", name: "A 250 184" },
          { code: "OM607", cc: 1461, kw: 80,  hp: 109, fuel: "diesel", name: "A 180 CDI 109" },
          { code: "OM651", cc: 2143, kw: 100, hp: 136, fuel: "diesel", name: "A 200 CDI 136" },
        ],
      },
    ],
  },
  {
    make: "Audi", model: "A3", slugBase: "audi-a3",
    generations: [
      {
        variant: "8Y", year_from: 2020, year_to: null, body_type: "hatchback",
        engines: [
          { code: "DLAA", cc: 999, kw: 81, hp: 110, fuel: "petrol", name: "30 TFSI 110" },
          { code: "DFYA", cc: 1498, kw: 110, hp: 150, fuel: "petrol", name: "35 TFSI 150" },
          { code: "DTRD", cc: 1968, kw: 85, hp: 115, fuel: "diesel", name: "30 TDI 115" },
          { code: "DTTB", cc: 1968, kw: 110, hp: 150, fuel: "diesel", name: "35 TDI 150" },
        ],
      },
      {
        variant: "8V", year_from: 2012, year_to: 2020, body_type: "hatchback",
        engines: [
          { code: "CJZA", cc: 1197, kw: 77, hp: 105, fuel: "petrol", name: "1.2 TFSI 105" },
          { code: "CXSA", cc: 1395, kw: 90, hp: 122, fuel: "petrol", name: "1.4 TFSI 122" },
          { code: "CRBC", cc: 1968, kw: 110, hp: 150, fuel: "diesel", name: "2.0 TDI 150" },
          { code: "CUNA", cc: 1968, kw: 135, hp: 184, fuel: "diesel", name: "2.0 TDI 184" },
        ],
      },
    ],
  },
  {
    make: "Citroen", model: "Berlingo", slugBase: "citroen-berlingo",
    generations: [
      {
        variant: "III", year_from: 2018, year_to: null, body_type: "van",
        engines: [
          { code: "EB2ADT", cc: 1199, kw: 81, hp: 110, fuel: "petrol", name: "1.2 PureTech 110" },
          { code: "DV5RC", cc: 1499, kw: 74, hp: 100, fuel: "diesel", name: "1.5 BlueHDi 100" },
          { code: "DV5RC", cc: 1499, kw: 96, hp: 130, fuel: "diesel", name: "1.5 BlueHDi 130" },
        ],
      },
    ],
  },
];

function kebab(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function expand(models: ModelSpec[]): SeedVehicle[] {
  const out: SeedVehicle[] = [];
  let ktype = 100000;
  const seenSlugs = new Set<string>();

  for (const m of models) {
    for (const g of m.generations) {
      for (const e of g.engines) {
        const slug = kebab(`${m.slugBase}-${g.variant}-${e.name}`);
        // Avoid dup slugs on the rare occasion two engines share the same "name"
        const finalSlug = seenSlugs.has(slug) ? `${slug}-${e.code.toLowerCase()}` : slug;
        seenSlugs.add(finalSlug);

        out.push({
          vehicle_type: "car",
          make: m.make,
          model: m.model,
          variant: `${g.variant} ${e.name}`,
          slug: finalSlug,
          engine_code: e.code,
          engine_cc: e.cc,
          engine_kw: e.kw,
          engine_hp: e.hp,
          fuel_type: e.fuel,
          body_type: g.body_type,
          year_from: g.year_from,
          year_to: g.year_to,
          ktype_nr: ++ktype,
          display_name: `${m.make} ${m.model} ${g.variant} ${e.name} (${g.year_from}${g.year_to ? `-${g.year_to}` : "+"})`,
          primary_markets: ["fr", "de", "uk", "es", "it", "pl"],
          data_source: "manual",
        });
      }
    }
  }
  return out;
}

export const vehicles: SeedVehicle[] = expand(MODELS);
