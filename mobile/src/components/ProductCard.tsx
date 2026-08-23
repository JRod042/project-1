import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radii } from "../theme";
import { formatPrice, type Product } from "../lib/catalog";
import { PressableScale } from "./PressableScale";

type Props = {
  product: Product;
  onPress: () => void;
  wide?: boolean;
  large?: boolean;
};

/** Content-layer card — solid surface (HIG: no glass on content). */
export function ProductCard({ product, onPress, wide, large }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      style={[styles.card, wide && styles.wide, large && styles.large]}
    >
      <View style={[styles.media, large && styles.mediaLarge]}>
        <Image
          source={{ uri: product.image }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)"]}
          style={StyleSheet.absoluteFill}
        />
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
          {product.notes || product.subtitle}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  wide: {
    minWidth: 200,
    maxWidth: 220,
  },
  large: {
    minWidth: 260,
    maxWidth: 280,
  },
  media: {
    height: 168,
    backgroundColor: colors.bgPanel,
  },
  mediaLarge: {
    height: 210,
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(10,14,10,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  badgeText: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  meta: {
    padding: 14,
    gap: 3,
  },
  name: {
    color: colors.linen,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  price: {
    marginTop: 6,
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});
