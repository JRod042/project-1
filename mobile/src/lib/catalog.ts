/** Mock catalog — mirrors rusticopr.com; swap for Shopify Storefront API later. */

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: "coffee" | "gear" | "apparel";
  origin?: string;
  notes?: string;
  badge?: string;
  accent: string;
};

export const brand = {
  name: "Casa Rústico",
  tagline: "Colombia leads · single-origin menu",
  promo: "MORNING10 — 10% off your first bag",
  site: "rusticopr.com",
};

export const products: Product[] = [
  {
    id: "cr-colombia",
    name: "Colombia",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Colombia",
    notes: "Caramel, cocoa, clean finish",
    badge: "House favorite",
    accent: "#8B5E3C",
  },
  {
    id: "cr-costa-rica",
    name: "Costa Rica",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Costa Rica",
    notes: "Bright citrus, honey, floral",
    accent: "#A67C52",
  },
  {
    id: "cr-brazil",
    name: "Brazil Santos",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Brazil",
    notes: "Nutty, smooth, low acid",
    accent: "#6B4423",
  },
  {
    id: "cr-ethiopia",
    name: "Ethiopia Natural",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Ethiopia",
    notes: "Berry, jasmine, winey",
    badge: "Limited",
    accent: "#9C4A3C",
  },
  {
    id: "cr-guatemala",
    name: "Guatemala",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Guatemala",
    notes: "Chocolate, spice, balanced",
    accent: "#7A5C3E",
  },
  {
    id: "cr-sumatra",
    name: "Sumatra",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Sumatra",
    notes: "Earth, tobacco, full body",
    accent: "#4A3728",
  },
  {
    id: "cr-capsules",
    name: "Single Serve Capsules",
    subtitle: "Compatible pods · 10 ct",
    price: 14.99,
    category: "coffee",
    notes: "Same single-origin quality, pod format",
    accent: "#C9A85C",
  },
  {
    id: "cr-mug",
    name: "White Glossy Mug",
    subtitle: "House mark · 12 oz",
    price: 18,
    category: "gear",
    notes: "Ceramic · dishwasher safe",
    accent: "#E8E0D4",
  },
  {
    id: "cr-hoodie",
    name: "House Hoodie",
    subtitle: "Apparel · unisex",
    price: 58,
    category: "apparel",
    notes: "Soft fleece · CR mark",
    accent: "#2A3326",
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}
