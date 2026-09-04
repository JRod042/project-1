import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import { resolveCheckoutUrl } from "../lib/shopify";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

type Phase = "loading" | "open" | "error";

export function CheckoutScreen({ onClose }: Props) {
  const cart = useCart();
  const auth = useShopifyAuth();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const running = useRef(false);
  const lines = useRef(cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })));

  const start = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setPhase("loading");
    setError(null);
    try {
      const url = await resolveCheckoutUrl(lines.current, {
        token: auth.session?.token,
        email: auth.session?.customer.email,
      });
      setPhase("open");
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        dismissButtonStyle: "close",
        controlsColor: "#8B5E3C",
        toolbarColor: "#F5EAD8",
        enableBarCollapsing: false,
        showTitle: true,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setPhase("error");
      running.current = false;
    }
  }, [onClose, auth.session?.token, auth.session?.customer.email]);

  useEffect(() => {
    void start();
  }, [start]);

  if (phase === "error") {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>Checkout paused.</Text>
        <Text style={styles.copy}>{error ?? "Something went wrong starting checkout."}</Text>
        <PressableScale onPress={() => void start()} style={styles.cta}>
          <Text style={styles.ctaText}>Try again</Text>
        </PressableScale>
        <PressableScale onPress={onClose} style={styles.ghost}>
          <Text style={styles.ghostText}>Back to bag</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator color={colors.brass} />
      <Text style={styles.copy}>Opening Shopify checkout...</Text>
      <PressableScale onPress={onClose}>
        <Text style={styles.link}>Cancel</Text>
      </PressableScale>
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
