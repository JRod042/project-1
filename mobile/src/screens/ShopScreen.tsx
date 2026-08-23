import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts, radii } from "../theme";
import { products, type Product } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Filter = "all" | Product["category"];

type Props = {
  onOpenProduct: (id: string) => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "coffee", label: "Coffee" },
  { id: "gear", label: "Gear" },
  { id: "apparel", label: "Apparel" },
];

export function ShopScreen({ onOpenProduct }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const base =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);
    const s = q.trim().toLowerCase();
    if (!s) return base;
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.subtitle.toLowerCase().includes(s) ||
        (p.origin && p.origin.toLowerCase().includes(s)) ||
        (p.notes && p.notes.toLowerCase().includes(s))
    );
  }, [filter, q]);

  const rows: Product[][] = [];
  for (let i = 0; i < list.length; i += 2) {
    rows.push(list.slice(i, i + 2));
  }

  return (
    <ScreenFade>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop</Text>
          <Text style={styles.sub}>{list.length} products</Text>
          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search origin, roast, gear…"
              placeholderTextColor={colors.linenMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <PressableScale
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {f.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {rows.length === 0 ? (
            <Text style={styles.empty}>No matches — try another search.</Text>
          ) : (
            rows.map((row, idx) => (
              <View key={idx} style={styles.row}>
                {row.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onPress={() => onOpenProduct(p.id)}
                  />
                ))}
                {row.length === 1 ? <View style={styles.spacer} /> : null}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 6,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 34,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  search: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchIcon: {
    color: colors.linenMuted,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: 0,
  },
  filters: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
    borderRadius: radii.pill,
    backgroundColor: colors.glass,
  },
  chipOn: {
    backgroundColor: colors.brass,
    borderColor: colors.brass,
  },
  chipText: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
  },
  chipTextOn: {
    color: colors.ink,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: { flex: 1 },
  empty: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 40,
  },
});
