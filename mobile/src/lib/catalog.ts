/**
 * Real Casa Rústico single-origin menu — mirrored from
 * Casa-Rustico/apps/casa-rustico-go/src/catalog.json (Temecula menu).
 * Swap for Shopify Storefront API when wired.
 */

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  category: "coffee" | "gear" | "apparel";
  origin?: string;
  roast?: string;
  notes?: string;
  detail?: string;
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

const coffeeImg = (seed: string) =>
  `https://images.unsplash.com/${seed}?w=900&q=80`;

export const products: Product[] = [
  {
    id: "cr-colombia",
    name: "Colombia",
    subtitle: "Medium · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Medellín, Antioquia",
    roast: "Medium",
    notes: "Dried orange, berry, chocolate",
    detail:
      "Smallholder farms near Medellín. Castillo, Caturra, Colombia & Typica at 1300–1500 m. Fully washed, solar-dried.",
    badge: "House favorite",
    accent: "#8B5E3C",
    image: coffeeImg("photo-1447933601403-0c6688de566e"),
  },
  {
    id: "cr-costa-rica",
    name: "Costa Rica",
    subtitle: "Medium · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Alajuela",
    roast: "Medium",
    notes: "Sweet apple, raisin, honey",
    detail:
      "Micro farms in Alajuela. Caturra & Catuai at 1300–1445 m. Eco-pulped, sun-dried.",
    accent: "#A67C52",
    image: coffeeImg("photo-1514432324607-a09d9b4aefdd"),
  },
  {
    id: "cr-brazil",
    name: "Brazil Santos",
    subtitle: "Medium · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Paraná & São Paulo",
    roast: "Medium",
    notes: "Elegant, smooth, cocoa",
    detail:
      "Fazenda Santa Barbara estates. Catuai & Mundo Novo at 750–1050 m. Pulped natural.",
    accent: "#6B4423",
    image: coffeeImg("photo-1559056199-641a0ac8b55e"),
  },
  {
    id: "cr-ethiopia",
    name: "Ethiopia Natural",
    subtitle: "Med-light · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Sidama Zone",
    roast: "Med-light",
    notes: "Milk chocolate, fruity, caramel",
    detail:
      "Sidama smallholders. Indigenous heirloom cultivars at 1700–1900 m. Full natural on raised beds.",
    badge: "Limited",
    accent: "#9C4A3C",
    image: coffeeImg("photo-1509042239860-f550ce710b93"),
  },
  {
    id: "cr-guatemala",
    name: "Guatemala",
    subtitle: "Medium · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Antigua",
    roast: "Medium",
    notes: "Dark chocolate, bright fruit, butterscotch",
    detail:
      "Antigua smallholders. Bourbon, Catuai, Caturra & Typica at 1200–1616 m. Fully washed.",
    accent: "#7A5C3E",
    image: coffeeImg("photo-1461023058943-07fcbe16d735"),
  },
  {
    id: "cr-sumatra",
    name: "Sumatra",
    subtitle: "12 oz",
    price: 25,
    category: "coffee",
    origin: "Aceh, Takengon",
    roast: "Medium-dark",
    notes: "Dark chocolate, dried fruit, earthy",
    detail:
      "KBQB coop. Wet-hulled (giling basah). Tim Tim, Typica, Ateng at 1100–1600 m.",
    accent: "#4A3728",
    image: coffeeImg("photo-1511920170033-f8396924c348"),
  },
  {
    id: "cr-kenya",
    name: "Kenya",
    subtitle: "12 oz",
    price: 28,
    category: "coffee",
    origin: "Othaya, Nyeri",
    roast: "Medium",
    notes: "Bright, orange, lemon, floral",
    detail:
      "Nyeri County. SL28, SL34, Ruiru 11 & Batian at 1700–1890 m. Fully washed, raised beds.",
    badge: "New",
    accent: "#B87333",
    image: coffeeImg("photo-1495474472287-4d71bcdd2085"),
  },
  {
    id: "cr-honduras",
    name: "Honduras",
    subtitle: "Medium-dark · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Marcala, La Paz",
    roast: "Medium-dark",
    notes: "Caramel, spice, brown sugar",
    detail:
      "Café Orgánicos Marcala cooperative. Fully washed, sun-dried at 1300–1700 m.",
    accent: "#7A5230",
    image: coffeeImg("photo-1442512595331-e89e7384260c"),
  },
  {
    id: "cr-peru",
    name: "Peru",
    subtitle: "Medium · 12 oz",
    price: 25,
    category: "coffee",
    origin: "Piura & Amazonas",
    roast: "Medium",
    notes: "Salted caramel, silky sweet, citrus",
    detail:
      "Cooperativa Norandino. Fully washed at 1100–1700 m.",
    accent: "#8B6914",
    image: coffeeImg("photo-1459756689869-1d9a6a4752e6"),
  },
  {
    id: "cr-capsules",
    name: "Bali Coffee Pods",
    subtitle: "12 pack",
    price: 14.99,
    category: "coffee",
    origin: "Kintamani, Bali",
    notes: "Dark chocolate, molasses, brown sugar",
    detail: "Compatible pods · same single-origin quality in a weekday format.",
    accent: "#C9A85C",
    image: coffeeImg("photo-1610889556528-9a770e32642f"),
  },
  {
    id: "cr-mug",
    name: "White Glossy Mug",
    subtitle: "House mark · 12 oz",
    price: 18,
    category: "gear",
    notes: "Ceramic · dishwasher safe",
    detail: "Everyday house mug with the Casa Rústico mark.",
    accent: "#E8E0D4",
    image: coffeeImg("photo-1514228742587-6b1558fcc036"),
  },
  {
    id: "cr-hoodie",
    name: "House Hoodie",
    subtitle: "Apparel · unisex",
    price: 58,
    category: "apparel",
    notes: "Soft fleece · CR mark",
    detail: "Relaxed fit fleece with embroidered mark.",
    accent: "#2A3326",
    image: coffeeImg("photo-1556821840-3a63f95609a7"),
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}
