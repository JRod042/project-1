import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, origins } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { FeaturedRail } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";
import type { TabId } from "../components/TabShell";

type Props = {
  onOpenProduct: (id: string) => void;
  onOpenTab: (tab: TabId) => void;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

export function HomeScreen({ onOpenProduct, onOpenTab }: Props) {
  const bags = origins();
  const cart = useCart();
  const place = brand.landscapes[0];

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.hello}>{greeting()}</Text>
        </View>

        <View style={styles.shortcuts}>
          <PressableScale onPress={() => onOpenTab("coffee")} style={styles.shortcut}>
            <Text style={styles.shortcutText}>Coffee</Text>
          </PressableScale>
          <PressableScale onPress={() => onOpenTab("ritual")} style={styles.shortcut}>
            <Text style={styles.shortcutText}>Ritual</Text>
          </PressableScale>
        </View>

        <PressableScale
          onPress={() => cart.flash(`Copied ${brand.promo}`)}
          style={styles.status}
        >
          <View>
            <Text style={styles.statusKicker}>HOUSE OFFER</Text>
            <Text style={styles.statusCode}>{brand.promo}</Text>
            <Text style={styles.statusCopy}>{brand.promoCopy} the house bag · tap to copy</Text>
          </View>
          <Text style={styles.statusMark}>10%</Text>
        </PressableScale>

        <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.promo} haptic={false}>
          <Image source={{ uri: colombia.image }} style={styles.promoImg} resizeMode="contain" />
          <View style={styles.promoBody}>
            <Text style={styles.promoKicker}>HOUSE BAG</Text>
            <Text style={styles.promoTitle}>The house bag.</Text>
            <Text style={styles.promoCopy}>
              Colombia. {colombia.notes}. Twelve ounces, roasted in the United States.
            </Text>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Shop Colombia</Text>
            </View>
          </View>
        </PressableScale>

        {place ? (
          <PressableScale onPress={() => onOpenTab("story")} style={styles.promo} haptic={false}>
            <Image source={{ uri: place.image }} style={styles.storyImg} resizeMode="cover" />
            <View style={styles.promoBody}>
              <Text style={styles.promoKicker}>{place.kicker.toUpperCase()}</Text>
              <Text style={styles.promoTitle}>{place.title}.</Text>
              <Text style={styles.promoCopy}>{place.copy}</Text>
              <View style={styles.cta}>
                <Text style={styles.ctaText}>Read the story</Text>
              </View>
            </View>
          </PressableScale>
        ) : null}

        <View style={styles.railHead}>
          <Text style={styles.railTitle}>Origins</Text>
          <PressableScale onPress={() => onOpenTab("coffee")}>
            <Text style={styles.seeAll}>See all</Text>
          </PressableScale>
        </View>
        <FeaturedRail products={bags.slice(0, 8)} onOpen={onOpenProduct} />
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 140 },
  head: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  hello: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.4,
  },
  shortcuts: {
    flexDirection: "row",
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shortcut: { minHeight: 44, justifyContent: "center" },
  shortcutText: { color: colors.ink, fontFamily: fonts.bodyMed, fontSize: 15 },
  status: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.kraft,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusKicker: {
    color: colors.ink,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  statusCode: {
    marginTop: 4,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    letterSpacing: 1,
  },
  statusCopy: {
    marginTop: 2,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  statusMark: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
  },
  promo: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  promoImg: {
    width: "100%",
    height: 220,
    backgroundColor: colors.bg,
  },
  storyImg: {
    width: "100%",
    height: 200,
    backgroundColor: colors.kraft,
  },
  promoBody: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 },
  promoKicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  promoTitle: {
    marginTop: 6,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  promoCopy: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 16,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  railHead: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  railTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 18 },
  seeAll: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 14 },
});
