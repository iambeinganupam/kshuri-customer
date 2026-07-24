// ─────────────────────────────────────────────────────────────────────────────
// Number / currency formatting helpers.
// Extracted from lib/data.ts so the data file can shrink to zero.
// ─────────────────────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getPriceRange(min: number, max: number): string {
  return `${formatINR(min)} - ${formatINR(max)}`
}
