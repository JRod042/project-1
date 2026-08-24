import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { coffees, gear, origins, type Product } from "../lib/catalog";
import { useCart } from "../lib/cart";
import { FeaturedRail, MenuRow } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Filter = "origins" | "pods" | "gear";

type Props = {
  onOpenProduct: (id: string) => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "origins", label: "Origins" },
  { id: "pods", label: "Capsules" },
  { id: "gear", label: "Gear" },
];

export function ShopScreen({ onOpenProduct }: Props) {
  const [filter, setFilter] = useState<Filter>("origins");
  const [q, setQ] = useState("");
  const cart = useCart();

  const list = useMemo(() => {
    let next: Product[] =
      filter === "gear"
        ? gear()
        : filter === "pods"
          ? coffees().filter((p) => p.id === "cr-capsules")
          : origins();
    const needle = q.trim().toLowerCase();
    if (needle) {
      next = next.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.origin ?? "").toLowerCase().includes(needle) ||
          (p.notes ?? "").toLowerCase().includes(needle),
      );
    }
    return next;
  }, [filter, q]);

  const add = (p: Product) => {
    cart.add({
      productId: p.id,
      variantId: p.defaultVariantId,
      variantTitle: p.variants?.[0]?.title ?? p.subtitle,
      price: p.price,
      qty: 1,
    });
    cart.flash(`Added ${p.name}`);
  };

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Coffee</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search menu"
            placeholderTextColor={colors.linenMuted}
            style={styles.search}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel="Search coffee"
          />
        </View>

        <View style={styles.segWrap}>
          <View style={styles.seg}>
            {FILTERS.map((f) => {
              const on = f.id === filter;
              return (
                <PressableScale
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={[styles.segBtn, on && styles.segOn]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={f.label}
                >
                  <Text style={[styles.segText, on && styles.segTextOn]}>{f.label}</Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {filter === "origins" && !q ? (
          <>
            <View style={styles.railHead}>
              <Text style={styles.railTitle}>Featured</Text>
            </View>
            <FeaturedRail products={list.slice(0, 8)} onOpen={onOpenProduct} />
            <Text style={styles.menuTitle}>The menu</Text>
          </>
        ) : null}

        {list.length === 0 ? (
          <Text style={styles.empty}>No bags match that search.</Text>
        ) : (
          <View style={styles.menu}>
            {list.map((p) => (
              <MenuRow
                key={p.id}
                product={p}
                onPress={() => onOpenProduct(p.id)}
                onAdd={() => add(p)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 140 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, gap: 12 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.6 },
  search: {
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 18,
  },
  segWrap: { paddingHorizontal: 20, paddingVertical: 8, alignItems: "center" },
  seg: {
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderRadius: radii.pill,
    padding: 3,
  },
  segBtn: {
    minHeight: 36,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radii.pill,
    justifyContent: "center",
  },
  segOn: { backgroundColor: colors.ink },
  segText: { color: colors.linenDim, fontFamily: fonts.bodyMed, fontSize: 14 },
  segTextOn: { color: colors.linen },
  railHead: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  railTitle: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 18 },
  menuTitle: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
  },
  menu: {
    backgroundColor: colors.paper,
    marginTop: 4,
  },
  empty: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 40,
  },
});
