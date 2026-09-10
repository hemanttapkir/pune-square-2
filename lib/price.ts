// Shared helpers for parsing and formatting the free-text price strings
// used throughout the site (e.g. "₹65 Lakhs", "1.2Cr", "₹85L").

/** Parse a free-text price string into a value in lakhs, or null if unparseable. */
export function parsePriceToLakh(price?: string | null): number | null {
  if (!price) return null;
  const cleaned = price.replace(/,/g, '');
  const match = cleaned.match(/([\d.]+)\s*(cr(?:ore)?s?|l(?:akh)?s?)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  return match[2].toLowerCase().startsWith('cr') ? value * 100 : value;
}

/** Format a lakh value back into a compact ₹ string, e.g. 65 -> "₹65L", 250 -> "₹2.5Cr". */
export function formatLakh(lakh: number): string {
  if (lakh >= 100) {
    const cr = lakh / 100;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/0$/, '')}Cr`;
  }
  return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)}L`;
}

export interface UnitPricingRow {
  unit_type: string;
  carpet_area: string;
  price: string;
}

/** Derive a starting-price label and sortable lakh value from a project's unit pricing rows. */
export function getStartingPrice(unitPricing?: UnitPricingRow[] | null): {
  label: string | null;
  lakh: number | null;
} {
  if (!unitPricing || unitPricing.length === 0) return { label: null, lakh: null };

  const parsed = unitPricing
    .map((u) => parsePriceToLakh(u.price))
    .filter((v): v is number => v !== null);

  if (parsed.length === 0) return { label: null, lakh: null };

  const min = Math.min(...parsed);
  return { label: formatLakh(min), lakh: min };
}

/** Derive a min–max price range label across all unit types, e.g. "₹75L – ₹1.4Cr". */
export function getPriceRange(unitPricing?: UnitPricingRow[] | null): string | null {
  if (!unitPricing || unitPricing.length === 0) return null;
  const parsed = unitPricing
    .map((u) => parsePriceToLakh(u.price))
    .filter((v): v is number => v !== null);
  if (parsed.length === 0) return null;
  const min = Math.min(...parsed);
  const max = Math.max(...parsed);
  if (min === max) return formatLakh(min);
  return `${formatLakh(min)} – ${formatLakh(max)}`;
}
