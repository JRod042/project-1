import Constants from "expo-constants";
import { brand } from "./catalog";

const STORE_URL = "https://rusticopr.com";
const SHOP_DOMAIN =
  (Constants.expoConfig?.extra as any)?.shopifyDomain ||
  process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN ||
  "b84a47-3.myshopify.com";
const STOREFRONT_TOKEN =
  (Constants.expoConfig?.extra as any)?.shopifyStorefrontToken ||
  process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
  "";

const API = `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`;

export function isStorefrontEnabled() {
  return Boolean(STOREFRONT_TOKEN);
}

export function productUrl(handle: string) {
  return `${STORE_URL}/products/${handle}`;
}

function withInAppParams(url: string) {
  try {
    const next = new URL(url);
    next.searchParams.set("discount", next.searchParams.get("discount") || brand.promo);
    next.searchParams.set("skip_shop_pay", "true");
    next.searchParams.set("auto_redirect", "false");
    return next.toString();
  } catch {
    const join = url.includes("?") ? "&" : "?";
    return `${url}${join}skip_shop_pay=true&auto_redirect=false`;
  }
}

/** Classic cart permalink — rusticopr.com checkout, not Shop app. */
export function cartPermalink(
  lines: { variantId: string | number; qty: number }[],
) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE_URL}/cart`;
  const path = valid.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return withInAppParams(
    `${STORE_URL}/cart/${path}?discount=${encodeURIComponent(brand.promo)}`,
  );
}

export function variantGid(id: string | number) {
  const raw = String(id);
  return raw.startsWith("gid://") ? raw : `gid://shopify/ProductVariant/${raw}`;
}

/** Stay on rusticopr.com inside the WebView. Never hand off to shop.app. */
export function keepCheckoutInApp(url: string) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("shop.app")) {
      const back = parsed.searchParams.get("ur_back_url");
      if (back) return keepCheckoutInApp(back);
      return cartPermalink([]);
    }
  } catch {
    return url;
  }
  return withInAppParams(url);
}

export function isExternalCheckoutHandoff(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith("shop-app://") ||
    u.startsWith("shopify://") ||
    u.startsWith("itms") ||
    u.startsWith("market:") ||
    u.startsWith("intent:") ||
    u.includes("://shop.app/") ||
    u.includes("://www.shop.app/")
  );
}

/** Resolve a checkout URL. Never opens a browser. */
export async function resolveCheckoutUrl(
  lines: { variantId: string | number; qty: number }[],
): Promise<string> {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return cartPermalink([]);

  // Notes: permalink is the allowed shape. Keep Shop Pay from stealing the session.
  return cartPermalink(valid);
}

export function isCheckoutCompleteUrl(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes("/thank_you") ||
    u.includes("/thank-you") ||
    u.includes("/orders/") ||
    u.includes("checkout/thank") ||
    /\/checkouts\/[^/]+\/thank/.test(u)
  );
}

async function storefront<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!STOREFRONT_TOKEN) throw new Error("Storefront token missing");
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message || "Storefront error");
  return json.data as T;
}

export async function fetchProducts(first = 50) {
  return storefront<{
    products: {
      edges: {
        node: {
          id: string;
          handle: string;
          title: string;
          description: string;
          priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
          images: { edges: { node: { url: string; altText: string | null } }[] };
          variants: {
            edges: {
              node: {
                id: string;
                title: string;
                availableForSale: boolean;
                price: { amount: string };
                sku: string | null;
              };
            }[];
          };
        };
      }[];
    };
  }>(`
    query Products($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            description
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 3) { edges { node { url altText } } }
            variants(first: 15) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price { amount }
                  sku
                }
              }
            }
          }
        }
      }
    }
  `, { first });
}

export async function createCheckoutUrl(
  lines: { merchandiseId: string; quantity: number }[],
) {
  const data = await storefront<{
    cartCreate: {
      cart: { checkoutUrl: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(`
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { field message }
      }
    }
  `, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: variantGid(l.merchandiseId),
        quantity: l.quantity,
      })),
      discountCodes: brand.promo ? [brand.promo] : [],
    },
  });

  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  const url = data.cartCreate.cart?.checkoutUrl ?? null;
  return url ? keepCheckoutInApp(url) : null;
}
