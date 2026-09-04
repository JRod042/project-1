import { useMemo, useState } from "react";
import { Modal, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme";
import { products } from "../lib/catalog";
import { CatalogGrid } from "./ProductCard";
import { PressableScale } from "./PressableScale";
import { GlassPanel } from "./GlassPanel";

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
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        <GlassPanel style={styles.headGlass} contentStyle={styles.head} interactive>
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
        </GlassPanel>
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
  headGlass: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 56,
    borderRadius: 28,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    color: colors.ink,
    fontFamily: fonts.body,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  cancel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { color: colors.ink, fontSize: 18, fontFamily: fonts.bodyMed },
  hint: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
