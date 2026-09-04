import { useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts, radii } from "../theme";
import { products } from "../lib/catalog";
import { CatalogGrid } from "./ProductCard";
import { PressableScale } from "./PressableScale";

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenProduct: (id: string) => void;
};

export function SearchSheet({ open, onClose, onOpenProduct }: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        (p.origin ?? "").toLowerCase().includes(needle) ||
        (p.notes ?? "").toLowerCase().includes(needle) ||
        (p.subtitle ?? "").toLowerCase().includes(needle),
    );
  }, [q]);

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <View style={styles.head}>
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Search coffee, gear, origin"
            placeholderTextColor={colors.linenMuted}
            style={styles.input}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            accessibilityLabel="Search the shop"
          />
          <PressableScale onPress={onClose} style={styles.cancel} accessibilityLabel="Close search">
            <Text style={styles.cancelText}>✕</Text>
          </PressableScale>
        </View>
        <Text style={styles.hint}>{q.trim() ? "Matches" : "Origins, capsules, and gear"}</Text>
        {q.trim() ? (
          list.length ? (
            <CatalogGrid
              products={list}
              onOpen={(id) => {
                onClose();
                onOpenProduct(id);
              }}
            />
          ) : (
            <Text style={styles.empty}>No matches for “{q.trim()}”.</Text>
          )
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  cancel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.ink, fontSize: 18, fontFamily: fonts.bodyMed },
  hint: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    color: colors.ink,
    fontFamily: fonts.displaySoft,
    fontSize: 20,
    letterSpacing: -0.3,
  },
  empty: {
    paddingHorizontal: 20,
    paddingTop: 28,
    textAlign: "center",
    color: colors.linenMuted,
    fontFamily: fonts.body,
    fontSize: 15,
  },
});
