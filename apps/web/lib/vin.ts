/**
 * VIN decoder — two-step:
 *   1. Local WMI lookup (instant, no API call) → make + country
 *   2. Supabase vehicles table lookup by vin_prefix → full vehicle match
 *
 * VIN structure (ISO 3779):
 *   [0-2]  WMI  — World Manufacturer Identifier (make + country)
 *   [3-8]  VDS  — Vehicle Descriptor Section (model, body, engine)
 *   [9-16] VIS  — Vehicle Identifier Section (year, plant, sequence)
 *   [9]    Model year code
 *   [10]   Plant code
 */

// Model year codes (position 9 in VIN, starts 1980)
const YEAR_CODES: Record<string, number> = {
  A: 1980, B: 1981, C: 1982, D: 1983, E: 1984, F: 1985, G: 1986, H: 1987,
  J: 1988, K: 1989, L: 1990, M: 1991, N: 1992, P: 1993, R: 1994, S: 1995,
  T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000, "1": 2001, "2": 2002, "3": 2003,
  "4": 2004, "5": 2005, "6": 2006, "7": 2007, "8": 2008, "9": 2009, A2: 2010,
  B2: 2011, C2: 2012, D2: 2013, E2: 2014, F2: 2015, G2: 2016, H2: 2017,
  J2: 2018, K2: 2019, L2: 2020, M2: 2021, N2: 2022, P2: 2023, R2: 2024,
};

// WMI → make label (partial — extend with full TecDoc WMI table)
const WMI_MAKE: Record<string, string> = {
  WVW: "Volkswagen", WBA: "BMW",  WBS: "BMW",  WBY: "BMW",
  WAU: "Audi",       WUA: "Audi", TRU: "Audi",
  WDD: "Mercedes",   WDB: "Mercedes", WDC: "Mercedes",
  VF1: "Renault",    VF3: "Renault",  VF7: "Citroën",  VF8: "Peugeot",
  VNK: "Toyota",     SHH: "Honda",    SAJ: "Jaguar",    SAL: "Land Rover",
  ZFA: "Fiat",       ZAR: "Alfa Romeo", ZFF: "Ferrari",
  SFD: "Ford (UK)",  WF0: "Ford",     VS6: "Ford (ES)",
  TMB: "Skoda",      TMBJK: "Skoda",  TRN: "Audi (HU)",
  VSS: "SEAT",       VSK: "SEAT",
  YV1: "Volvo",      XLR: "DAF",
};

export interface VinDecodeResult {
  vin: string;
  isValid: boolean;
  make: string | null;
  makeSlug: string | null;
  modelYear: number | null;
  wmi: string;
  country: string | null;
  error?: string;
}

/**
 * Local VIN decode — instant, no network.
 * Returns make + year from WMI + year code.
 */
export function decodeVinLocal(vin: string): VinDecodeResult {
  const v = vin.toUpperCase().trim();

  if (v.length !== 17) {
    return { vin: v, isValid: false, make: null, makeSlug: null, modelYear: null, wmi: "", country: null, error: "Le VIN doit contenir exactement 17 caractères." };
  }
  if (/[IOQ]/.test(v)) {
    return { vin: v, isValid: false, make: null, makeSlug: null, modelYear: null, wmi: "", country: null, error: "Le VIN ne peut pas contenir les lettres I, O ou Q." };
  }

  const wmi = v.slice(0, 3);
  const yearCode = v[9];

  // Try 3-char WMI, fallback to 2-char
  const makeLabel = WMI_MAKE[wmi] ?? WMI_MAKE[v.slice(0, 2)] ?? null;
  const makeSlug = makeLabel?.toLowerCase().replace(/\s+/g, "-") ?? null;
  const modelYear = YEAR_CODES[yearCode] ?? null;
  const country = wmiToCountry(wmi[0]);

  return {
    vin: v,
    isValid: true,
    make: makeLabel,
    makeSlug,
    modelYear,
    wmi,
    country,
  };
}

function wmiToCountry(first: string): string | null {
  const map: Record<string, string> = {
    A: "Afrique du Sud", B: "Angola", C: "Bénin", D: "Égypte", E: "Éthiopie",
    F: "Ghana", G: "Kenya", H: "Maroc", J: "Tunisie", K: "Tanzanie", L: "Chine",
    M: "Inde", N: "Indonésie", P: "Japon", R: "Taiwan", S: "Royaume-Uni",
    T: "Suisse", U: "Danemark", V: "France", W: "Allemagne", X: "Russie",
    Y: "Belgique", Z: "Italie", "1": "États-Unis", "2": "Canada",
    "3": "Mexique", "4": "États-Unis", "5": "États-Unis",
    "6": "Australie", "7": "Nouvelle-Zélande", "8": "Argentine",
    "9": "Brésil",
  };
  return map[first] ?? null;
}

/**
 * VIN checksum validation (position 8, North American VINs only).
 * EU VINs don't always enforce the check digit — treated as advisory only.
 */
export function validateVinChecksum(vin: string): boolean {
  const TRANSLITERATION: Record<string, number> = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:1,K:2,L:3,M:4,N:5,P:7,R:9,
    S:2,T:3,U:4,V:5,W:6,X:7,Y:8,Z:9,
    "0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,
  };
  const WEIGHTS = [8,7,6,5,4,3,2,10,0,9,8,7,6,5,4,3,2];
  const v = vin.toUpperCase();

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const val = TRANSLITERATION[v[i]];
    if (val === undefined) return false;
    sum += val * WEIGHTS[i];
  }

  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? "X" : String(remainder);
  return v[8] === checkDigit;
}
