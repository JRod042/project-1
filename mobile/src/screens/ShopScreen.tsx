import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { coffees, gear, origins, type Product } from "../lib/catalog";
import { CatalogGrid } from "../components/ProductCard";
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

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Coffee.</Text>
          <Text style={styles.sub}>Bags, capsules, and house-mark gear.</Text>
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

        <View style={styles.chips} accessibilityRole="tablist">
          {FILTERS.map((f) => {
            const on = f.id === filter;
            return (
              <PressableScale
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={f.label}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        {list.length === 0 ? (
          <Text style={styles.empty}>No bags match that search.</Text>
        ) : (
          <CatalogGrid products={list} onOpen={onOpenProduct} />
        )}
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, gap: 8 },
  title: { color: colors.ink, fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.6 },
  sub: { color: colors.linenDim, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  search: {
    marginTop: 8,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.lineBright,
    backgroundColor: colors.paper,
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.linenDim, fontFamily: fonts.bodyMed, fontSize: 14 },
  chipTextOn: { color: colors.linen },
  empty: {
    color: colors.linenMuted,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 40,
  },
});
