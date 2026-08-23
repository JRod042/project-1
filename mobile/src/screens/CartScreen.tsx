import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { formatPrice, getProduct } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
  onCheckout: () => void;
};

export function CartScreen({ onOpenShop, onOpenProduct, onCheckout }: Props) {
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <ScreenFade>
        <View style={styles.emptyRoot}>
          <Text style={styles.title}>Bag</Text>
          <Text style={styles.empty}>Your bag is empty</Text>
          <PressableScale onPress={onOpenShop} style={styles.cta}>
            <Text style={styles.ctaText}>Browse the menu</Text>
          </PressableScale>
        </View>
      </ScreenFade>
    );
  }

  return (
    <ScreenFade>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Bag</Text>
          <Text style={styles.sub}>
            {cart.count} item{cart.count === 1 ? "" : "s"}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {cart.lines.map((line) => {
            const p = getProduct(line.productId);
            if (!p) return null;
            return (
              <GlassPanel key={line.productId} style={styles.row}>
                <PressableScale
                  style={styles.rowMain}
                  onPress={() => onOpenProduct(p.id)}
                  haptic={false}
                >
                  <View
                    style={[styles.swatch, { backgroundColor: p.accent }]}
                  />
                  <View style={styles.meta}>
                    <Text style={styles.name}>{p.name}</Text>
                    <Text style={styles.price}>
                      {formatPrice(p.price)} each
                    </Text>
                  </View>
                </PressableScale>
                <View style={styles.qty}>
                  <PressableScale
                    onPress={() => cart.setQty(p.id, line.qty - 1)}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </PressableScale>
                  <Text style={styles.qtyVal}>{line.qty}</Text>
                  <PressableScale
                    onPress={() => cart.setQty(p.id, line.qty + 1)}
                    style={styles.qtyBtn}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </PressableScale>
                </View>
              </GlassPanel>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalVal}>{formatPrice(cart.subtotal)}</Text>
          </View>
          <PressableScale style={styles.checkout} onPress={onCheckout}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </PressableScale>
          <PressableScale onPress={cart.clear}>
            <Text style={styles.clear}>Clear bag</Text>
          </PressableScale>
        </View>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  emptyRoot: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 24,
    justifyContent: "center",
    gap: 12,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 4,
  },
  empty: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.brass,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radii.pill,
  },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  list: {
    padding: 20,
    gap: 12,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
  },
  meta: { flex: 1, gap: 2 },
  name: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  price: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyBtn: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glass,
  },
  qtyBtnText: {
    color: colors.linen,
    fontSize: 18,
    lineHeight: 20,
  },
  qtyVal: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
    minWidth: 18,
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: 20,
    gap: 12,
    backgroundColor: colors.tabGlass,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  totalVal: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 20,
  },
  checkout: {
    backgroundColor: colors.brass,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: radii.pill,
  },
  checkoutText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  clear: {
    textAlign: "center",
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    paddingVertical: 4,
  },
});
