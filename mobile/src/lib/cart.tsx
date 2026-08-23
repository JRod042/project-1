import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "casa.cart.v2";

export type CartLine = {
  productId: string;
  variantId: number;
  variantTitle: string;
  qty: number;
  price: number;
};

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  toast: string | null;
  count: number;
  subtotal: number;
  flash: (msg: string) => void;
  add: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (productId: string, variantId: number, qty: number) => void;
  remove: (productId: string, variantId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw) as { cart?: CartLine[] } | CartLine[];
          const next = Array.isArray(parsed) ? parsed : parsed.cart;
          if (Array.isArray(next)) setLines(next);
        } catch {
          /* ignore */
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: lines })).catch(
      () => undefined,
    );
  }, [lines, ready]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 1700);
  }, []);

  const add = useCallback((line: Omit<CartLine, "qty"> & { qty?: number }) => {
    const qty = line.qty ?? 1;
    setLines((prev) => {
      const i = prev.findIndex(
        (l) => l.productId === line.productId && l.variantId === line.variantId,
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { ...line, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, variantId: number, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.variantId === variantId))
        : prev.map((l) =>
            l.productId === productId && l.variantId === variantId ? { ...l, qty } : l,
          ),
    );
  }, []);

  const remove = useCallback((productId: string, variantId: number) => {
    setLines((prev) =>
      prev.filter((l) => !(l.productId === productId && l.variantId === variantId)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((n, l) => n + l.price * l.qty, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      ready,
      toast,
      count,
      subtotal,
      flash,
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, ready, toast, count, subtotal, flash, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
