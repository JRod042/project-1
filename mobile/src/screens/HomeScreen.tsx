import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, origins } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { ProductCard } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenProduct: (id: string) => void;
};

export function HomeScreen({ onOpenProduct }: Props) {
  const bags = origins();
  const cart = useCart();

  const rows = [];
  for (let i = 0; i < bags.length; i += 2) rows.push(bags.slice(i, i + 2));

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>Shop.</Text>
          <Text style={styles.sub}>Single-origin bags. House-mark gear.</Text>
        </View>

        <PressableScale
          onPress={() => cart.flash(`Copied ${brand.promo}`)}
          style={styles.promo}
        >
          <Text style={styles.promoCode}>{brand.promo}</Text>
          <Text style={styles.promoCopy}>{brand.promoCopy} · tap to copy</Text>
        </PressableScale>

        <View style={styles.grid}>
          {rows.map((row, idx) => (
            <View key={idx} style={styles.row}>
              {row.map((p) => (
                <ProductCard key={p.id} product={p} onPress={() => onOpenProduct(p.id)} />
              ))}
              {row.length === 1 ? <View style={styles.spacer} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 48 },
  head: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 6,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  promo: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: colors.kraft,
    borderRadius: radii.md,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  promoCode: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 0.4,
  },
  promoCopy: {
    marginTop: 2,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  grid: { paddingHorizontal: 20, paddingTop: 20, gap: 18 },
  row: { flexDirection: "row", gap: 12 },
  spacer: { flex: 1 },
});
