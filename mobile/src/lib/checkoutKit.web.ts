/**
 * Web stub: Checkout Kit is iOS/Android only. Shop UI still renders.
 */
import { createContext, useContext, type ReactNode } from "react";

export const ColorScheme = {
  light: "light",
  dark: "dark",
  automatic: "automatic",
} as const;

type Kit = {
  present: (url: string) => void;
  preload: (url: string) => void;
  addEventListener: (event: string, cb: () => void) => { remove: () => void };
};

const noopKit: Kit = {
  present: () => undefined,
  preload: () => undefined,
  addEventListener: () => ({ remove: () => undefined }),
};

const Ctx = createContext<Kit>(noopKit);

export function ShopifyCheckoutSheetProvider({
  children,
}: {
  children: ReactNode;
  configuration?: unknown;
}) {
  return children;
}

export function useShopifyCheckoutSheet(): Kit {
  return useContext(Ctx);
}
