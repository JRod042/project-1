import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, formatPrice, origins } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { useRewards } from "../lib/rewards";
import { CatalogGrid } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";
import { StarsRing } from "../components/StarsRing";

type Props = {
  onOpenProduct: (id: string) => void;
  onOpenOrder: () => void;
  onOpenRewards: () => void;
  onOpenRitual: () => void;
  onOpenStory: () => void;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({
  onOpenProduct,
  onOpenOrder,
  onOpenRewards,
  onOpenRitual,
  onOpenStory,
}: Props) {
  const { stars } = useRewards();
  const cart = useCart();
  const short = origins().slice(0, 4);

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.mistFar} />
        <View pointerEvents="none" style={styles.mistNear} />

        <Text style={styles.kicker}>CASA RÚSTICO</Text>
        <Text style={styles.title}>{greeting()}</Text>
        <Text style={styles.lede}>The cup first. Checkout stays here.</Text>

        <PressableScale
          onPress={onOpenRewards}
          style={styles.card}
          haptic={false}
          accessibilityLabel="Hacienda Rewards"
        >
          <StarsRing stars={stars} />
        </PressableScale>

        <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.hero}>
          <Image source={{ uri: colombia.image }} style={styles.heroImg} resizeMode="cover" />
          <View style={styles.heroWash} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>COLOMBIA LEADS</Text>
            <Text style={styles.heroName}>{colombia.name}</Text>
            <Text style={styles.heroMeta}>
              {colombia.roast} · {colombia.origin} · {formatPrice(colombia.price)}
            </Text>
          </View>
        </PressableScale>

        <PressableScale
          onPress={() => cart.flash(`Copied ${brand.promo}`)}
          style={styles.promo}
        >
          <View>
            <Text style={styles.promoCode}>Code {brand.promo}</Text>
            <Text style={styles.promoCopy}>10% off the short menu</Text>
          </View>
          <View style={styles.promoChip}>
            <Text style={styles.promoChipText}>10%</Text>
          </View>
        </PressableScale>

        <View style={styles.pair}>
          <PressableScale onPress={onOpenRitual} style={styles.pairCard} haptic={false}>
            <Text style={styles.pairKicker}>POUR</Text>
            <Text style={styles.pairTitle}>Ritual</Text>
            <Text style={styles.pairHint}>3:00 house pour-over</Text>
          </PressableScale>
          <PressableScale onPress={onOpenStory} style={styles.pairCard} haptic={false}>
            <Text style={styles.pairKicker}>HOUSE</Text>
            <Text style={styles.pairTitle}>Story</Text>
            <Text style={styles.pairHint}>Cordillera, the cup</Text>
          </PressableScale>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>The short menu</Text>
          <PressableScale onPress={onOpenOrder} haptic={false} accessibilityLabel="All coffees">
            <Text style={styles.seeAll}>All</Text>
          </PressableScale>
        </View>
        <CatalogGrid products={short} onOpen={onOpenProduct} />
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  mistFar: {
    position: "absolute",
    top: 8,
    left: -36,
    width: "70%",
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.paper,
    opacity: 0.4,
  },
  mistNear: {
    position: "absolute",
    top: 44,
    right: -24,
    width: "55%",
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.paper,
    opacity: 0.22,
  },
  kicker: {
    paddingHorizontal: 20,
    paddingTop: 8,
    color: colors.kraftDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  title: {
    paddingHorizontal: 20,
    marginTop: 4,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  lede: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: 16,
  },
  hero: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.paper,
    marginBottom: 12,
  },
  heroImg: { ...StyleSheet.absoluteFill },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(18,14,11,0.38)",
  },
  heroCopy: { position: "absolute", left: 16, right: 16, bottom: 16 },
  heroKicker: {
    color: colors.honey,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
  },
  heroName: {
    marginTop: 4,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  heroMeta: { marginTop: 4, color: "rgba(247,243,236,0.82)", fontFamily: fonts.body, fontSize: 14 },
  promo: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoCode: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 15 },
  promoCopy: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12 },
  promoChip: {
    borderRadius: 999,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promoChipText: { color: colors.kraftDeep, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.4 },
  pair: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  pairCard: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: 16,
  },
  pairKicker: {
    color: colors.kraftDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
  },
  pairTitle: { marginTop: 8, color: colors.ink, fontFamily: fonts.displaySoft, fontSize: 22 },
  pairHint: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12 },
  sectionRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  section: { color: colors.ink, fontFamily: fonts.displaySoft, fontSize: 22 },
  seeAll: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 15 },
});
