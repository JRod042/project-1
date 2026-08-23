import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts, radii } from "../theme";
import { products, type Product } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";

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

  const list = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter),
    [filter]
  );

  const rows: Product[][] = [];
  for (let i = 0; i < list.length; i += 2) {
    rows.push(list.slice(i, i + 2));
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.sub}>Single-origin menu & house gear</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((f) => {
          const on = f.id === filter;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, idx) => (
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
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  filters: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.lineBright,
    borderRadius: radii.pill,
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
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  spacer: { flex: 1 },
});
