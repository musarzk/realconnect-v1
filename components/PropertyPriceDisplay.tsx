// components/PropertyPriceDisplay.tsx
"use client";
import React from "react";
import { formatPriceNaira, formatUsdShort } from "@/utils/formatPrice";

export default function PropertyPriceDisplay({ priceNgn, priceUsd }: { priceNgn: number; priceUsd?: number | null }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-semibold">{formatPriceNaira(Number(priceNgn))}</span>
      {priceUsd != null && (
        <span className="text-sm text-muted-foreground">({formatUsdShort(Number(priceUsd))})</span>
      )}
    </div>
  );
}
