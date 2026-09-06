import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { originStories, type Product } from "../lib/catalog";
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
};

export function StoryScreen({ onOpenProduct }: Props) {
  return (
    <ScreenFade>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Text style={styles.title}>Story</Text>
          <Text style={styles.sub}>
            A short honest menu and a house mark from the cordillera to the cup.
          </Text>
        </View>

        <View style={styles.cardPad}>
          <Text style={styles.h2}>Origins</Text>
          <Text style={styles.body}>Tap a bag. The origin story lives on the product page.</Text>
          <View style={styles.originList}>
            {originStories().map((coffee) => (
              <OriginRow key={coffee.id} coffee={coffee} onPress={() => onOpenProduct(coffee.id)} />
            ))}
          </View>
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
      </ScrollView>
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
  review: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 8,
  },
});
