import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { isCheckoutCompleteUrl } from "../lib/shopify";
import { PressableScale } from "./PressableScale";

const INJECT = `
(function () {
  try {
    window.open = function (u) {
      if (u) location.href = u;
      return window;
    };
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a || !a.href) return;
      if (/shop\\.app|shop:\\/\\/|itms-apps|apps\\.apple\\.com/i.test(a.href)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  } catch (e) {}
})();
true;
`;

function blocked(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith("shop://") ||
    u.startsWith("shop-currency://") ||
    u.startsWith("itms") ||
    u.startsWith("intent:") ||
    u.startsWith("market://") ||
    u.includes("shop.app") ||
    u.includes("apps.apple.com")
  );
}

type Props = {
  url: string;
  title?: string;
  onClose: () => void;
  onComplete?: () => void;
};

export function ShopifySheet({ url, title = "Shopify", onClose, onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const ref = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const done = useRef(false);

  const source = useMemo(() => ({ uri: url }), [url]);

  function onNav(nav: WebViewNavigation) {
    if (done.current) return;
    if (onComplete && isCheckoutCompleteUrl(nav.url)) {
      done.current = true;
      onComplete();
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <PressableScale onPress={onClose} style={styles.close} accessibilityLabel="Close">
          <Text style={styles.closeText}>Close</Text>
        </PressableScale>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.close} />
      </View>
      {error ? (
        <View style={styles.errBox}>
          <Text style={styles.err}>{error}</Text>
          <PressableScale onPress={() => { setError(""); ref.current?.reload(); }} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </PressableScale>
          <PressableScale onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </PressableScale>
        </View>
      ) : (
        <WebView
          ref={ref}
          source={source}
          style={styles.web}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          originWhitelist={["*"]}
          incognito={false}
          allowsBackForwardNavigationGestures
          applicationNameForUserAgent="CasaRustico"
          injectedJavaScript={INJECT}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={onNav}
          onShouldStartLoadWithRequest={(req) => {
            if (!req.url) return true;
            return !blocked(req.url);
          }}
          onOpenWindow={(e) => {
            const target = e.nativeEvent.targetUrl;
            if (target && !blocked(target)) {
              ref.current?.injectJavaScript(
                `location.href = ${JSON.stringify(target)}; true;`,
              );
            }
          }}
          onHttpError={(e) => {
            if (e.nativeEvent.statusCode >= 500) {
              setError("Shopify is not responding. Try again.");
            }
          }}
          onError={(e) => setError(e.nativeEvent.description || "Could not load Shopify.")}
          renderLoading={() => (
            <View style={styles.spin}>
              <ActivityIndicator color={colors.brass} />
            </View>
          )}
        />
      )}
      {loading && !error ? (
        <View pointerEvents="none" style={styles.spin}>
          <ActivityIndicator color={colors.brass} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bar: {
    height: 52,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.bg,
  },
  close: { minWidth: 64, minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  closeText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 16 },
  title: {
    flex: 1,
    textAlign: "center",
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  web: { flex: 1, backgroundColor: colors.bg },
  spin: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  errBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 12 },
  err: { color: colors.linenDim, fontFamily: fonts.body, fontSize: 16, textAlign: "center" },
  retry: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
});
