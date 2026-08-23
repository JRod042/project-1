import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radii } from "../theme";
import { brand, products } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
};

export function HomeScreen({ onOpenShop, onOpenProduct }: Props) {
  const featured = products.filter((p) => p.category === "coffee").slice(0, 4);
  const gear = products.filter((p) => p.category !== "coffee").slice(0, 2);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <LinearGradient
          colors={["#3F4A36", "#1C2419", "#121812"]}
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

      {gear.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>House gear</Text>
            <Pressable onPress={onOpenShop}>
              <Text style={styles.link}>Shop</Text>
            </Pressable>
          </View>
          <View style={styles.gearRow}>
            {gear.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onPress={() => onOpenProduct(p.id)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.band}>
        <Text style={styles.bandTitle}>ROOTED IN THE CUP</Text>
        <Text style={styles.bandBody}>
          Short menu. Clear packaging. Single-origin coffees and house gear —
          ready for Shopify checkout when you connect the storefront.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },
  hero: {
    minHeight: 340,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
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
    letterSpacing: 3.2,
  },
  headline: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
    maxWidth: 340,
  },
  support: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.brass,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: radii.pill,
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
  section: { paddingTop: 28 },
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
  gearRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  band: {
    marginTop: 32,
    marginHorizontal: 24,
    padding: 22,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    gap: 8,
  },
  bandTitle: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  bandBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
