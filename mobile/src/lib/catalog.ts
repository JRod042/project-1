/** Catalog with photography — swap for Shopify Storefront API later. */

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
  image: string;
};

export const brand = {
  name: "Casa Rústico",
  tagline: "Single-origin. Ship ready.",
  promo: "MORNING10 — 10% off your first bag",
  site: "rusticopr.com",
  heroImage:
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
};

export const products: Product[] = [
  {
    id: "cr-colombia",
    name: "Colombia",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Colombia",
    notes: "Caramel, cocoa, clean finish — our house daily driver.",
    badge: "House favorite",
    accent: "#8B5E3C",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80",
  },
  {
    id: "cr-costa-rica",
    name: "Costa Rica",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Costa Rica",
    notes: "Bright citrus, honey, floral — light and lively.",
    accent: "#A67C52",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&q=80",
  },
  {
    id: "cr-brazil",
    name: "Brazil Santos",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Brazil",
    notes: "Nutty, smooth, low acid — perfect espresso base.",
    accent: "#6B4423",
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=900&q=80",
  },
  {
    id: "cr-ethiopia",
    name: "Ethiopia Natural",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Ethiopia",
    notes: "Berry, jasmine, winey — weekend pour-over.",
    badge: "Limited",
    accent: "#9C4A3C",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=80",
  },
  {
    id: "cr-guatemala",
    name: "Guatemala",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Guatemala",
    notes: "Chocolate, spice, balanced — crowd-pleaser roast.",
    accent: "#7A5C3E",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=80",
  },
  {
    id: "cr-sumatra",
    name: "Sumatra",
    subtitle: "Single-origin · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Sumatra",
    notes: "Earth, tobacco, full body — bold French press.",
    accent: "#4A3728",
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=900&q=80",
  },
  {
    id: "cr-capsules",
    name: "Single Serve Capsules",
    subtitle: "Compatible pods · 10 ct",
    price: 14.99,
    category: "coffee",
    notes: "Same single-origin quality, pod format for busy mornings.",
    accent: "#C9A85C",
    image:
      "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=900&q=80",
  },
  {
    id: "cr-mug",
    name: "White Glossy Mug",
    subtitle: "House mark · 12 oz",
    price: 18,
    category: "gear",
    notes: "Ceramic · dishwasher safe · CR mark.",
    accent: "#E8E0D4",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcc036?w=900&q=80",
  },
  {
    id: "cr-hoodie",
    name: "House Hoodie",
    subtitle: "Apparel · unisex",
    price: 58,
    category: "apparel",
    notes: "Soft fleece with the Casa Rústico mark.",
    accent: "#2A3326",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80",
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}
