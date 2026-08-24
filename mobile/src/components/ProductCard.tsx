import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { formatPrice, type Product } from "../lib/catalog";
import { PressableScale } from "./PressableScale";

type Props = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: Props) {
  return (
    <PressableScale onPress={onPress} style={styles.card} haptic={false}>
      <View style={styles.media}>
        <Image source={{ uri: product.image }} style={styles.photo} resizeMode="contain" />
      </View>
      {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
    </PressableScale>
  );
}

const GUTTER = 20;
const GAP = 12;

export function CatalogGrid({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (id: string) => void;
}) {
  const { width } = useWindowDimensions();
  const col = (width - GUTTER * 2 - GAP) / 2;
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row.map((p) => p.id).join("-")} style={styles.row}>
          {row.map((p) => (
            <View key={p.id} style={{ width: col }}>
              <ProductCard product={p} onPress={() => onOpen(p.id)} />
            </View>
          ))}
          {row.length === 1 ? <View style={{ width: col }} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%" },
  media: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photo: { width: "78%", height: "78%" },
  badge: {
    marginTop: 10,
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  name: {
    marginTop: 4,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  price: {
    marginTop: 2,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  grid: { paddingHorizontal: GUTTER, paddingBottom: 40, gap: 20 },
  row: { flexDirection: "row", gap: GAP },
});
