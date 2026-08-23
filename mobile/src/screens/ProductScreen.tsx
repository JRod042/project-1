import { ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "../theme";
import { formatPrice, getProduct } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { GlassPanel } from "../components/GlassPanel";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  productId: string;
  onBack: () => void;
  onGoCart: () => void;
};

export function ProductScreen({ productId, onBack, onGoCart }: Props) {
  const product = getProduct(productId);
  const cart = useCart();

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

  const add = () => {
    cart.add(product.id);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScreenFade>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, { backgroundColor: product.accent }]}>
            <PressableScale onPress={onBack} style={styles.backChip}>
              <Text style={styles.backChipText}>← Back</Text>
            </PressableScale>
            <Text style={styles.heroGlyph}>
              {product.category === "coffee"
                ? "☕"
                : product.category === "gear"
                  ? "⌂"
                  : "◎"}
            </Text>
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

            <GlassPanel style={styles.ship}>
              <Text style={styles.shipTitle}>IN-APP CHECKOUT</Text>
              <Text style={styles.shipBody}>
                Add to bag, then checkout with contact, shipping, and Apple Pay
                or card — all inside Casa Rústico.
              </Text>
            </GlassPanel>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PressableScale onPress={add} style={styles.add}>
            <Text style={styles.addText}>Add to bag</Text>
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
  hero: {
    height: 300,
    padding: 20,
    justifyContent: "space-between",
  },
  backChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  backChipText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
  heroGlyph: {
    position: "absolute",
    alignSelf: "center",
    top: "42%",
    fontSize: 72,
    opacity: 0.95,
  },
  badge: {
    alignSelf: "flex-end",
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  badgeText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  body: {
    padding: 24,
    gap: 8,
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
    fontSize: 34,
    letterSpacing: -0.5,
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
    fontSize: 22,
  },
  notes: {
    marginTop: 12,
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  ship: {
    marginTop: 20,
    padding: 16,
    gap: 6,
  },
  shipTitle: {
    color: colors.leafBright,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  shipBody: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
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
    borderWidth: 1,
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
