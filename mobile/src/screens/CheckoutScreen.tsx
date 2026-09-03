import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import {
  isCheckoutCompleteUrl,
  isExternalCheckoutHandoff,
  keepCheckoutInApp,
  resolveCheckoutUrl,
} from "../lib/shopify";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

type Phase = "loading" | "ready" | "done" | "error";

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    let alive = true;
    resolveCheckoutUrl(cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })))
      .then((next) => {
        if (!alive) return;
        setUrl(keepCheckoutInApp(next));
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
    // Mounted only when Check Out is tapped — capture those lines.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = () => {
    if (finished.current) return;
    finished.current = true;
    cart.clear();
    cart.flash("Order placed");
    setPhase("done");
  };

  const loadInWebView = (next: string) => {
    const safe = keepCheckoutInApp(next);
    setUrl(safe);
    webRef.current?.injectJavaScript(
      `window.location.replace(${JSON.stringify(safe)}); true;`,
    );
  };

  const onNav = (nav: WebViewNavigation) => {
    if (nav.url && isCheckoutCompleteUrl(nav.url)) complete();
  };

  const onShouldStart = (req: { url: string }) => {
    const next = req.url;
    if (!next) return true;
    if (isCheckoutCompleteUrl(next)) {
      complete();
      return false;
    }
    if (isExternalCheckoutHandoff(next)) {
      loadInWebView(next);
      return false;
    }
    return true;
  };

  const onOpenWindow = (event: { nativeEvent: { targetUrl: string } }) => {
    const next = event.nativeEvent.targetUrl;
    if (!next) return;
    if (isCheckoutCompleteUrl(next)) {
      complete();
      return;
    }
    loadInWebView(next);
  };

  if (phase === "done") {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
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
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <PressableScale onPress={onClose} accessibilityLabel="Close checkout">
          <Text style={styles.barAction}>Close</Text>
        </PressableScale>
        <Text style={styles.barTitle}>Checkout</Text>
        <View style={styles.barSpacer} />
      </View>
      <WebView
        ref={webRef}
        source={{ uri: url }}
        onNavigationStateChange={onNav}
        onShouldStartLoadWithRequest={onShouldStart}
        onOpenWindow={onOpenWindow}
        setSupportMultipleWindows={false}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsBackForwardNavigationGestures
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
    minHeight: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
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
