import { Linking } from "react-native";
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

/** Classic cart permalink — works without Storefront token. Applies MORNING10. */
export function cartPermalink(
  lines: { variantId: string | number; qty: number }[],
) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE_URL}/cart`;
  const path = valid.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return `${STORE_URL}/cart/${path}?discount=${encodeURIComponent(brand.promo)}`;
}

export async function openCartOnShopify(
  lines: { variantId: string | number; qty: number }[],
) {
  // Prefer GraphQL cart when token present; fall back to permalink
  if (isStorefrontEnabled() && lines.length) {
    try {
      const checkoutUrl = await createCheckoutUrl(
        lines.map((l) => ({
          merchandiseId: String(l.variantId),
          quantity: l.qty,
        })),
      );
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
        return;
      }
    } catch {
      // fall through to permalink
    }
  }
  await Linking.openURL(cartPermalink(lines));
}

export async function openProductOnShopify(handle: string) {
  await Linking.openURL(productUrl(handle));
}

// ── Storefront GraphQL ──

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
        merchandiseId: l.merchandiseId.startsWith("gid://")
          ? l.merchandiseId
          : `gid://shopify/ProductVariant/${l.merchandiseId}`,
        quantity: l.quantity,
      })),
    },
  });

  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart?.checkoutUrl ?? null;
}
