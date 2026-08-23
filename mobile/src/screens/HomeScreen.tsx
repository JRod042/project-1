import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, formatPrice, gear, origins } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { ProductCard } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
  onOpenStory: () => void;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

export function HomeScreen({ onOpenShop, onOpenProduct, onOpenStory }: Props) {
  const featured = origins().filter((p) => p.id !== "cr-colombia");
  const mug = gear()[0];
  const cart = useCart();

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>{greeting()}</Text>
          <Text style={styles.sub}>Colombia leads. Single-origin. Ship ready from the U.S.</Text>
        </View>

        <View style={styles.hero}>
          <Image source={{ uri: brand.heroImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(18,14,11,0.55)", colors.bg]}
            locations={[0.2, 0.62, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>COLOMBIA</Text>
            <Text style={styles.heroTitle}>The house bag.</Text>
            <Text style={styles.heroBody}>
              {colombia.notes}. {brand.promo} · {brand.promoCopy.toLowerCase()}.
            </Text>
            <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.cta}>
              <Text style={styles.ctaText}>Buy · {formatPrice(colombia.price)}</Text>
            </PressableScale>
          </View>
        </View>

        <PressableScale
          onPress={() => cart.flash(`${brand.promo} · ${brand.promoCopy}`)}
          style={styles.promo}
        >
          <Text style={styles.kicker}>FIRST BAG</Text>
          <Text style={styles.promoCode}>{brand.promo}</Text>
          <Text style={styles.promoCopy}>{brand.promoCopy}. Tap to remember.</Text>
        </PressableScale>

        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionTitle}>The latest.</Text>
            <Text style={styles.sectionSub}>Origins, one bag at a time</Text>
          </View>
          <PressableScale onPress={onOpenShop}>
            <Text style={styles.link}>See all</Text>
          </PressableScale>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          decelerationRate="fast"
        >
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} large onPress={() => onOpenProduct(p.id)} />
          ))}
        </ScrollView>

        <View style={[styles.sectionHead, { marginTop: 28 }]}>
          <View>
            <Text style={styles.sectionTitle}>From the highlands.</Text>
            <Text style={styles.sectionSub}>The look of the house</Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
        >
          {brand.landscapes.map((place) => (
            <PressableScale key={place.id} onPress={onOpenStory} style={styles.place}>
              <Image source={{ uri: place.image }} style={styles.placeImg} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(18,14,11,0.88)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.placeCopy}>
                <Text style={styles.kicker}>{place.kicker.toUpperCase()}</Text>
                <Text style={styles.placeTitle}>{place.title}</Text>
              </View>
            </PressableScale>
          ))}
        </ScrollView>

        {mug ? (
          <PressableScale onPress={() => onOpenProduct(mug.id)} style={styles.mug}>
            <Image source={{ uri: mug.image }} style={styles.mugImg} resizeMode="cover" />
            <View style={styles.mugCopy}>
              <Text style={styles.kicker}>ACCESSORIES</Text>
              <Text style={styles.sectionTitle}>The house mug.</Text>
              <Text style={styles.sectionSub}>
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
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 36,
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 8,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  hero: { minHeight: 380, justifyContent: "flex-end" },
  heroCopy: { paddingHorizontal: 20, paddingBottom: 28, gap: 8 },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  heroTitle: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 36,
    letterSpacing: -0.6,
  },
  heroBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 300,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.brass,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  promo: {
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    padding: 20,
  },
  promoCode: {
    marginTop: 8,
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 28,
  },
  promoCopy: {
    marginTop: 4,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  sectionHead: {
    marginTop: 36,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 24,
  },
  sectionSub: {
    marginTop: 2,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  link: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    paddingBottom: 2,
  },
  rail: { paddingHorizontal: 20, gap: 14 },
  place: {
    width: 240,
    height: 176,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  placeImg: { ...StyleSheet.absoluteFillObject },
  placeCopy: { position: "absolute", left: 14, right: 14, bottom: 14 },
  placeTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 20,
  },
  mug: {
    marginHorizontal: 20,
    marginTop: 36,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.bgElevated,
  },
  mugImg: { height: 220, width: "100%" },
  mugCopy: { padding: 20, gap: 4 },
});
