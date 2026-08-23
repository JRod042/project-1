import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { brand, colombia, formatPrice, gear, getProduct } from "../lib/catalog";
import { cartPermalink } from "../lib/shopify";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { ProductCard } from "../components/ProductCard";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenProduct: (id: string) => void;
};

export function CartScreen({ onOpenProduct }: Props) {
  const cart = useCart();
  const mug = gear()[0];
  const hasCoffee = cart.lines.some((l) => l.productId !== "cr-mug");
  const hasMug = cart.lines.some((l) => l.productId === "cr-mug");
  const suggest = hasCoffee && !hasMug && mug ? mug : !hasCoffee ? colombia : null;
  const checkout = cartPermalink(
    cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
  );

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
              {brand.promoCopy}. Tap to remember, then apply at checkout.
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
        </ScrollView>

        <View style={styles.dock}>
          <View>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalVal}>{formatPrice(cart.subtotal)}</Text>
          </View>
          <PressableScale onPress={() => void Linking.openURL(checkout)} style={styles.checkout}>
            <Text style={styles.checkoutText}>Check Out</Text>
          </PressableScale>
        </View>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  emptyRoot: { flex: 1, backgroundColor: colors.bg, padding: 20, paddingTop: 16 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { color: colors.linen, fontFamily: fonts.display, fontSize: 36, letterSpacing: -0.6 },
  sub: { marginTop: 6, color: colors.linenDim, fontFamily: fonts.body, fontSize: 15 },
  empty: { marginTop: 8, color: colors.linenDim, fontFamily: fonts.body, fontSize: 16 },
  cta: {
    alignSelf: "flex-start",
    marginTop: 24,
    backgroundColor: colors.brass,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  ctaText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 14 },
  list: { paddingBottom: 120 },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  thumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.bgElevated },
  meta: { flex: 1 },
  name: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
  variant: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  linePrice: { marginTop: 4, color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 14 },
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
  qtyBtnText: { color: colors.linen, fontSize: 18 },
  qtyVal: {
    color: colors.linen,
    fontFamily: fonts.body,
    minWidth: 18,
    textAlign: "center",
  },
  remove: { marginLeft: "auto", paddingVertical: 8 },
  removeText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 13 },
  promo: {
    margin: 20,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    padding: 16,
  },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2,
  },
  promoCode: { marginTop: 6, color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
  promoCopy: { marginTop: 4, color: colors.linenDim, fontFamily: fonts.body, fontSize: 13 },
  suggest: { paddingHorizontal: 20, marginBottom: 20 },
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.tabGlass,
    gap: 16,
  },
  totalLabel: { color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12 },
  totalVal: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
  checkout: {
    flex: 1,
    backgroundColor: colors.brass,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkoutText: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
});
