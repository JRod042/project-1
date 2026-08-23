import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { formatPrice, type Product } from "../lib/catalog";

type Props = {
  product: Product;
  onPress: () => void;
  wide?: boolean;
};

export function ProductCard({ product, onPress, wide }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        wide && styles.wide,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.swatch, { backgroundColor: product.accent }]}>
        <Text style={styles.glyph}>
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
      <View style={styles.meta}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {product.subtitle}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  wide: {
    minWidth: 196,
    maxWidth: 220,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  swatch: {
    height: 148,
    justifyContent: "center",
    alignItems: "center",
  },
  glyph: {
    fontSize: 42,
    opacity: 0.92,
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.ink,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  badgeText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  meta: {
    padding: 14,
    gap: 3,
  },
  name: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  price: {
    marginTop: 6,
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
});
