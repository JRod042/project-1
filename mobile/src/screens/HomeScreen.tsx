import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import {
  apparel,
  brand,
  coffees,
  colombia,
  formatPrice,
  mugs,
  origins,
  type Product,
} from "../lib/catalog";
import { useCart } from "../lib/cart";
import { CatalogGrid } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Family = "origins" | "pods" | "mugs" | "apparel";

const FAMILIES: { id: Family; label: string; image: () => string; items: () => Product[] }[] = [
  { id: "origins", label: "Origins", image: () => origins()[0]?.image ?? "", items: origins },
  {
    id: "pods",
    label: "Capsules",
    image: () => coffees().find((p) => p.id === "cr-capsules")?.image ?? "",
    items: () => coffees().filter((p) => p.id === "cr-capsules"),
  },
  { id: "mugs", label: "Mugs", image: () => mugs()[0]?.image ?? "", items: mugs },
  { id: "apparel", label: "Apparel", image: () => apparel()[0]?.image ?? "", items: apparel },
];

type Props = {
  onOpenProduct: (id: string) => void;
};

export function HomeScreen({ onOpenProduct }: Props) {
  const [family, setFamily] = useState<Family | null>(null);
  const cart = useCart();
  const { width } = useWindowDimensions();
  const gutter = 20;
  const gap = 12;
  const col = (width - gutter * 2 - gap) / 2;

  if (family) {
    const meta = FAMILIES.find((f) => f.id === family)!;
    return (
      <FamilyCollection
        label={meta.label}
        items={meta.items()}
        onBack={() => setFamily(null)}
        onOpenProduct={onOpenProduct}
      />
    );
  }

  const discover = origins().filter((p) => p.id !== colombia.id).slice(0, 6);

  const buyColombia = () => {
    cart.add({
      productId: colombia.id,
      variantId: colombia.defaultVariantId,
      variantTitle: colombia.variants?.[0]?.title ?? colombia.subtitle,
      price: colombia.price,
      qty: 1,
    });
    cart.flash("Added to bag");
  };

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>Shop</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>CR</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.heroWell} haptic={false}>
            <Image source={{ uri: colombia.image }} style={styles.heroImg} resizeMode="contain" />
          </PressableScale>
          {colombia.badge ? <Text style={styles.heroKicker}>{colombia.badge.toUpperCase()}</Text> : null}
          <Text style={styles.heroName}>{colombia.name}</Text>
          {colombia.notes ? <Text style={styles.heroNotes}>{colombia.notes}</Text> : null}
          <Text style={styles.heroPrice}>{formatPrice(colombia.price)}</Text>
          <View style={styles.pills}>
            <PressableScale onPress={buyColombia} style={styles.pillFill} accessibilityLabel="Add Colombia to bag">
              <Text style={styles.pillFillText}>Add to bag</Text>
            </PressableScale>
            <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.pillQuiet} haptic={false}>
              <Text style={styles.pillQuietText}>The bag</Text>
            </PressableScale>
          </View>
        </View>

        <View style={[styles.familyGrid, { paddingHorizontal: gutter, gap }]}>
          {FAMILIES.map((f) => (
            <PressableScale
              key={f.id}
              onPress={() => setFamily(f.id)}
              style={[styles.familyCard, { width: col, height: col }]}
              haptic={false}
            >
              <View style={styles.familyPhoto}>
                <Image source={{ uri: f.image() }} style={styles.familyImg} resizeMode="contain" />
              </View>
              <Text style={styles.familyName}>{f.label}</Text>
            </PressableScale>
          ))}
        </View>

        <PressableScale
          onPress={() => cart.flash(`Copied ${brand.promo}`)}
          style={styles.promo}
        >
          <Text style={styles.promoKicker}>HOUSE OFFER</Text>
          <Text style={styles.promoCode}>{brand.promo}</Text>
          <Text style={styles.promoCopy}>{brand.promoCopy} at checkout · tap to copy</Text>
        </PressableScale>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>More origins</Text>
          <PressableScale onPress={() => setFamily("origins")}>
            <Text style={styles.seeAll}>See all</Text>
          </PressableScale>
        </View>
        <CatalogGrid products={discover} onOpen={onOpenProduct} />
      </ScrollView>
    </ScreenFade>
  );
}

function FamilyCollection({
  label,
  items,
  onBack,
  onOpenProduct,
}: {
  label: string;
  items: Product[];
  onBack: () => void;
  onOpenProduct: (id: string) => void;
}) {
  const cart = useCart();
  const hero = items[0];
  const rest = useMemo(() => items.slice(1), [items]);

  const buyHero = () => {
    if (!hero) return;
    cart.add({
      productId: hero.id,
      variantId: hero.defaultVariantId,
      variantTitle: hero.variants?.[0]?.title ?? hero.subtitle,
      price: hero.price,
      qty: 1,
    });
    cart.flash("Added to bag");
  };

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.collectionHead}>
          <PressableScale onPress={onBack} style={styles.backText} haptic={false}>
            <Text style={styles.backGlyph}>‹ Shop</Text>
          </PressableScale>
          <Text style={styles.title}>{label}</Text>
        </View>

        {hero ? (
          <View style={styles.feature}>
            <PressableScale onPress={() => onOpenProduct(hero.id)} style={styles.featureWell} haptic={false}>
              <Image source={{ uri: hero.image }} style={styles.featureImg} resizeMode="contain" />
            </PressableScale>
            <Text style={styles.featureName}>{hero.name}</Text>
            <Text style={styles.featureFrom}>From {formatPrice(hero.price)}</Text>
            {hero.notes ? <Text style={styles.featureNotes}>{hero.notes}</Text> : null}
            <View style={styles.pills}>
              <PressableScale onPress={buyHero} style={styles.pillFill}>
                <Text style={styles.pillFillText}>Add to bag</Text>
              </PressableScale>
              <PressableScale onPress={() => onOpenProduct(hero.id)} style={styles.pillQuiet} haptic={false}>
                <Text style={styles.pillQuietText}>Learn more</Text>
              </PressableScale>
            </View>
          </View>
        ) : null}

        {rest.length > 0 ? (
          <>
            <Text style={[styles.section, { paddingHorizontal: 20 }]}>Also in {label.toLowerCase()}</Text>
            <CatalogGrid products={rest} onOpen={onOpenProduct} />
          </>
        ) : null}
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  head: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.kraft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  avatarText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  familyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 8,
    paddingBottom: 8,
  },
  familyCard: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  familyPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  familyImg: { width: "78%", height: "78%" },
  familyName: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
    color: colors.ink,
    fontFamily: fonts.displaySoft,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  hero: { paddingBottom: 18 },
  heroWell: {
    marginHorizontal: 20,
    aspectRatio: 1.05,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroImg: { width: "72%", height: "72%" },
  heroKicker: {
    marginTop: 16,
    paddingHorizontal: 20,
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  heroName: {
    marginTop: 6,
    paddingHorizontal: 20,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  heroNotes: {
    marginTop: 6,
    paddingHorizontal: 20,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
  heroPrice: {
    marginTop: 8,
    paddingHorizontal: 20,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 17,
  },
  promo: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.kraft,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  promoKicker: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  promoCode: {
    marginTop: 6,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    letterSpacing: 0.6,
  },
  promoCopy: {
    marginTop: 6,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  sectionRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  section: {
    color: colors.ink,
    fontFamily: fonts.displaySoft,
    fontSize: 22,
    letterSpacing: -0.3,
    paddingTop: 10,
    paddingBottom: 10,
  },
  seeAll: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 16 },
  collectionHead: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  backText: { minHeight: 36, justifyContent: "center", marginLeft: -4 },
  backGlyph: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 17 },
  feature: { paddingBottom: 8 },
  featureWell: {
    marginHorizontal: 20,
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  featureImg: { width: "72%", height: "72%" },
  featureName: {
    marginTop: 18,
    paddingHorizontal: 20,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  featureFrom: {
    marginTop: 6,
    paddingHorizontal: 20,
    color: colors.ink,
    fontFamily: fonts.bodyMed,
    fontSize: 17,
  },
  featureNotes: {
    marginTop: 6,
    paddingHorizontal: 20,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 24,
  },
  pills: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pillFill: {
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  pillFillText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 15 },
  pillQuiet: {
    minHeight: 44,
    paddingHorizontal: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  pillQuietText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 15 },
});
