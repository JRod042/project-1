import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radii } from "../theme";
import { brand, products } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
};

export function HomeScreen({ onOpenShop, onOpenProduct }: Props) {
  const { width } = useWindowDimensions();
  const featured = products.filter((p) => p.category === "coffee").slice(0, 5);
  const gear = products.filter((p) => p.category !== "coffee");

  return (
    <ScreenFade>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { height: Math.min(420, width * 1.05) }]}>
          <Image
            source={{ uri: brand.heroImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(14,19,14,0.15)",
              "rgba(14,19,14,0.55)",
              "rgba(14,19,14,0.96)",
            ]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>CASA RÚSTICO</Text>
            <Text style={styles.headline}>Coffee from{"\n"}the highlands</Text>
            <Text style={styles.support}>{brand.tagline}</Text>
            <PressableScale onPress={onOpenShop} style={styles.cta}>
              <Text style={styles.ctaText}>Shop collection</Text>
            </PressableScale>
          </View>
        </View>

        <View style={styles.promoWrap}>
          <GlassPanel strong style={styles.promo}>
            <Text style={styles.promoKicker}>MEMBER OFFER</Text>
            <Text style={styles.promoBody}>{brand.promo}</Text>
          </GlassPanel>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Featured bags</Text>
              <Text style={styles.sectionSub}>Roasted for the week</Text>
            </View>
            <PressableScale onPress={onOpenShop}>
              <Text style={styles.link}>See all</Text>
            </PressableScale>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            decelerationRate="fast"
            snapToInterval={272}
          >
            {featured.map((p) => (
              <View key={p.id} style={styles.cardWrap}>
                <ProductCard
                  product={p}
                  large
                  onPress={() => onOpenProduct(p.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.story}>
          <Text style={styles.storyTitle}>Rooted in the cup</Text>
          <Text style={styles.storyBody}>
            Short menu. Clear packaging. Single-origin coffees selected for
            clarity — then ship-ready gear for the house.
          </Text>
          <View style={styles.stats}>
            <Stat label="Origins" value="6+" />
            <Stat label="Bag size" value="12 oz" />
            <Stat label="Ship" value="US" />
          </View>
        </View>

        {gear.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>House essentials</Text>
                <Text style={styles.sectionSub}>Mug · mark · layer</Text>
              </View>
            </View>
            <View style={styles.gearGrid}>
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

        <PressableScale onPress={onOpenShop} style={styles.bottomCta}>
          <Text style={styles.bottomCtaText}>Explore full menu</Text>
        </PressableScale>
      </ScrollView>
    </ScreenFade>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 40 },
  hero: {
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  heroCopy: { gap: 10 },
  eyebrow: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 3.4,
  },
  headline: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
  },
  support: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: colors.brass,
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: radii.pill,
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  promoWrap: { paddingHorizontal: 20, marginTop: -12 },
  promo: { padding: 16, gap: 4 },
  promoKicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  promoBody: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  section: { paddingTop: 32 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 24,
  },
  sectionSub: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  link: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    paddingBottom: 4,
  },
  row: {
    paddingHorizontal: 24,
    gap: 14,
  },
  cardWrap: { width: 268 },
  story: {
    marginTop: 36,
    marginHorizontal: 20,
    padding: 22,
    borderRadius: radii.xl,
    backgroundColor: colors.bgPanel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    gap: 10,
  },
  storyTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 22,
  },
  storyBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
  },
  stats: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  statValue: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
  statLabel: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
  },
  gearGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  bottomCta: {
    marginTop: 28,
    marginHorizontal: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomCtaText: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});
