import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia } from "../lib/catalog";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

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
  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>Story</Text>
          <Text style={styles.sub}>Puerto Rico in the mark. Single-origin in the cup.</Text>
        </View>

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
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  review: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 8,
  },
  replay: { paddingHorizontal: 20, paddingVertical: 28, minHeight: 44, justifyContent: "center" },
  replayText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
});
