import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme";
import { brand, products } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
};

export function HomeScreen({ onOpenShop, onOpenProduct }: Props) {
  const featured = products.filter((p) => p.category === "coffee").slice(0, 4);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={["#3A4434", "#1A2118", "#141A12"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroWash} />
        <Text style={styles.eyebrow}>CASA RÚSTICO</Text>
        <Text style={styles.headline}>Coffee from the highlands</Text>
        <Text style={styles.support}>{brand.tagline}</Text>
        <Pressable
          onPress={onOpenShop}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Shop the menu</Text>
        </Pressable>
        <Text style={styles.promo}>{brand.promo}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Featured bags</Text>
          <Pressable onPress={onOpenShop}>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {featured.map((p) => (
            <View key={p.id} style={styles.cardWrap}>
              <ProductCard
                product={p}
                wide
                onPress={() => onOpenProduct(p.id)}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.band}>
        <Text style={styles.bandTitle}>Rooted in the cup</Text>
        <Text style={styles.bandBody}>
          Short menu. Clear packaging. Single-origin coffees and house gear —
          built to extend to Shopify when you are ready.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 28 },
  hero: {
    minHeight: 320,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    justifyContent: "flex-end",
    gap: 10,
  },
  heroWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.heroWash,
  },
  eyebrow: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 3,
  },
  headline: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.6,
    maxWidth: 320,
  },
  support: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.brass,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.88 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  promo: {
    marginTop: 6,
    color: colors.leafBright,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
  },
  section: { paddingTop: 24 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 22,
  },
  link: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
  row: {
    paddingHorizontal: 24,
    gap: 12,
  },
  cardWrap: { width: 200 },
  band: {
    marginTop: 28,
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  bandTitle: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
  },
  bandBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
