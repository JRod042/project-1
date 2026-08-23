import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { coffees, gear, origins, type Product } from "../lib/catalog";
import { ProductCard } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Filter = "origins" | "pods" | "gear";

type Props = {
  onOpenProduct: (id: string) => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "origins", label: "Origins" },
  { id: "pods", label: "Capsules" },
  { id: "gear", label: "Accessories" },
];

export function ShopScreen({ onOpenProduct }: Props) {
  const [filter, setFilter] = useState<Filter>("origins");
  const [q, setQ] = useState("");

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

  const rows: Product[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));

  return (
    <ScreenFade>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.title}>Coffee.</Text>
          <Text style={styles.sub}>Single-origin bags, capsules, and house-mark gear.</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search origins"
            placeholderTextColor={colors.linenMuted}
            style={styles.search}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel="Search coffee"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <PressableScale
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label}</Text>
              </PressableScale>
            );
          })}
        </ScrollView>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {rows.length === 0 ? (
            <Text style={styles.empty}>No bags match that search.</Text>
          ) : (
            rows.map((row, idx) => (
              <View key={idx} style={styles.row}>
                {row.map((p) => (
                  <ProductCard key={p.id} product={p} onPress={() => onOpenProduct(p.id)} />
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
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 8, paddingRight: 72 },
  title: { color: colors.linen, fontFamily: fonts.display, fontSize: 36, letterSpacing: -0.6 },
  sub: { color: colors.linenDim, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  search: {
    marginTop: 8,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.bgElevated,
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  chips: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.bgElevated,
  },
  chipOn: { backgroundColor: colors.linen, borderColor: colors.linen },
  chipText: { color: colors.linenDim, fontFamily: fonts.bodyMed, fontSize: 13 },
  chipTextOn: { color: colors.ink },
  grid: { paddingHorizontal: 20, paddingBottom: 40, gap: 18 },
  row: { flexDirection: "row", gap: 12 },
  spacer: { flex: 1 },
  empty: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 40,
  },
});
