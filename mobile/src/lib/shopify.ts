import Constants from "expo-constants";
import { brand } from "./catalog";

const STORE_URL = "https://rusticopr.com";
export const SHOPIFY_ACCOUNT_URL = "https://account.rusticopr.com";
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
  return `${STORE_URL}/cart/${path}?discount=${encodeURIComponent(brand.promo)}&skip_shop_pay=true`;
}

export function variantGid(id: string | number) {
  const raw = String(id);
  return raw.startsWith("gid://") ? raw : `gid://shopify/ProductVariant/${raw}`;
}

export async function resolveCheckoutUrl(
  lines: { variantId: string | number; qty: number }[],
  identity?: { token?: string; email?: string },
): Promise<string> {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return cartPermalink([]);

  if (isStorefrontEnabled()) {
    try {
      const url = await createCheckoutUrl(
        valid.map((l) => ({
          merchandiseId: variantGid(l.variantId),
          quantity: l.qty,
        })),
        identity,
      );
      if (url) return url;
    } catch {
      // fall through to permalink
    }
  }
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

type UserError = { message: string; code?: string | null };

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

export type ShopifyCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orders: {
    id: string;
    number: string;
    placedAt: string;
    total: string;
    title: string;
  }[];
};

export async function shopifySignIn(email: string, password: string) {
  const data = await storefront<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: UserError[];
    };
  }>(
    `mutation SignIn($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken { accessToken expiresAt }
        customerUserErrors { code message }
      }
    }`,
    { input: { email, password } },
  );
  const err = data.customerAccessTokenCreate.customerUserErrors[0];
  if (err || !data.customerAccessTokenCreate.customerAccessToken) {
    throw new Error(
      err?.message === "Unidentified customer"
        ? "Email or password doesn’t match this Shopify account."
        : err?.message || "Could not sign in to Shopify.",
    );
  }
  return data.customerAccessTokenCreate.customerAccessToken;
}

export async function shopifyCreateAccount(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const data = await storefront<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: UserError[];
    };
  }>(
    `mutation Create($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer { id }
        customerUserErrors { code message }
      }
    }`,
    { input: { ...input, acceptsMarketing: false } },
  );
  const err = data.customerCreate.customerUserErrors[0];
  if (err || !data.customerCreate.customer) {
    throw new Error(err?.message || "Could not create a Shopify account.");
  }
  return shopifySignIn(input.email, input.password);
}

export async function shopifyCustomer(token: string): Promise<ShopifyCustomer> {
  const data = await storefront<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      orders: {
        edges: {
          node: {
            id: string;
            orderNumber: number;
            processedAt: string;
            totalPrice: { amount: string };
            lineItems: { edges: { node: { title: string } }[] };
          };
        }[];
      };
    } | null;
  }>(
    `query Me($token: String!) {
      customer(customerAccessToken: $token) {
        id firstName lastName email phone
        orders(first: 8, reverse: true) {
          edges {
            node {
              id orderNumber processedAt
              totalPrice { amount }
              lineItems(first: 1) { edges { node { title } } }
            }
          }
        }
      }
    }`,
    { token },
  );
  if (!data.customer) throw new Error("Shopify session expired. Sign in again.");
  const c = data.customer;
  return {
    id: c.id,
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    orders: c.orders.edges.map(({ node }) => ({
      id: node.id,
      number: String(node.orderNumber),
      placedAt: node.processedAt,
      total: node.totalPrice.amount,
      title: node.lineItems.edges[0]?.node.title ?? "Order",
    })),
  };
}

export async function shopifyRecover(email: string) {
  const data = await storefront<{
    customerRecover: { customerUserErrors: UserError[] } | null;
  }>(
    `mutation Recover($email: String!) {
      customerRecover(email: $email) { customerUserErrors { message } }
    }`,
    { email },
  );
  const err = data.customerRecover?.customerUserErrors[0];
  if (err) throw new Error(err.message);
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
  identity?: { token?: string; email?: string },
) {
  const buyerIdentity: Record<string, string> = {};
  if (identity?.token) buyerIdentity.customerAccessToken = identity.token;
  if (identity?.email) buyerIdentity.email = identity.email;

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
      ...(Object.keys(buyerIdentity).length ? { buyerIdentity } : {}),
    },
  });

  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart?.checkoutUrl ?? null;
}
