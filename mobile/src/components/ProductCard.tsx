import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
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
    overflow: "hidden",
  },
  wide: {
    minWidth: 200,
    maxWidth: 240,
  },
  pressed: { opacity: 0.88 },
  swatch: {
    height: 140,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 10,
  },
  badge: {
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  meta: {
    padding: 12,
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
    marginTop: 4,
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
  },
});
