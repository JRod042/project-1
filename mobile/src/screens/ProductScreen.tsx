import { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, fonts, radii } from "../theme";
import {
  colombia,
  formatPrice,
  gear,
  getProduct,
  type Product,
  type ShopifyVariant,
} from "../lib/catalog";
import { useCart } from "../lib/cart";
import { PressableScale } from "../components/PressableScale";
import { ProductCard } from "../components/ProductCard";
import { ScreenFade } from "../components/ScreenFade";

type Props = {
  productId: string;
  onBack: () => void;
  onOpenProduct: (id: string) => void;
};

function unique(values: (string | undefined)[]) {
  const out: string[] = [];
  for (const v of values) {
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

function axisLabels(product: Product): [string, string] | [string] {
  if (product.id.startsWith("cr-hoodie")) return ["Color", "Size"];
  if (product.id === "cr-capsules") return ["Pack size"];
  if (product.category === "coffee") return ["Grind", "Size"];
  return ["Size"];
}

function VariantPicker({
  product,
  variants,
  variantId,
  onChange,
}: {
  product: Product;
  variants: ShopifyVariant[];
  variantId: number;
  onChange: (id: number) => void;
}) {
  const current = variants.find((v) => v.id === variantId) ?? variants[0];
  const twoAxis = variants.every((v) => (v.options?.length ?? 0) >= 2);
  const labels = axisLabels(product);

  if (!twoAxis) {
    return (
      <View style={styles.block}>
        <Text style={[styles.label, styles.labelPad]}>{labels[0]}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {variants.map((v) => {
            const on = v.id === variantId;
            return (
              <PressableScale key={v.id} onPress={() => onChange(v.id)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{v.title}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  const color = current?.options?.[0] ?? "";
  const size = current?.options?.[1] ?? "";
  const colors0 = unique(variants.map((v) => v.options?.[0]));
  const sizes = unique(variants.filter((v) => v.options?.[0] === color).map((v) => v.options?.[1]));

  const choose = (nextColor: string, nextSize: string) => {
    const match =
      variants.find((v) => v.options?.[0] === nextColor && v.options?.[1] === nextSize) ??
      variants.find((v) => v.options?.[0] === nextColor) ??
      variants[0];
    onChange(match.id);
  };

  return (
    <View>
      <View style={styles.block}>
        <Text style={[styles.label, styles.labelPad]}>{labels[0]}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {colors0.map((c) => {
            const on = c === color;
            return (
              <PressableScale key={c} onPress={() => choose(c, size)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{c}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>
      {sizes.length > 1 || product.id.startsWith("cr-hoodie") ? (
        <View style={styles.block}>
          <Text style={[styles.label, styles.labelPad]}>{labels[1] ?? "Size"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {sizes.map((s) => {
              const on = s === size;
              return (
                <PressableScale key={s} onPress={() => choose(color, s)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export function ProductScreen({ productId, onBack, onOpenProduct }: Props) {
  const product = getProduct(productId);
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const variants = product?.variants ?? [];
  const [variantId, setVariantId] = useState(product?.defaultVariantId ?? 0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const price = variant?.price ?? product?.price ?? 0;

  const pair = useMemo(() => {
    if (!product) return null;
    if (product.category === "gear") return colombia;
    return gear()[0];
  }, [product]);

  if (!product) {
    return (
      <View style={styles.root}>
        <Text style={styles.missing}>Bag not found</Text>
        <PressableScale onPress={onBack}>
          <Text style={styles.backText}>Back to coffee</Text>
        </PressableScale>
      </View>
    );
  }

  const addToBag = () => {
    cart.add({
      productId: product.id,
      variantId: variant?.id ?? product.defaultVariantId,
      variantTitle: variant?.title ?? "12oz",
      price,
      qty,
    });
    setAdded(true);
    cart.flash("Added to bag");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <ScreenFade>
      <View style={styles.root}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          <View style={styles.heroWell}>
            <Image source={{ uri: product.image }} style={styles.hero} resizeMode="contain" />
          </View>
          <View style={styles.body}>
            {product.badge ? <Text style={styles.kicker}>{product.badge.toUpperCase()}</Text> : null}
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.meta}>
              {[product.origin, product.roast].filter(Boolean).join(" · ")}
            </Text>
            <Text style={styles.price}>{formatPrice(price)}</Text>
            {product.notes ? <Text style={styles.notes}>{product.notes}</Text> : null}
            {product.detail ? <Text style={styles.detail}>{product.detail}</Text> : null}
          </View>

          {variants.length > 1 ? (
            <VariantPicker
              product={product}
              variants={variants}
              variantId={variantId}
              onChange={setVariantId}
            />
          ) : null}

          <View style={styles.qtyRow}>
            <Text style={styles.label}>Quantity</Text>
            <PressableScale onPress={() => setQty((n) => Math.max(1, n - 1))} style={styles.qtyBtn} accessibilityLabel="Decrease">
              <Text style={styles.qtyBtnText}>−</Text>
            </PressableScale>
            <Text style={styles.qtyVal}>{qty}</Text>
            <PressableScale onPress={() => setQty((n) => n + 1)} style={styles.qtyBtn} accessibilityLabel="Increase">
              <Text style={styles.qtyBtnText}>+</Text>
            </PressableScale>
          </View>

          {pair && pair.id !== product.id ? (
            <View style={[styles.block, styles.labelPad]}>
              <Text style={styles.kicker}>PAIR WITH</Text>
              <View style={{ width: 160, marginTop: 12 }}>
                <ProductCard product={pair} onPress={() => onOpenProduct(pair.id)} />
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 14) }]}>
          <Text style={styles.dockPrice}>{formatPrice(price * qty)}</Text>
          <PressableScale onPress={addToBag} style={styles.add}>
            <Text style={styles.addText}>{added ? "Added" : "Add to bag"}</Text>
          </PressableScale>
        </View>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  missing: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 24,
    margin: 24,
  },
    backText: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 15 },
  heroWell: {
    marginHorizontal: 20,
    marginTop: 4,
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  hero: { width: "78%", height: "78%" },
  body: { paddingHorizontal: 20, paddingTop: 22, gap: 6 },
  kicker: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 2,
  },
  name: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  meta: { color: colors.linenMuted, fontFamily: fonts.body, fontSize: 14 },
  price: {
    marginTop: 8,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 20,
  },
  notes: {
    marginTop: 10,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  detail: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },
  block: { marginTop: 24 },
  label: {
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  labelPad: { paddingHorizontal: 20 },
  chips: { paddingHorizontal: 20, paddingTop: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineBright,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.linenDim, fontFamily: fonts.bodyMed, fontSize: 13 },
  chipTextOn: { color: colors.linen },
  qtyRow: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.lineBright,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { color: colors.ink, fontSize: 20, lineHeight: 22 },
  qtyVal: {
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    minWidth: 22,
    textAlign: "center",
  },
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.paper,
    gap: 16,
  },
  dockPrice: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  add: {
    flex: 1,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: "center",
  },
  addText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 16 },
});
