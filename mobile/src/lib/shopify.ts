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
  return `${STORE_URL}/cart/${path}?discount=${encodeURICodeURIComponent(brand.promo)}`;
}
