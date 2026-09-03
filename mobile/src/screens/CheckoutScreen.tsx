import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import { brand, formatPrice, getProduct } from "../lib/catalog";
import {
  loadCheckoutPrefs,
  saveCheckoutPrefs,
  type CheckoutPrefs,
  type Fulfillment,
} from "../lib/checkoutPrefs";
import { isCheckoutCompleteUrl, resolveCheckoutUrl } from "../lib/shopify";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

type Phase = "review" | "loading" | "pay" | "done" | "error";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROMO_RATE = 0.1;
const SHIP_FLAT = 5.95;
const FREE_SHIP = 50;

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<Phase>("review");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<CheckoutPrefs>({
    name: "",
    email: "",
    phone: "",
    fulfillment: "ship",
  });
  const finished = useRef(false);

  useEffect(() => {
    loadCheckoutPrefs().then(setPrefs);
  }, []);

  const discount = Math.round(cart.subtotal * PROMO_RATE * 100) / 100;
  const afterPromo = Math.max(0, cart.subtotal - discount);
  const shipping =
    prefs.fulfillment === "pickup" ? 0 : afterPromo >= FREE_SHIP ? 0 : SHIP_FLAT;
  const total = afterPromo + shipping;

  const patch = (partial: Partial<CheckoutPrefs>) =>
    setPrefs((cur) => ({ ...cur, ...partial }));

  const startPay = async () => {
    if (!prefs.name.trim()) {
      setError("Add a name so we know who the order is for.");
      return;
    }
    if (!EMAIL.test(prefs.email.trim())) {
      setError("Add a valid email for the receipt.");
      return;
    }
    setError(null);
    await saveCheckoutPrefs(prefs);
    setPhase("loading");
    try {
      const next = await resolveCheckoutUrl(
        cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
        {
          email: prefs.email.trim(),
          phone: prefs.phone.trim() || undefined,
          fulfillment: prefs.fulfillment,
        },
      );
      setUrl(next);
      setPhase("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setPhase("error");
    }
  };

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

  const onShouldStart = (req: { url: string }) => {
    const next = req.url;
    if (!next) return true;
    if (isCheckoutCompleteUrl(next)) {
      complete();
      return false;
    }
    if (
      next.startsWith("itms") ||
      next.startsWith("market:") ||
      next.startsWith("intent:") ||
      next.startsWith("shop-app://") ||
      next.startsWith("shopify://")
    ) {
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
    webRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(next)}; true;`,
    );
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
        <PressableScale onPress={() => setPhase("review")} style={styles.ghost}>
          <Text style={styles.ghostText}>Back to review</Text>
        </PressableScale>
      </View>
    );
  }

  if (phase === "loading") {
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

  if (phase === "pay" && url) {
    return (
      <View style={styles.sheet}>
        <View style={[styles.bar, { paddingTop: insets.top }]}>
          <PressableScale onPress={() => setPhase("review")} accessibilityLabel="Back to review">
            <Text style={styles.barAction}>Back</Text>
          </PressableScale>
          <Text style={styles.barTitle}>Pay</Text>
          <PressableScale onPress={onClose} accessibilityLabel="Close checkout">
            <Text style={[styles.barAction, { textAlign: "right" }]}>Close</Text>
          </PressableScale>
        </View>
        <WebView
          ref={webRef}
          source={{ uri: url }}
          onNavigationStateChange={onNav}
          onShouldStartLoadWithRequest={onShouldStart}
          onOpenWindow={onOpenWindow}
          setSupportMultipleWindows
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

  return (
    <KeyboardAvoidingView
      style={styles.sheet}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.bar, { paddingTop: insets.top }]}>
        <PressableScale onPress={onClose} accessibilityLabel="Close checkout">
          <Text style={styles.barAction}>Close</Text>
        </PressableScale>
        <Text style={styles.barTitle}>Checkout</Text>
        <View style={styles.barSpacer} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.review, { paddingBottom: 28 + insets.bottom + 88 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>BAG</Text>
        {cart.lines.map((line) => {
          const product = getProduct(line.productId);
          return (
            <View key={`${line.productId}-${line.variantId}`} style={styles.row}>
              {product ? <Image source={{ uri: product.image }} style={styles.thumb} /> : null}
              <View style={styles.meta}>
                <Text style={styles.name}>{product?.name ?? line.productId}</Text>
                <Text style={styles.variant}>
                  {line.variantTitle} · ×{line.qty}
                </Text>
              </View>
              <Text style={styles.linePrice}>{formatPrice(line.price * line.qty)}</Text>
            </View>
          );
        })}

        <Text style={[styles.kicker, styles.section]}>HOW YOU’LL GET IT</Text>
        <View style={styles.segment}>
          {(["pickup", "ship"] as Fulfillment[]).map((id) => {
            const on = prefs.fulfillment === id;
            return (
              <PressableScale
                key={id}
                onPress={() => patch({ fulfillment: id })}
                style={[styles.segBtn, on && styles.segBtnOn]}
              >
                <Text style={[styles.segTitle, on && styles.segTitleOn]}>
                  {id === "pickup" ? "Pickup" : "Ship"}
                </Text>
                <Text style={[styles.segHint, on && styles.segHintOn]}>
                  {id === "pickup"
                    ? "Packed in 2–3 days · free"
                    : shipping === 0
                      ? "Free over $50"
                      : "3–6 days"}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <Text style={styles.help}>
          {prefs.fulfillment === "pickup"
            ? "Partner roaster, packed in the U.S. We’ll email when the bag is ready."
            : `Ships from the U.S. Free over $50, otherwise ${formatPrice(SHIP_FLAT)}.`}
        </Text>

        <Text style={[styles.kicker, styles.section]}>CONTACT</Text>
        <Field label="Name" value={prefs.name} autoComplete="name" onChange={(name) => patch({ name })} />
        <Field
          label="Email"
          value={prefs.email}
          autoComplete="email"
          keyboardType="email-address"
          onChange={(email) => patch({ email })}
        />
        <Field
          label="Phone"
          value={prefs.phone}
          autoComplete="tel"
          keyboardType="phone-pad"
          onChange={(phone) => patch({ phone })}
        />

        <View style={styles.promo}>
          <Text style={styles.kicker}>PROMO</Text>
          <Text style={styles.promoCode}>{brand.promo}</Text>
          <Text style={styles.help}>{brand.promoCopy} applied at pay.</Text>
        </View>

        <View style={styles.totals}>
          <TotalRow label="Subtotal" value={formatPrice(cart.subtotal)} />
          <TotalRow label={brand.promo} value={`−${formatPrice(discount)}`} />
          <TotalRow
            label="Shipping"
            value={shipping === 0 ? "Free" : formatPrice(shipping)}
          />
          <TotalRow label="Total" value={formatPrice(total)} strong />
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
      </ScrollView>
      <View style={[styles.payBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PressableScale onPress={() => void startPay()} style={styles.payBtn} accessibilityLabel="Pay">
          <Text style={styles.payTitle}>Pay</Text>
          <Text style={styles.paySub}>{formatPrice(total)}</Text>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  autoComplete,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: TextInputProps["autoComplete"];
  keyboardType?: TextInputProps["keyboardType"];
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        placeholderTextColor={colors.linenMuted}
        style={styles.input}
      />
    </View>
  );
}

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.totalStrong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.totalStrong]}>{value}</Text>
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
  review: { paddingHorizontal: 20, paddingTop: 16 },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2,
  },
  section: { marginTop: 22, marginBottom: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.paper },
  meta: { flex: 1 },
  name: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 15 },
  variant: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  linePrice: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  segment: { flexDirection: "row", gap: 8 },
  segBtn: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  segBtnOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  segTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 15 },
  segTitleOn: { color: colors.linen },
  segHint: { marginTop: 3, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12 },
  segHintOn: { color: "rgba(245,234,216,0.7)" },
  help: { marginTop: 10, color: colors.linenDim, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  field: { marginBottom: 12 },
  label: { color: colors.linenDim, fontFamily: fonts.bodyMed, fontSize: 13, marginBottom: 6 },
  input: {
    minHeight: 48,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  promo: {
    marginTop: 8,
    backgroundColor: colors.kraft,
    borderRadius: radii.md,
    padding: 16,
  },
  promoCode: { marginTop: 6, color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  totals: { marginTop: 20, gap: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { color: colors.linenDim, fontFamily: fonts.body, fontSize: 14 },
  totalValue: { color: colors.ink, fontFamily: fonts.body, fontSize: 14 },
  totalStrong: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  err: { marginTop: 12, color: colors.danger, fontFamily: fonts.bodyMed, fontSize: 13 },
  payBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  payBtn: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    minHeight: 52,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  payTitle: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
  paySub: { color: colors.linen, fontFamily: fonts.body, fontSize: 13, opacity: 0.8 },
});
