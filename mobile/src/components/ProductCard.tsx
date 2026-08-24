import { Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { formatPrice, type Product } from "../lib/catalog";
import { PressableScale } from "./PressableScale";

type Props = {
  product: Product;
  onPress: () => void;
  large?: boolean;
};

export function ProductCard({ product, onPress, large }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.card, large && styles.large]}
      haptic={false}
    >
      <View style={[styles.media, large && styles.mediaLarge]}>
        <Image source={{ uri: product.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {product.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  large: { width: 160, flex: 0 },
  media: {
    aspectRatio: 1,
    borderRadius: radii.sm,
    overflow: "hidden",
    backgroundColor: colors.kraft,
  },
  mediaLarge: { aspectRatio: 1 },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(18,14,11,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  name: {
    marginTop: 10,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  price: {
    marginTop: 2,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
});
