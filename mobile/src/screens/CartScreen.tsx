import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { formatPrice, getProduct } from "../lib/catalog";
import { useCart } from "../lib/cart";

type Props = {
  onOpenShop: () => void;
  onOpenProduct: (id: string) => void;
};

export function CartScreen({ onOpenShop, onOpenProduct }: Props) {
  const cart = useCart();

  if (cart.lines.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        <Text style={styles.title}>Bag</Text>
        <Text style={styles.empty}>Your bag is empty</Text>
        <Pressable
          onPress={onOpenShop}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Browse the menu</Text>
        </Pressable>
      </View>
    );
  }

  return (
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
            <View key={line.productId} style={styles.row}>
              <Pressable
                style={styles.rowMain}
                onPress={() => onOpenProduct(p.id)}
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
              </Pressable>
              <View style={styles.qty}>
                <Pressable
                  onPress={() => cart.setQty(p.id, line.qty - 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qtyVal}>{line.qty}</Text>
                <Pressable
                  onPress={() => cart.setQty(p.id, line.qty + 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalVal}>{formatPrice(cart.subtotal)}</Text>
        </View>
        <Pressable style={styles.checkout}>
          <Text style={styles.checkoutText}>Checkout · coming with Shopify</Text>
        </Pressable>
        <Pressable onPress={cart.clear}>
          <Text style={styles.clear}>Clear bag</Text>
        </Pressable>
      </View>
    </View>
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
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.88 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  list: {
    padding: 24,
    gap: 14,
    paddingBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  swatch: { width: 52, height: 52 },
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
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: colors.bgElevated,
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
  },
  checkoutText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  clear: {
    textAlign: "center",
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    paddingVertical: 4,
  },
});
