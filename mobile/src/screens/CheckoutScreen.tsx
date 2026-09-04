import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import { resolveCheckoutUrl } from "../lib/shopify";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { PressableScale } from "../components/PressableScale";
import { ShopifySheet } from "../components/ShopifySheet";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const auth = useShopifyAuth();
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const lines = useRef(cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })));

  useEffect(() => {
    let alive = true;
    setError(null);
    setUrl(null);
    void (async () => {
      try {
        const next = await resolveCheckoutUrl(lines.current, {
          token: auth.session?.token,
          email: auth.session?.customer.email,
        });
        if (alive) setUrl(next);
      } catch (err) {
        if (alive) setError(err instanceof Error ? err.message : "Could not start checkout");
      }
    })();
    return () => {
      alive = false;
    };
  }, [tick, auth.session?.token, auth.session?.customer.email]);

  if (url) {
    return (
      <ShopifySheet
        url={url}
        title="Checkout"
        onClose={onClose}
        onComplete={() => {
          cart.clear();
          onDone?.();
          onClose();
        }}
      />
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {error ? (
        <>
          <Text style={styles.title}>Checkout paused.</Text>
          <Text style={styles.copy}>{error}</Text>
          <PressableScale
            onPress={() => setTick((n) => n + 1)}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Try again</Text>
          </PressableScale>
          <PressableScale onPress={onClose} style={styles.ghost}>
            <Text style={styles.ghostText}>Back to bag</Text>
          </PressableScale>
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.brass} />
          <Text style={styles.copy}>Opening Shopify checkout in the app…</Text>
          <PressableScale onPress={onClose}>
            <Text style={styles.link}>Cancel</Text>
          </PressableScale>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 16,
  },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.5 },
  copy: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  link: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 15 },
  cta: {
    marginTop: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 15 },
  ghost: { paddingVertical: 10 },
  ghostText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 15 },
});
