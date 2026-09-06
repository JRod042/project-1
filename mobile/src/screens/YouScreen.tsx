import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts, radii } from "../theme";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";
import { StarsRing } from "../components/StarsRing";
import { useRewards, currentTier, nextTier } from "../lib/rewards";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { shopifyRecover } from "../lib/shopify";

type Props = {
  onOpenRewards: () => void;
  onReplayWelcome: () => void;
};

export function YouScreen({ onOpenRewards, onReplayWelcome }: Props) {
  const auth = useShopifyAuth();
  const { stars, lifetime } = useRewards();
  const tier = currentTier(stars);
  const upcoming = nextTier(stars);
  const [formOpen, setFormOpen] = useState(false);
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
        if (password.trim().length < 8) throw new Error("Password needs at least 8 characters.");
        await auth.createAccount({ email, password, firstName, lastName });
      }
      setPassword("");
      setFormOpen(false);
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
              {customer
                ? "Connected to Shopify at rusticopr.com."
                : "Shop as a guest anytime. Sign in only if you want Shopify orders here."}
            </Text>
          </View>

          {customer ? (
            <View style={styles.card}>
              <Text style={styles.kicker}>SIGNED IN</Text>
              <Text style={styles.h2}>{name || "Casa Rústico"}</Text>
              <Text style={styles.body}>{customer.email}</Text>
              {customer.orders.length === 0 ? (
                <Text style={styles.body}>No orders yet. Checkout stays in the app.</Text>
              ) : (
                customer.orders.slice(0, 4).map((o) => (
                  <View key={o.id} style={styles.orderRow}>
                    <Text style={styles.orderTitle}>
                      #{o.number} · {o.title}
                    </Text>
                    <Text style={styles.orderMeta}>
                      {new Date(o.placedAt).toLocaleDateString()} · ${Number(o.total).toFixed(2)}
                    </Text>
                  </View>
                ))
              )}
              <PressableScale onPress={() => void auth.signOut()} style={styles.ghost}>
                <Text style={styles.ghostText}>Sign out</Text>
              </PressableScale>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.kicker}>GUEST</Text>
                <Text style={styles.h2}>No account needed</Text>
                <Text style={styles.body}>
                  Browse Order, add a bag, and check out in the app. Shopify login is optional.
                </Text>
              </View>

              {formOpen ? (
                <View style={styles.card}>
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
                  {creating ? (
                    <View style={styles.nameRow}>
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
                  ) : null}
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
                  {error ? <Text style={styles.err}>{error}</Text> : null}
                  {note ? <Text style={styles.ok}>{note}</Text> : null}
                  <PressableScale
                    onPress={() => void submit()}
                    style={[styles.cta, busy && styles.ctaBusy]}
                    disabled={busy}
                  >
                    <Text style={styles.ctaText}>
                      {busy ? "Connecting…" : creating ? "Create account" : "Sign in"}
                    </Text>
                  </PressableScale>
                  {!creating ? (
                    <PressableScale onPress={() => void recover()} style={styles.ghost} disabled={busy}>
                      <Text style={styles.ghostText}>Forgot password</Text>
                    </PressableScale>
                  ) : null}
                  <PressableScale
                    onPress={() => {
                      setFormOpen(false);
                      setError("");
                      setNote("");
                    }}
                    style={styles.ghost}
                  >
                    <Text style={styles.ghostText}>Not now</Text>
                  </PressableScale>
                </View>
              ) : (
                <PressableScale
                  onPress={() => setFormOpen(true)}
                  style={styles.signInBtn}
                  accessibilityLabel="Sign in with Shopify. Optional."
                >
                  <Text style={styles.signInBtnText}>Sign in</Text>
                  <Text style={styles.signInHint}>Optional · rusticopr.com</Text>
                </PressableScale>
              )}
            </>
          )}

          <PressableScale onPress={onOpenRewards} style={styles.card} haptic={false}>
            <Text style={styles.kicker}>HACIENDA</Text>
            <Text style={styles.h2}>{tier.name}</Text>
            <StarsRing stars={stars} />
            <Text style={styles.body}>
              {stars} stars · lifetime {lifetime}
              {upcoming ? ` · ${upcoming.min - stars} to ${upcoming.name}` : " · top of the house"}
            </Text>
            <Text style={styles.body}>{tier.perks}</Text>
          </PressableScale>

          <PressableScale onPress={onReplayWelcome} style={styles.replay}>
            <Text style={styles.replayText}>Replay intro</Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6, lineHeight: 40 },
  sub: { marginTop: 8, color: colors.linenDim, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
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
    marginTop: 4,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaBusy: { opacity: 0.7 },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  ghost: { paddingVertical: 8, minHeight: 44, justifyContent: "center" },
  ghostText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 14 },
  signInBtn: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 64,
    justifyContent: "center",
  },
  signInBtnText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  signInHint: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
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
  half: { flex: 1 },
  err: { color: colors.danger, fontFamily: fonts.body, fontSize: 13 },
  ok: { color: colors.success, fontFamily: fonts.body, fontSize: 13 },
  orderRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  orderTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  orderMeta: { color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  replay: { paddingHorizontal: 20, paddingVertical: 28, minHeight: 44, justifyContent: "center" },
  replayText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
});
