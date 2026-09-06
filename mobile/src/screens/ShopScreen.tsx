import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { coffees, gear, type Product } from "../lib/catalog";
import { CatalogGrid } from "../components/ProductCard";
import { PressableScale } from "../components/PressableScale";
import { ScreenFade } from "../components/ScreenFade";

type Filter = "coffee" | "gear";

type Props = {
  onOpenProduct: (id: string) => void;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "coffee", label: "Coffee" },
  { id: "gear", label: "House mark" },
];

export function ShopScreen({ onOpenProduct }: Props) {
  const [filter, setFilter] = useState<Filter>("coffee");

  const list = useMemo<Product[]>(() => {
    return filter === "gear" ? gear() : coffees();
  }, [filter]);

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Order</Text>
        <Text style={styles.lede}>Fewer origins. Clearer choices on grind and size.</Text>

        <View style={styles.switch}>
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <PressableScale
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={[styles.chip, on && styles.chipOn]}
                haptic={false}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label}</Text>
              </PressableScale>
            );
          })}
        </View>

        <CatalogGrid products={list} onOpen={onOpenProduct} />
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 180 },
  title: {
    paddingHorizontal: 20,
    paddingTop: 8,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  lede: {
    paddingHorizontal: 20,
    marginTop: 6,
    marginBottom: 14,
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  switch: {
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: "row",
    backgroundColor: colors.paper,
    borderRadius: radii.pill,
    padding: 4,
  },
  chip: {
    flex: 1,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.ink },
  chipText: { color: colors.linenMuted, fontFamily: fonts.bodyMed, fontSize: 14 },
  chipTextOn: { color: colors.linen },
});
