import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import {
  shopifyCreateAccount,
  shopifyCustomer,
  shopifySignIn,
  type ShopifyCustomer,
} from "./shopify";

const TOKEN_KEY = "casa.shopify.token";
const EXP_KEY = "casa.shopify.expires";

export type ShopifySession = {
  token: string;
  expiresAt: string;
  customer: ShopifyCustomer;
};

type Ctx = {
  session: ShopifySession | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  createAccount: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

const ShopifyAuthContext = createContext<Ctx | null>(null);

export function ShopifyAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ShopifySession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const expiresAt = (await SecureStore.getItemAsync(EXP_KEY)) ?? "";
        if (!token) return;
        if (expiresAt && Date.parse(expiresAt) < Date.now()) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(EXP_KEY);
          return;
        }
        const customer = await shopifyCustomer(token);
        setSession({ token, expiresAt, customer });
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
        await SecureStore.deleteItemAsync(EXP_KEY).catch(() => undefined);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (token: string, expiresAt: string) => {
    const customer = await shopifyCustomer(token);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(EXP_KEY, expiresAt);
    setSession({ token, expiresAt, customer });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const tok = await shopifySignIn(email.trim(), password);
      await persist(tok.accessToken, tok.expiresAt);
    },
    [persist],
  );

  const createAccount = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const tok = await shopifyCreateAccount(input);
      await persist(tok.accessToken, tok.expiresAt);
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
    await SecureStore.deleteItemAsync(EXP_KEY).catch(() => undefined);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, createAccount, signOut }),
    [session, ready, signIn, createAccount, signOut],
  );

  return (
    <ShopifyAuthContext.Provider value={value}>
      {children}
    </ShopifyAuthContext.Provider>
  );
}

export function useShopifyAuth() {
  const ctx = useContext(ShopifyAuthContext);
  if (!ctx) throw new Error("useShopifyAuth outside provider");
  return ctx;
}
