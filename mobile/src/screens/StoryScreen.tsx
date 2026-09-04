import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { colors, fonts, radii } from "../theme";
import { brand, colombia } from "../lib/catalog";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";
import { useShopifyAuth } from "../lib/shopifyAuth";
import { SHOPIFY_ACCOUNT_URL, shopifyRecover } from "../lib/shopify";

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

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>You</Text>
          <Text style={styles.sub}>
            {customer
              ? "Connected to Shopify at rusticopr.com."
              : "Sign in with your Casa Rústico Shopify account."}
          </Text>
        </View>

        {customer ? (
          <View style={styles.signed}>
            <Text style={styles.kicker}>SHOPIFY</Text>
            <Text style={styles.h2}>{name || "Signed in"}</Text>
            <Text style={styles.body}>{customer.email}</Text>
            {customer.orders.slice(0, 4).map((o) => (
              <View key={o.id} style={styles.orderRow}>
                <Text style={styles.orderTitle}>#{o.number} · {o.title}</Text>
                <Text style={styles.orderMeta}>
                  {new Date(o.placedAt).toLocaleDateString()} · ${Number(o.total).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.row}>
              <PressableScale
                onPress={() => void WebBrowser.openBrowserAsync(SHOPIFY_ACCOUNT_URL)}
                style={styles.ctaLight}
              >
                <Text style={styles.ctaLightText}>Open Shopify account</Text>
              </PressableScale>
              <PressableScale onPress={() => void auth.signOut()} style={styles.ghost}>
                <Text style={styles.ghostText}>Sign out</Text>
              </PressableScale>
            </View>
          </View>
        ) : (
          <View style={styles.cardPad}>
            <View style={styles.tabs}>
              <PressableScale
                onPress={() => { setMode("in"); setError(""); }}
                style={[styles.tab, mode === "in" && styles.tabOn]}
              >
                <Text style={[styles.tabText, mode === "in" && styles.tabTextOn]}>Sign in</Text>
              </PressableScale>
              <PressableScale
                onPress={() => { setMode("up"); setError(""); }}
                style={[styles.tab, mode === "up" && styles.tabOn]}
              >
                <Text style={[styles.tabText, mode === "up" && styles.tabTextOn]}>Create</Text>
              </PressableScale>
            </View>
            {mode === "up" ? (
              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="First name"
                  placeholderTextColor={colors.linenMuted}
                  autoComplete="given-name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
                <TextInput
                  style={[styles.input, styles.half]}
                  placeholder="Last name"
                  placeholderTextColor={colors.linenMuted}
                  autoComplete="family-name"
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
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.linenMuted}
              secureTextEntry
              autoComplete={mode === "in" ? "password" : "new-password"}
              value={password}
              onChangeText={setPassword}
            />
            {error ? <Text style={styles.err}>{error}</Text> : null}
            {note ? <Text style={styles.ok}>{note}</Text> : null}
            <PressableScale onPress={() => void submit()} style={styles.cta}>
              <Text style={styles.ctaText}>
                {busy ? "Connecting…" : mode === "in" ? "Sign in with Shopify" : "Create Shopify account"}
              </Text>
            </PressableScale>
            <PressableScale
              onPress={() => void WebBrowser.openBrowserAsync(SHOPIFY_ACCOUNT_URL)}
              style={styles.outline}
            >
              <Text style={styles.outlineText}>Continue on Shopify</Text>
            </PressableScale>
            {mode === "in" ? (
              <PressableScale onPress={() => void recover()} style={styles.ghost}>
                <Text style={styles.ghostText}>Forgot password</Text>
              </PressableScale>
            ) : null}
          </View>
        )}

        {brand.landscapes.map((place) => (
          <View key={place.id} style={styles.card}>
            <Image source={{ uri: place.image }} style={styles.hero} resizeMode="cover" />
            <View style={styles.caption}>
              <Text style={styles.kicker}>{place.kicker.toUpperCase()}</Text>
              <Text style={styles.h2}>{place.title}.</Text>
              <Text style={styles.body}>{place.copy}</Text>
            </View>
          </View>
        ))}

        <View style={styles.cardPad}>
          <Text style={styles.h2}>The house mark.</Text>
          <Text style={styles.body}>
            A short honest menu and a house mark you can wear and drink from. Growing origin is
            listed on each coffee.
          </Text>
          <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.cta}>
            <Text style={styles.ctaText}>Start with Colombia</Text>
          </PressableScale>
        </View>

        <View style={styles.cardPad}>
          <Text style={styles.h2}>From the house.</Text>
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
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.6 },
  sub: { marginTop: 6, color: colors.linenDim, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  hero: { height: 200, width: "100%", backgroundColor: colors.kraft },
  caption: { paddingHorizontal: 20, paddingVertical: 18, gap: 4 },
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
    marginBottom: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  signed: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 6,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  ctaLight: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.linen,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaLightText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  outline: {
    alignSelf: "stretch",
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingVertical: 13,
    borderRadius: radii.pill,
    alignItems: "center",
  },
  outlineText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  ghost: { paddingVertical: 8, minHeight: 44, justifyContent: "center" },
  ghostText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 14 },
  tabs: { flexDirection: "row", backgroundColor: colors.bg, borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10 },
  tabOn: { backgroundColor: colors.ink },
  tabText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
  tabTextOn: { color: colors.linen },
  input: {
    height: 46,
    borderRadius: 12,
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
  orderRow: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(245,234,216,0.15)" },
  orderTitle: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  orderMeta: { color: "rgba(245,234,216,0.65)", fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  review: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 8,
  },
  replay: { paddingHorizontal: 20, paddingVertical: 28, minHeight: 44, justifyContent: "center" },
  replayText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
});
