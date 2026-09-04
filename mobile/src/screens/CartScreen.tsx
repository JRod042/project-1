import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, formatPrice, gear, getProduct } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { ProductCard } from "../components/ProductCard";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenProduct: (id: string) => void;
  onCheckout: () => void;
};

export function CartScreen({ onOpenProduct, onCheckout }: Props) {
  const cart = useCart();
  const mug = gear()[0];
  const hasCoffee = cart.lines.some((l) => getProduct(l.productId)?.category === "coffee");
  const hasGear = cart.lines.some((l) => getProduct(l.productId)?.category === "gear");
  const suggest = hasCoffee && !hasGear && mug ? mug : !hasCoffee ? colombia : null;

  if (cart.count === 0) {
    return (
      <ScreenFade>
        <View style={styles.emptyRoot}>
          <Text style={styles.title}>Bag.</Text>
          <Text style={styles.empty}>Your bag is empty.</Text>
          <Text style={styles.sub}>Start with Colombia, the house bag.</Text>
          <PressableScale onPress={() => onOpenProduct(colombia.id)} style={styles.cta}>
            <Text style={styles.ctaText}>Shop Colombia</Text>
          </PressableScale>
        </View>
      </ScreenFade>
    );
  }

  return (
    <ScreenFade>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Bag.</Text>
          <Text style={styles.sub}>
            {cart.count} {cart.count === 1 ? "item" : "items"}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {cart.lines.map((line) => {
            const product = getProduct(line.productId);
            return (
              <View key={`${line.productId}-${line.variantId}`} style={styles.row}>
                {product ? (
                  <PressableScale onPress={() => onOpenProduct(product.id)} haptic={false}>
                    <Image source={{ uri: product.image }} style={styles.thumb} />
                  </PressableScale>
                ) : null}
                <View style={styles.meta}>
                  <Text style={styles.name}>{product?.name ?? line.productId}</Text>
                  <Text style={styles.variant}>{line.variantTitle}</Text>
                  <Text style={styles.linePrice}>{formatPrice(line.price * line.qty)}</Text>
                  <View style={styles.qty}>
                    <PressableScale
                      onPress={() => cart.setQty(line.productId, line.variantId, line.qty - 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </PressableScale>
                    <Text style={styles.qtyVal}>{line.qty}</Text>
                    <PressableScale
                      onPress={() => cart.setQty(line.productId, line.variantId, line.qty + 1)}
                      style={styles.qtyBtn}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </PressableScale>
                    <PressableScale
                      onPress={() => cart.remove(line.productId, line.variantId)}
                      style={styles.remove}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </PressableScale>
                  </View>
                </View>
              </View>
            );
          })}

          <PressableScale
            onPress={() => cart.flash(`${brand.promo} · apply at checkout`)}
            style={styles.promo}
          >
            <Text style={styles.kicker}>PROMO</Text>
            <Text style={styles.promoCode}>{brand.promo}</Text>
            <Text style={styles.promoCopy}>
              {brand.promo} for {brand.promoCopy}. Applied when you check out in the app.
            </Text>
          </PressableScale>

          {suggest ? (
            <View style={styles.suggest}>
              <Text style={styles.kicker}>ADD</Text>
              <View style={{ width: 160, marginTop: 12 }}>
                <ProductCard product={suggest} onPress={() => onOpenProduct(suggest.id)} />
              </View>
            </View>
          ) : null}
          <PressableScale
            onPress={onCheckout}
            style={styles.checkout}
            accessibilityLabel="Check out"
          >
            <Text style={styles.ctaText}>Check Out · {formatPrice(cart.subtotal)}</Text>
          </PressableScale>
        </ScrollView>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  emptyRoot: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 4, paddingBottom: 160 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 36, letterSpacing: -0.6 },
  sub: { marginTop: 6, color: colors.linenDim, fontFamily: fonts.body, fontSize: 15 },
  empty: { marginTop: 8, color: colors.linenDim, fontFamily: fonts.body, fontSize: 16 },
  cta: {
    alignSelf: "flex-start",
    marginTop: 24,
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
  checkout: {
    marginHorizontal: 20,
    marginTop: 24,
    minHeight: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingBottom: 220 },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  thumb: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.paper },
  meta: { flex: 1 },
  name: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  variant: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  linePrice: { marginTop: 4, color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  qty: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { color: colors.ink, fontSize: 18 },
  qtyVal: {
    color: colors.ink,
    fontFamily: fonts.body,
    minWidth: 18,
    textAlign: "center",
  },
  remove: { marginLeft: "auto", paddingVertical: 8 },
  removeText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 13 },
  promo: {
    margin: 20,
    backgroundColor: colors.kraft,
    borderRadius: radii.md,
    padding: 16,
  },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2,
  },
  promoCode: { marginTop: 6, color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  promoCopy: { marginTop: 4, color: colors.linenDim, fontFamily: fonts.body, fontSize: 13 },
  suggest: { paddingHorizontal: 20, marginBottom: 20 },
});
