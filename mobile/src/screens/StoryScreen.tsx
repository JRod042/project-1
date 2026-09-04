import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts, radii } from "../theme";
import { colombia, originStories, type Product } from "../lib/catalog";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { shopifyRecover } from "../lib/shopify";

const REVIEWS = [
  {
    quote:
      "I could smell the coffee as soon as I picked up the package. Absolutely the best coffee I've had the pleasure of getting delivered.",
    name: "Christopher S. Santiago",
  },
  {
    quote:
      "Tiene un aroma intenso, un sabor penetrante y un color dominante — rasgos que me saben a hogar.",
    name: "Nicole S. Rincon",
  },
  {
    quote:
      "Coffee was delicious — multi-layered, complex, and wholesome. Could not recommend enough.",
    name: "Zechariah J. Randalls",
  },
];

type Props = {
  onOpenProduct: (id: string) => void;
  onReplayWelcome: () => void;
};

export function StoryScreen({ onOpenProduct, onReplayWelcome }: Props) {
  const auth = useShopifyAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    if (busy) return;
    setError("");
    setNote("");
    setBusy(true);
    try {
      if (mode === "in") {
        await auth.signIn(email, password);
      } else {
        if (password.length < 8) throw new Error("Password needs at least 8 characters.");
        await auth.createAccount({ email, password, firstName, lastName });
      }
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Shopify.");
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    setError("");
    setNote("");
    if (!email.includes("@")) {
      setError("Add the email on your Shopify account first.");
      return;
    }
    setBusy(true);
    try {
      await shopifyRecover(email.trim());
      setNote("Shopify sent a reset if that email is on file.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset.");
    } finally {
      setBusy(false);
    }
  }

  const customer = auth.session?.customer;
  const name = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
    : "";
  const creating = mode === "up";

  return (
    <ScreenFade>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={52}
      >
        <ScrollView
          style={styles.root}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.head}>
            <Text style={styles.title}>You</Text>
            <Text style={styles.sub}>
              {!auth.ready
                ? "Your Casa Rústico account at rusticopr.com."
                : customer
                  ? "Connected to Shopify at rusticopr.com."
                  : "Sign in with the same Casa Rústico account you use on rusticopr.com."}
            </Text>
          </View>

          <View style={styles.cardPad}>
            {!auth.ready ? (
              <View style={styles.accountSlot}>
                <Text style={styles.kicker}>SHOPIFY</Text>
                <Text style={styles.h2}>Account</Text>
                <Text style={styles.body}>Checking your session…</Text>
              </View>
            ) : customer ? (
              <View style={styles.accountSlot}>
                <Text style={styles.kicker}>SHOPIFY</Text>
                <Text style={styles.h2}>{name || "Signed in"}</Text>
                <Text style={styles.body}>{customer.email}</Text>
                {customer.orders.slice(0, 4).map((o) => (
                  <View key={o.id} style={styles.orderRow}>
                    <Text style={styles.orderTitle}>
                      #{o.number} · {o.title}
                    </Text>
                    <Text style={styles.orderMeta}>
                      {new Date(o.placedAt).toLocaleDateString()} · ${Number(o.total).toFixed(2)}
                    </Text>
                  </View>
                ))}
                <PressableScale onPress={() => void auth.signOut()} style={styles.ghost}>
                  <Text style={styles.ghostText}>Sign out</Text>
                </PressableScale>
              </View>
            ) : (
              <View style={styles.accountSlot}>
                <View style={styles.tabs}>
                  <PressableScale
                    onPress={() => {
                      setMode("in");
                      setError("");
                      setNote("");
                    }}
                    style={[styles.tab, !creating && styles.tabOn]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: !creating }}
                  >
                    <Text style={[styles.tabText, !creating && styles.tabTextOn]}>Sign in</Text>
                  </PressableScale>
                  <PressableScale
                    onPress={() => {
                      setMode("up");
                      setError("");
                      setNote("");
                    }}
                    style={[styles.tab, creating && styles.tabOn]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: creating }}
                  >
                    <Text style={[styles.tabText, creating && styles.tabTextOn]}>Create</Text>
                  </PressableScale>
                </View>
                <View
                  style={[styles.nameRow, !creating && styles.reservedHidden]}
                  pointerEvents={creating ? "auto" : "none"}
                  accessibilityElementsHidden={!creating}
                  importantForAccessibility={creating ? "yes" : "no-hide-descendants"}
                >
                  <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="First name"
                    placeholderTextColor={colors.linenMuted}
                    autoComplete="given-name"
                    textContentType="givenName"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="Last name"
                    placeholderTextColor={colors.linenMuted}
                    autoComplete="family-name"
                    textContentType="familyName"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.linenMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.linenMuted}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <View style={styles.msgSlot}>
                  {error ? <Text style={styles.err}>{error}</Text> : null}
                  {note ? <Text style={styles.ok}>{note}</Text> : null}
                </View>
                <PressableScale
                  onPress={() => void submit()}
                  style={[styles.cta, busy && styles.ctaBusy]}
                  disabled={busy}
                >
                  <Text style={styles.ctaText}>
                    {busy ? "Connecting…" : creating ? "Create account" : "Sign in"}
                  </Text>
                </PressableScale>
                <View style={creating ? styles.reservedHidden : undefined} pointerEvents={creating ? "none" : "auto"}>
                  <PressableScale onPress={() => void recover()} style={styles.ghost} disabled={busy}>
                    <Text style={styles.ghostText}>Forgot password</Text>
                  </PressableScale>
                </View>
              </View>
            )}
          </View>

          <View style={styles.cardPad}>
            <Text style={styles.h2}>Origins</Text>
            <Text style={styles.body}>
              One row per bag. Tap to open that coffee — origin story lives on the product page.
            </Text>
            <View style={styles.originList}>
              {originStories().map((coffee) => (
                <OriginRow key={coffee.id} coffee={coffee} onPress={() => onOpenProduct(coffee.id)} />
              ))}
            </View>
          </View>

          <View style={styles.cardPad}>
            <Text style={styles.h2}>The house mark</Text>
            <Text style={styles.body}>
              A short honest menu and a house mark you can wear and drink from. Growing origin is
              listed on each coffee.
            </Text>
            <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.cta}>
              <Text style={styles.ctaText}>Start with Colombia</Text>
            </PressableScale>
          </View>

          <View style={styles.cardPad}>
            <Text style={styles.h2}>From the house</Text>
            {REVIEWS.map((r) => (
              <View key={r.name} style={styles.review}>
                <Text style={styles.body}>“{r.quote}”</Text>
                <Text style={styles.kicker}>{r.name}</Text>
              </View>
            ))}
          </View>

          <PressableScale onPress={onReplayWelcome} style={styles.replay}>
            <Text style={styles.replayText}>Replay intro</Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFade>
  );
}

function OriginRow({ coffee, onPress }: { coffee: Product; onPress: () => void }) {
  const place = coffee.origin ?? coffee.subtitle;
  return (
    <PressableScale
      onPress={onPress}
      style={styles.originRow}
      haptic={false}
      accessibilityRole="button"
      accessibilityLabel={`${coffee.name}. ${place}. Open product.`}
    >
      <Image source={{ uri: coffee.image }} style={styles.originThumb} resizeMode="cover" />
      <View style={styles.originMeta}>
        <Text style={styles.originName}>{coffee.name}</Text>
        <Text style={styles.originPlace} numberOfLines={1}>
          {place}
          {coffee.notes ? ` · ${coffee.notes}` : ""}
        </Text>
      </View>
      <Text style={styles.originChevron}>›</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6, lineHeight: 40 },
  sub: { marginTop: 8, color: colors.linenDim, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  originList: { marginTop: 6 },
  originRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  originThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bg,
  },
  originMeta: { flex: 1, minWidth: 0 },
  originName: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  originPlace: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  originChevron: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 22, lineHeight: 24 },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  h2: {
    color: colors.ink,
    fontFamily: fonts.displaySoft,
    fontSize: 24,
    letterSpacing: -0.3,
  },
  body: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  cardPad: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  accountSlot: { gap: 10, minHeight: 220 },
  cta: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaBusy: { opacity: 0.7 },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  ghost: { paddingVertical: 8, minHeight: 44, justifyContent: "center" },
  ghostText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 14 },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    borderRadius: radii.pill,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: radii.pill },
  tabOn: { backgroundColor: colors.ink },
  tabText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
  tabTextOn: { color: colors.linen },
  input: {
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  nameRow: { flexDirection: "row", gap: 8 },
  reservedHidden: { opacity: 0 },
  half: { flex: 1 },
  msgSlot: { minHeight: 20, justifyContent: "center" },
  err: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  ok: { color: colors.success, fontFamily: fonts.body, fontSize: 13 },
  orderRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  orderTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  orderMeta: { color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  review: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 8,
  },
  replay: { paddingHorizontal: 20, paddingVertical: 28, minHeight: 44, justifyContent: "center" },
  replayText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
});
