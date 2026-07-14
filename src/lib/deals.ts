export type DealKey = "sale71" | "sale18" | "sale5";

export type Deal = {
  label: string;
  bottles: number;
  months: string;
  price: number;
  retail: number;
  perUnit: number;
  badge?: string;
};

export const DEALS: Record<DealKey, Deal> = {
  sale71: {
    label: "Compra 4 llévate 3 GRATIS",
    bottles: 7,
    months: "7 meses de suministro",
    price: 599.95,
    retail: 1839.95,
    perUnit: 85.7,
    badge: "MEJOR OFERTA",
  },
  sale18: {
    label: "Compra 3 llévate 2 GRATIS",
    bottles: 5,
    months: "5 meses de suministro",
    price: 449.95,
    retail: 1299.95,
    perUnit: 89.99,
    badge: "MÁS POPULAR",
  },
  sale5: {
    label: "Compra 2 llévate 1 GRATIS",
    bottles: 3,
    months: "3 meses de suministro",
    price: 299.95,
    retail: 789.95,
    perUnit: 99.98,
  },
};

export const DEAL_KEYS = Object.keys(DEALS) as DealKey[];

export function resolveDealKey(deal: string | null): DealKey {
  return deal && deal in DEALS ? (deal as DealKey) : "sale18";
}
