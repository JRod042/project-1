import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, formatPrice, gear } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenProduct: (id: string) => void;
};

const TOTAL = 180;

const METHODS = [
  {
    name: "Pour-over",
    ratio: "1 : 16",
    grind: "Medium",
    time: "3:00",
    copy: "15 g coffee to 240 g water. Bloom 45 g for 30 seconds, then spiral to the line.",
  },
  {
    name: "Espresso",
    ratio: "1 : 2",
    grind: "Fine",
    time: "25–30 s",
    copy: "18 g in, 36 g out. Colombia espresso grind is already on the bag if you want it done.",
  },
  {
    name: "Mug",
    ratio: "House cup",
    grind: "As roasted",
    time: "Sit with it",
    copy: "The white glossy mug is the everyday house mark. Pair it with the week’s bag.",
  },
];

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function BrewTimer() {
  const [left, setLeft] = useState(TOTAL);
  const [on, setOn] = useState(false);
  const cart = useCart();

  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      setLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [on]);

  useEffect(() => {
    if (left !== 0 || !on) return;
    setOn(false);
    cart.flash("Pour is done.");
  }, [left, on, cart]);

  return (
    <View style={styles.timer}>
      <Text style={styles.kicker}>POUR-OVER</Text>
      <Text style={styles.clock}>{formatClock(left)}</Text>
      <Text style={styles.timerSub}>Bloom at 0:30. Finish at 3:00.</Text>
      <View style={styles.timerRow}>
        <PressableScale
          onPress={() => {
            if (left === 0) {
              setLeft(TOTAL);
              setOn(true);
              return;
            }
            setOn((v) => !v);
          }}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>
            {on ? "Pause" : left === 0 ? "Start" : left < TOTAL ? "Resume" : "Start"}
          </Text>
        </PressableScale>
        <PressableScale
          onPress={() => {
            setOn(false);
            setLeft(TOTAL);
          }}
          style={styles.reset}
        >
          <Text style={styles.resetText}>Reset</Text>
        </PressableScale>
      </View>
    </View>
  );
}

export function RitualScreen({ onOpenProduct }: Props) {
  const mug = gear()[0];

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>Ritual.</Text>
          <Text style={styles.sub}>How we drink the house bag. Short methods, honest notes.</Text>
        </View>
        <Image source={{ uri: brand.ritualImage }} style={styles.hero} resizeMode="cover" />
        <View style={styles.block}>
          <Text style={styles.kicker}>COLOMBIA</Text>
          <Text style={styles.h2}>Tasting notes.</Text>
          <Text style={styles.body}>{colombia.notes}</Text>
          <Text style={styles.muted}>{colombia.detail}</Text>
          <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.cta}>
            <Text style={styles.ctaText}>Shop the bag · {formatPrice(colombia.price)}</Text>
          </PressableScale>
        </View>
        <BrewTimer />
        {METHODS.map((m) => (
          <View key={m.name} style={styles.method}>
            <View style={styles.methodHead}>
              <Text style={styles.h3}>{m.name}</Text>
              <Text style={styles.ratio}>{m.ratio}</Text>
            </View>
            <Text style={styles.muted}>
              {m.grind} · {m.time}
            </Text>
            <Text style={styles.body}>{m.copy}</Text>
          </View>
        ))}
        {mug ? (
          <PressableScale onPress={() => onOpenProduct(mug.id)} style={styles.mugRow}>
            <Image source={{ uri: mug.image }} style={styles.mugImg} />
            <View>
              <Text style={styles.name}>{mug.name}</Text>
              <Text style={styles.muted}>
                {mug.subtitle} · {formatPrice(mug.price)}
              </Text>
            </View>
          </PressableScale>
        ) : null}
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, paddingRight: 72 },
  title: { color: colors.linen, fontFamily: fonts.display, fontSize: 36, letterSpacing: -0.6 },
  sub: { marginTop: 8, color: colors.linenDim, fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  hero: { height: 220, width: "100%", backgroundColor: colors.bgElevated },
  block: { paddingHorizontal: 20, paddingTop: 24 },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2,
  },
  h2: {
    marginTop: 8,
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 24,
  },
  h3: { color: colors.linen, fontFamily: fonts.displaySoft, fontSize: 20 },
  body: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  muted: {
    marginTop: 6,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: colors.brass,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  timer: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    padding: 20,
  },
  clock: {
    marginTop: 10,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 56,
    fontVariant: ["tabular-nums"],
  },
  timerSub: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  timerRow: { marginTop: 16, flexDirection: "row", gap: 8 },
  primary: {
    flex: 1,
    backgroundColor: colors.brass,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  reset: {
    borderWidth: 1,
    borderColor: colors.lineBright,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
  },
  resetText: { color: colors.linen, fontFamily: fonts.bodyMed, fontSize: 14 },
  method: {
    marginHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  methodHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  ratio: { color: colors.brass, fontFamily: fonts.body, fontSize: 14 },
  mugRow: {
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.sm,
    padding: 12,
  },
  mugImg: { width: 80, height: 80, borderRadius: 8 },
  name: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
});
