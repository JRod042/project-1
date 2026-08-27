import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import { isCheckoutCompleteUrl, resolveCheckoutUrl } from "../lib/shopify";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

type Phase = "loading" | "ready" | "done" | "error";

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const [phase, setPhase] = useState<Phase>("loading");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    let alive = true;
    resolveCheckoutUrl(cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })))
      .then((next) => {
        if (!alive) return;
        setUrl(next);
        setPhase("ready");
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Could not start checkout");
        setPhase("error");
      });
    return () => {
      alive = false;
    };
  }, []);

  const complete = () => {
    if (finished.current) return;
    finished.current = true;
    cart.clear();
    cart.flash("Order placed");
    setPhase("done");
  };

  const onNav = (nav: WebViewNavigation) => {
    if (nav.url && isCheckoutCompleteUrl(nav.url)) complete();
  };

  if (phase === "done") {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Thank you.</Text>
        <Text style={styles.copy}>Your order is confirmed. A receipt is on the way.</Text>
        <PressableScale onPress={() => (onDone ? onDone() : onClose())} style={styles.cta}>
          <Text style={styles.ctaText}>Back to shop</Text>
        </PressableScale>
      </View>
    );
  }

  if (phase === "error") {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Checkout paused.</Text>
        <Text style={styles.copy}>{error ?? "Something went wrong starting checkout."}</Text>
        <PressableScale onPress={onClose} style={styles.ghost}>
          <Text style={styles.ghostText}>Back to bag</Text>
        </PressableScale>
      </View>
    );
  }

  if (phase === "loading" || !url) {
    return (
      <View style={styles.root}>
        <ActivityIndicator color={colors.brass} />
        <Text style={styles.copy}>Preparing checkout...</Text>
        <PressableScale onPress={onClose}>
          <Text style={styles.link}>Cancel</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View style={styles.sheet}>
      <View style={styles.bar}>
        <PressableScale onPress={onClose} accessibilityLabel="Close checkout">
          <Text style={styles.barAction}>Close</Text>
        </PressableScale>
        <Text style={styles.barTitle}>Checkout</Text>
        <View style={styles.barSpacer} />
      </View>
      <WebView
        source={{ uri: url }}
        onNavigationStateChange={onNav}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        originWhitelist={["https://*", "http://*"]}
        style={styles.web}
      />
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
  sheet: { flex: 1, backgroundColor: colors.bg },
  bar: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  barTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  barAction: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 16, width: 64 },
  barSpacer: { width: 64 },
  web: { flex: 1, backgroundColor: colors.paper },
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
