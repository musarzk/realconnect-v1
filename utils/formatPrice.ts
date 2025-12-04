// utils/formatPrice.ts
export function formatPriceNaira(value: number): string {
  if (!isFinite(value) || value === null || value === undefined) return "₦0";
  const clean = (num: number) => {
    const formatted = num.toFixed(1);
    return formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
  };

  if (value >= 1_000_000_000) return `₦${clean(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `₦${clean(value / 1_000_000)}M`;
  if (value >= 1_000) return `₦${value.toLocaleString("en-NG")}`;
  return `₦${value}`;
}

export function formatUsdShort(value: number): string {
  if (!isFinite(value) || value === null || value === undefined) return "$0";
  const clean = (num: number) => {
    const formatted = num.toFixed(1);
    return formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted;
  };

  if (value >= 1_000_000_000) return `$${clean(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `$${clean(value / 1_000_000)}M`;
  if (value >= 1_000) return `$${Math.round(value).toLocaleString("en-US")}`;
  return `$${value.toFixed(2)}`;
}
