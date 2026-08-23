import Constants from "expo-constants";
import { Linking } from "react-native";

const STORE_URL = "https://rusticopr.com";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;
const domain =
  extra.shopifyDomain ||
  process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN ||
  "rusticopr.com";
const token =
  extra.shopifyStorefrontToken ||
  process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ||
  "";

export function isStorefrontEnabled() {
  return Boolean(domain && token);
}

export function productUrl(handle: string) {
  return `${STORE_URL}/products/${handle}`;
}

/** Classic cart permalink — works without Storefront token */
export function cartPermalink(
  lines: { variantId: string | number; qty: number }[]
) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE_URL}/cart`;
  const path = valid.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return `${STORE_URL}/cart/${path}`;
}

export async function openCartOnShopify(
  lines: { variantId: string | number; qty: number }[]
) {
  const url = cartPermalink(lines);
  await Linking.openURL(url);
}

export async function openProductOnShopify(handle: string) {
  await Linking.openURL(productUrl(handle));
}

// --- Storefront GraphQL (activates only when token present) ---
const API = `https://${domain}/api/2024-10/graphql.json`;

async function storefront<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!token) throw new Error("Storefront token missing");
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

export async function fetchProducts() {
  return storefront<{ products: { edges: any[] } }>(`
    query {
      products(first: 50) {
        edges {
          node {
            id handle title description
            priceRange { minVariantPrice { amount currencyCode } }
            images(first: 3) { edges { node { url altText } } }
            variants(first: 10) {
              edges {
                node {
                  id title availableForSale sku
                  price { amount }
                }
              }
            }
          }
        }
      }
    }
  `);
}

export async function createCheckoutUrl(
  lines: { merchandiseId: string | number; quantity: number }[]
) {
  const data = await storefront<{
    cartCreate: { cart: { checkoutUrl: string }; userErrors: any[] };
  }>(
    `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { checkoutUrl }
        userErrors { field message }
      }
    }
  `,
    {
      input: {
        lines: lines.map((l) => ({
          merchandiseId: String(l.merchandiseId).startsWith("gid://")
            ? String(l.merchandiseId)
            : `gid://shopify/ProductVariant/${l.merchandiseId}`,
          quantity: l.quantity,
        })),
      },
    }
  );
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart.checkoutUrl;
}
