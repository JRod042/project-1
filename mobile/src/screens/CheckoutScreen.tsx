import { useMemo, useState } from "react";
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
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "../theme";
import { formatPrice, getProduct } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenFade } from "../components/ScreenFade";

type Step = "contact" | "shipping" | "payment" | "review" | "done";

type Props = {
  onClose: () => void;
  onDone: () => void;
};

export function CheckoutScreen({ onClose, onDone }: Props) {
  const cart = useCart();
  const [step, setStep] = useState<Step>("contact");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [payMethod, setPayMethod] = useState<"card" | "apple">("apple");

  const shipping = 0;
  const tax = Math.round(cart.subtotal * 0.0825 * 100) / 100;
  const total = cart.subtotal + shipping + tax;

  const lines = useMemo(
    () =>
      cart.lines
        .map((l) => {
          const p = getProduct(l.productId);
          return p ? { ...l, product: p } : null;
        })
        .filter(Boolean) as {
        productId: string;
        qty: number;
        product: NonNullable<ReturnType<typeof getProduct>>;
      }[],
    [cart.lines]
  );

  const placeOrder = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    const id = `CR-${Date.now().toString().slice(-8)}`;
    setOrderId(id);
    cart.clear();
    setBusy(false);
    setStep("done");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const steps: Step[] = ["contact", "shipping", "payment", "review"];
  const stepIndex = steps.indexOf(step === "done" ? "review" : step);

  return (
    <ScreenFade>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <PressableScale onPress={onClose} style={styles.back}>
            <Text style={styles.backText}>
              {step === "done" ? "Close" : "← Bag"}
            </Text>
          </PressableScale>
          <Text style={styles.title}>
            {step === "done" ? "Order placed" : "Checkout"}
          </Text>
          {step !== "done" ? (
            <View style={styles.progress}>
              {steps.map((s, i) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    i <= stepIndex && styles.dotOn,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === "contact" ? (
            <>
              <Text style={styles.section}>Contact</Text>
              <GlassPanel style={styles.panel}>
                <Field
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="you@email.com"
                />
                <Field
                  label="Full name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Name on order"
                />
              </GlassPanel>
              <PressableScale
                style={styles.primary}
                onPress={() => setStep("shipping")}
                disabled={!email.trim() || !name.trim()}
              >
                <Text style={styles.primaryText}>Continue to shipping</Text>
              </PressableScale>
            </>
          ) : null}

          {step === "shipping" ? (
            <>
              <Text style={styles.section}>Shipping</Text>
              <GlassPanel style={styles.panel}>
                <Field
                  label="Address"
                  value={line1}
                  onChangeText={setLine1}
                  placeholder="Street address"
                />
                <Field
                  label="City"
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                />
                <View style={styles.row2}>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="State"
                      value={state}
                      onChangeText={setState}
                      placeholder="LA"
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field
                      label="ZIP"
                      value={zip}
                      onChangeText={setZip}
                      placeholder="70001"
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </GlassPanel>
              <PressableScale
                style={styles.primary}
                onPress={() => setStep("payment")}
                disabled={!line1.trim() || !city.trim() || !zip.trim()}
              >
                <Text style={styles.primaryText}>Continue to payment</Text>
              </PressableScale>
              <PressableScale onPress={() => setStep("contact")}>
                <Text style={styles.link}>Back</Text>
              </PressableScale>
            </>
          ) : null}

          {step === "payment" ? (
            <>
              <Text style={styles.section}>Payment</Text>
              <View style={styles.payRow}>
                <PressableScale
                  style={[
                    styles.payChip,
                    payMethod === "apple" && styles.payChipOn,
                  ]}
                  onPress={() => setPayMethod("apple")}
                >
                  <Text
                    style={[
                      styles.payChipText,
                      payMethod === "apple" && styles.payChipTextOn,
                    ]}
                  >
                    Apple Pay
                  </Text>
                </PressableScale>
                <PressableScale
                  style={[
                    styles.payChip,
                    payMethod === "card" && styles.payChipOn,
                  ]}
                  onPress={() => setPayMethod("card")}
                >
                  <Text
                    style={[
                      styles.payChipText,
                      payMethod === "card" && styles.payChipTextOn,
                    ]}
                  >
                    Card
                  </Text>
                </PressableScale>
              </View>
              {payMethod === "card" ? (
                <GlassPanel style={styles.panel}>
                  <Field
                    label="Card number"
                    value={card}
                    onChangeText={setCard}
                    placeholder="•••• •••• •••• ••••"
                    keyboardType="number-pad"
                  />
                  <View style={styles.row2}>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="Expiry"
                        value={exp}
                        onChangeText={setExp}
                        placeholder="MM/YY"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="CVC"
                        value={cvc}
                        onChangeText={setCvc}
                        placeholder="123"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </GlassPanel>
              ) : (
                <GlassPanel style={styles.panel}>
                  <Text style={styles.appleNote}>
                    Apple Pay will confirm on device. Demo mode places a local
                    order — Shopify payments wire in next.
                  </Text>
                </GlassPanel>
              )}
              <PressableScale
                style={styles.primary}
                onPress={() => setStep("review")}
              >
                <Text style={styles.primaryText}>Review order</Text>
              </PressableScale>
              <PressableScale onPress={() => setStep("shipping")}>
                <Text style={styles.link}>Back</Text>
              </PressableScale>
            </>
          ) : null}

          {step === "review" ? (
            <>
              <Text style={styles.section}>Review</Text>
              <GlassPanel style={styles.panel}>
                {lines.map((l) => (
                  <View key={l.productId} style={styles.line}>
                    <Text style={styles.lineName}>
                      {l.product.name} × {l.qty}
                    </Text>
                    <Text style={styles.linePrice}>
                      {formatPrice(l.product.price * l.qty)}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
                <Row label="Shipping" value="Free" />
                <Row label="Tax (est.)" value={formatPrice(tax)} />
                <Row label="Total" value={formatPrice(total)} bold />
              </GlassPanel>
              <GlassPanel style={styles.panel}>
                <Text style={styles.metaLabel}>Ship to</Text>
                <Text style={styles.metaBody}>
                  {name}\n{line1}\n{city}, {state} {zip}\n{email}
                </Text>
                <Text style={[styles.metaLabel, { marginTop: 12 }]}>
                  Pay with
                </Text>
                <Text style={styles.metaBody}>
                  {payMethod === "apple" ? "Apple Pay" : "Card ending demo"}
                </Text>
              </GlassPanel>
              <PressableScale
                style={styles.primary}
                onPress={() => void placeOrder()}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <Text style={styles.primaryText}>
                    Place order · {formatPrice(total)}
                  </Text>
                )}
              </PressableScale>
              <PressableScale onPress={() => setStep("payment")}>
                <Text style={styles.link}>Back</Text>
              </PressableScale>
            </>
          ) : null}

          {step === "done" ? (
            <>
              <GlassPanel strong style={styles.donePanel}>
                <Text style={styles.doneMark}>✓</Text>
                <Text style={styles.doneTitle}>Thanks, {name.split(" ")[0]}</Text>
                <Text style={styles.doneBody}>
                  Order {orderId} is confirmed. A receipt will go to {email}.
                </Text>
              </GlassPanel>
              <PressableScale
                style={styles.primary}
                onPress={onDone}
              >
                <Text style={styles.primaryText}>Back to shop</Text>
              </PressableScale>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFade>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.linenMuted}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Text style={[styles.lineName, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.linePrice, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  back: { alignSelf: "flex-start", paddingVertical: 6 },
  backText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 30,
  },
  progress: { flexDirection: "row", gap: 6, marginTop: 4 },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineBright,
  },
  dotOn: { backgroundColor: colors.brass },
  body: { padding: 20, paddingBottom: 40, gap: 14 },
  section: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  panel: { padding: 14, gap: 12 },
  field: { gap: 6 },
  fieldLabel: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
  },
  input: {
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row2: { flexDirection: "row", gap: 10 },
  primary: {
    backgroundColor: colors.brass,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    paddingVertical: 10,
  },
  payRow: { flexDirection: "row", gap: 10 },
  payChip: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    paddingVertical: 14,
    alignItems: "center",
  },
  payChipOn: {
    backgroundColor: colors.brass,
    borderColor: colors.brass,
  },
  payChipText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  payChipTextOn: { color: colors.ink, fontFamily: fonts.bodyBold },
  appleNote: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    padding: 4,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  lineName: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  linePrice: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  bold: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 17,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 8,
  },
  metaLabel: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  metaBody: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  donePanel: {
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  doneMark: {
    color: colors.success,
    fontSize: 36,
    fontFamily: fonts.bodyBold,
  },
  doneTitle: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  doneBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
