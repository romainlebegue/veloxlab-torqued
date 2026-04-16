/**
 * Sponsored tag — MUST be displayed when is_sponsored = true.
 * EU DSA + Omnibus Directive requirement (ADR-003).
 * Never hide or style to be invisible.
 */
export function SponsoredTag() {
  return (
    <span className="inline-block text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
      Sponsorisé
    </span>
  );
}
