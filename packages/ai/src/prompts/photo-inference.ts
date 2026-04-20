/**
 * Photo inference prompt for the seller tool upload flow.
 * See docs/03_TORQUED_MVP_BRIEF.md §4.4 and docs/04_TORQUED_PROTOTYPE_BRIEF.md §5.2.
 */

export interface PhotoInferenceResult {
  isAutomotivePart: boolean;
  category?: string;
  subcategory?: string;
  oeNumbers: string[];
  iamNumbers: string[];
  brand?: string;
  conditionEstimate?: "new" | "used" | "damaged";
  confidence: number;
  rejectionReason?: string;
}

export const PHOTO_INFERENCE_PROMPT = `You are an automotive parts expert analyzing a product photo uploaded by a seller.

Your job is to extract structured data from the image to pre-fill a listing form.

Respond with a single JSON object following this schema — no prose, no code fences:
{
  "isAutomotivePart": boolean,
  "category": string | null,          // broad category: "brakes", "engine", "lighting", "suspension", ...
  "subcategory": string | null,       // fine-grained: "brake_disc", "alternator", "headlight", ...
  "oeNumbers": string[],              // every OE/OEM reference visible on the part, normalized (uppercase, no separators)
  "iamNumbers": string[],             // every IAM brand reference visible (Bosch, Febi, Valeo, Zimmermann, ...)
  "brand": string | null,             // visible brand marking if any
  "conditionEstimate": "new" | "used" | "damaged" | null,
  "confidence": number,               // 0-1, your confidence in the extraction as a whole
  "rejectionReason": string | null    // if isAutomotivePart is false, explain briefly
}

Rules:
- If the photo is NOT an automotive part, set isAutomotivePart=false and explain in rejectionReason. Leave all other fields null or empty.
- Normalize part numbers: uppercase, strip spaces / dashes / dots. Example: "34 11 6 792 217" → "34116792217".
- Only include numbers you can read with high confidence. Do not guess.
- Be conservative on conditionEstimate. Prefer "used" over "new" when unsure.`;

/**
 * Parses a Claude Vision response (a raw string) into a typed result.
 * Tolerates code-fence wrapping and leading/trailing prose.
 */
export function parsePhotoInference(raw: string): PhotoInferenceResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in photo inference response");
  }
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    isAutomotivePart: Boolean(parsed.isAutomotivePart),
    category: parsed.category ?? undefined,
    subcategory: parsed.subcategory ?? undefined,
    oeNumbers: Array.isArray(parsed.oeNumbers) ? parsed.oeNumbers : [],
    iamNumbers: Array.isArray(parsed.iamNumbers) ? parsed.iamNumbers : [],
    brand: parsed.brand ?? undefined,
    conditionEstimate: parsed.conditionEstimate ?? undefined,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    rejectionReason: parsed.rejectionReason ?? undefined,
  };
}
