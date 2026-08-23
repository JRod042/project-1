import { Linking } from "react-native";
import { brand } from "./catalog";

const STORE_URL = "https://rusticopr.com";

export function productUrl(handle: string) {
  return `${STORE_URL}/products/${handle}`;
}

/** Classic cart permalink — no Storefront token. Applies MORNING10 at checkout. */
export function cartPermalink(lines: { variantId: string | number; qty: number }[]) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE_URL}/cart`;
  const path = valid.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return `${STORE_URL}/cart/${path}?discount=${encodeURIComponent(brand.promo)}`;
}

export async function openCartOnShopify(
  lines: { variantId: string | number; qty: number }[],
) {
  await Linking.openURL(cartPermalink(lines));
}

export async function openProductOnShopify(handle: string) {
  await Linking.openURL(productUrl(handle));
}
