import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "../theme";
import { formatPrice, getProduct, products } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { ProductCard } from "../components/ProductCard";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  productId: string;
  onBack: () => void;
  onGoCart: () => void;
  onOpenProduct?: (id: string) => void;
};

export function ProductScreen({
  productId,
  onBack,
  onGoCart,
  onOpenProduct,
}: Props) {
  const product = getProduct(productId);
  const cart = useCart();
  const { width } = useWindowDimensions();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <View style={styles.root}>
        <Text style={styles.missing}>Product not found</Text>
        <PressableScale onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </PressableScale>
      </View>
    );
  }

  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const add = () => {
    cart.add(product.id, qty);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenFade>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ height: width * 0.92 }}>
            <Image
              source={{ uri: product.image }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.35)", "transparent", "rgba(14,19,14,0.9)"]}
              style={StyleSheet.absoluteFill}
            />
            <PressableScale onPress={onBack} style={styles.backChip}>
              <Text style={styles.backChipText}>← Back</Text>
            </PressableScale>
            {product.badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.body}>
            <Text style={styles.category}>
              {product.category.toUpperCase()}
              {product.origin ? ` · ${product.origin}` : ""}
            </Text>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.sub}>{product.subtitle}</Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.notes ? (
              <Text style={styles.notes}>{product.notes}</Text>
            ) : null}

            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <View style={styles.qtyCtrl}>
                <PressableScale
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </PressableScale>
                <Text style={styles.qtyVal}>{qty}</Text>
                <PressableScale
                  onPress={() => setQty((q) => Math.min(12, q + 1))}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </PressableScale>
              </View>
            </View>

            {related.length > 0 && onOpenProduct ? (
              <View style={styles.related}>
                <Text style={styles.relatedTitle}>You may also like</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedRow}
                >
                  {related.map((p) => (
                    <View key={p.id} style={{ width: 180 }}>
                      <ProductCard
                        product={p}
                        wide
                        onPress={() => onOpenProduct(p.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PressableScale onPress={add} style={styles.add}>
            <Text style={styles.addText}>
              Add to bag · {formatPrice(product.price * qty)}
            </Text>
          </PressableScale>
          <PressableScale onPress={onGoCart} style={styles.secondary}>
            <Text style={styles.secondaryText}>
              Bag{cart.count > 0 ? ` · ${cart.count}` : ""}
            </Text>
          </PressableScale>
        </View>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  missing: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    margin: 24,
  },
  backChip: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(10,14,10,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  backChipText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
  badge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(10,14,10,0.72)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  body: {
    padding: 24,
    gap: 8,
    marginTop: -28,
  },
  category: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  name: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 36,
    letterSpacing: -0.6,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  price: {
    marginTop: 8,
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 24,
  },
  notes: {
    marginTop: 12,
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  qtyRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qtyLabel: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
  qtyCtrl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.glassStrong,
  },
  qtyBtnText: {
    color: colors.linen,
    fontSize: 20,
    lineHeight: 22,
  },
  qtyVal: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    minWidth: 20,
    textAlign: "center",
  },
  related: { marginTop: 28, gap: 12 },
  relatedTitle: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 20,
  },
  relatedRow: { gap: 12, paddingRight: 8 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
    padding: 16,
    gap: 10,
    backgroundColor: colors.tabGlass,
  },
  add: {
    backgroundColor: colors.brass,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: radii.pill,
  },
  addText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  secondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
  },
  secondaryText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
  backBtn: {
    marginHorizontal: 24,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.lineBright,
    padding: 14,
    alignItems: "center",
    borderRadius: radii.pill,
  },
  backText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
  },
});
