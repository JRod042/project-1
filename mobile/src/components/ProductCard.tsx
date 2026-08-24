import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { formatPrice, type Product } from "../lib/catalog";
import { PressableScale } from "./PressableScale";

type CardProps = {
  product: Product;
  onPress: () => void;
};

export function CircleThumb({ uri, size = 72 }: { uri: string; size?: number }) {
  const inner = Math.round(size * 0.72);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Image source={{ uri }} style={{ width: inner, height: inner }} resizeMode="contain" />
    </View>
  );
}

export function ProductCard({ product, onPress }: CardProps) {
  return (
    <PressableScale onPress={onPress} style={styles.card} haptic={false}>
      <View style={styles.media}>
        <Image source={{ uri: product.image }} style={styles.photo} resizeMode="contain" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
    </PressableScale>
  );
}

export function FeaturedRail({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}
    >
      {products.map((p) => (
        <PressableScale key={p.id} onPress={() => onOpen(p.id)} style={styles.railItem} haptic={false}>
          <CircleThumb uri={p.image} size={88} />
          <Text style={styles.railName} numberOfLines={2}>
            {p.name}
          </Text>
        </PressableScale>
      ))}
    </ScrollView>
  );
}

export function MenuRow({
  product,
  onPress,
  onAdd,
}: {
  product: Product;
  onPress: () => void;
  onAdd?: () => void;
}) {
  return (
    <View style={styles.menuRow}>
      <PressableScale onPress={onPress} style={styles.menuHit} haptic={false}>
        <CircleThumb uri={product.image} size={72} />
        <View style={styles.menuMeta}>
          <Text style={styles.menuName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.menuNotes} numberOfLines={2}>
            {product.notes ?? product.subtitle}
          </Text>
        </View>
      </PressableScale>
      {onAdd ? (
        <PressableScale onPress={onAdd} style={styles.plus} accessibilityLabel={`Add ${product.name}`}>
          <Text style={styles.plusText}>+</Text>
        </PressableScale>
      ) : null}
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
  name: {
    marginTop: 8,
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
  rail: { paddingHorizontal: 20, gap: 16, paddingBottom: 4 },
  railItem: { width: 92, alignItems: "center", gap: 8 },
  railName: {
    color: colors.ink,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  menuHit: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  menuMeta: { flex: 1, minWidth: 0 },
  menuName: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  menuNotes: {
    marginTop: 3,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 24,
    fontFamily: fonts.body,
    marginTop: -1,
  },
});
