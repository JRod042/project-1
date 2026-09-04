import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShopifyCheckoutSheet } from "@shopify/checkout-sheet-kit";
import { colors, fonts, radii } from "../theme";
import { useCart } from "../lib/cart";
import { formatPrice, getProduct } from "../lib/catalog";
import { resolveCheckoutUrl } from "../lib/shopify";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const auth = useShopifyAuth();
  const kit = useShopifyCheckoutSheet();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(auth.session?.customer.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () => cart.lines.reduce((n, l) => n + l.price * l.qty, 0),
    [cart.lines],
  );

  useEffect(() => {
    const completed = kit.addEventListener("completed", () => {
      cart.clear();
      onDone?.();
    });
    const closed = kit.addEventListener("close", () => setBusy(false));
    const failed = kit.addEventListener("error", (err) => {
      setBusy(false);
      setError(err?.message || "Checkout didn’t finish.");
    });
    return () => {
      completed?.remove();
      closed?.remove();
      failed?.remove();
    };
  }, [kit, cart, onDone]);

  useEffect(() => {
    if (!cart.lines.length) return;
    void resolveCheckoutUrl(
      cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
      { token: auth.session?.token, email: email.trim() || auth.session?.customer.email },
    )
      .then((url) => kit.preload(url))
      .catch(() => undefined);
  }, [cart.lines, auth.session?.token, auth.session?.customer.email, email, kit]);

  async function pay() {
    if (!cart.lines.length) return;
    setError("");
    setBusy(true);
    try {
      const url = await resolveCheckoutUrl(
        cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
        {
          token: auth.session?.token,
          email: email.trim() || auth.session?.customer.email,
        },
      );
      kit.present(url);
    } catch (err) {
      setBusy(false);
      setError(err instanceof Error ? err.message : "Could not start checkout.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.bar}>
        <PressableScale onPress={onClose} style={styles.close} accessibilityLabel="Close">
          <Text style={styles.closeText}>Close</Text>
        </PressableScale>
        <Text style={styles.barTitle}>Checkout</Text>
        <View style={styles.close} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Pay in the app.</Text>
        <Text style={styles.sub}>
          Shopify checkout opens as a sheet here. Nothing leaves Casa Rústico.
        </Text>

        {cart.lines.map((line) => {
          const product = getProduct(line.productId);
          return (
            <View key={`${line.productId}-${line.variantId}`} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{product?.name ?? line.productId}</Text>
                <Text style={styles.meta}>
                  {line.variantTitle} · ×{line.qty}
                </Text>
              </View>
              <Text style={styles.price}>{formatPrice(line.price * line.qty)}</Text>
            </View>
          );
        })}

        <Text style={styles.label}>Email for the receipt</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@email.com"
          placeholderTextColor={colors.linenMuted}
        />
        {auth.session?.customer ? (
          <Text style={styles.signed}>
            Signed in as {auth.session.customer.email}
          </Text>
        ) : (
          <Text style={styles.hint}>
            Optional: sign in on You to apply your Shopify account.
          </Text>
        )}

        {error ? <Text style={styles.err}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.payBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PressableScale
          onPress={() => void pay()}
          style={styles.pay}
          accessibilityLabel="Pay"
        >
          {busy ? (
            <ActivityIndicator color={colors.linen} />
          ) : (
            <>
              <Text style={styles.payTitle}>Pay</Text>
              <Text style={styles.paySub}>{formatPrice(total)}</Text>
            </>
          )}
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
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
  },
  close: { minWidth: 64, minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  closeText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 16 },
  barTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.4 },
  body: { paddingHorizontal: 20, paddingBottom: 24 },
  h1: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6 },
  sub: { marginTop: 8, marginBottom: 20, color: colors.linenDim, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 12,
  },
  name: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  meta: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  price: { color: colors.ink, fontFamily: fonts.bodyMed, fontSize: 15 },
  label: { marginTop: 22, color: colors.ink, fontFamily: fonts.bodyMed, fontSize: 13 },
  input: {
    marginTop: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  signed: { marginTop: 8, color: colors.success, fontFamily: fonts.body, fontSize: 13 },
  hint: { marginTop: 8, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  err: { marginTop: 14, color: colors.danger, fontFamily: fonts.body, fontSize: 14 },
  payBar: { paddingHorizontal: 16, paddingTop: 8 },
  pay: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    minHeight: 56,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  payTitle: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 17 },
  paySub: { color: colors.linen, fontFamily: fonts.body, fontSize: 15, opacity: 0.85 },
});
