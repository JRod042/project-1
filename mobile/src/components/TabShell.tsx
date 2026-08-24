import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PressableScale } from "./PressableScale";
import { GlassPanel } from "./GlassPanel";

export type TabId = "shop" | "ritual" | "story" | "bag";

const TABS: { id: TabId; label: string }[] = [
  { id: "shop", label: "Shop" },
  { id: "ritual", label: "Ritual" },
  { id: "story", label: "Story" },
  { id: "bag", label: "Bag" },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
  bagCount?: number;
};

function Glyph({ id, on }: { id: TabId; on: boolean }) {
  const c = on ? colors.ink : colors.linenMuted;
  return (
    <View style={[g.well, on && g.wellOn]}>
      {id === "shop" ? (
        <View style={g.grid}>
          <View style={[g.cell, { backgroundColor: c }]} />
          <View style={[g.cell, { backgroundColor: c }]} />
          <View style={[g.cell, { backgroundColor: c }]} />
          <View style={[g.cell, { backgroundColor: c }]} />
        </View>
      ) : id === "ritual" ? (
        <View style={[g.cup, { borderColor: c }]}>
          <View style={[g.steam, { backgroundColor: c }]} />
        </View>
      ) : id === "story" ? (
        <View style={g.book}>
          <View style={[g.line, { backgroundColor: c }]} />
          <View style={[g.line, { backgroundColor: c, width: 12 }]} />
          <View style={[g.line, { backgroundColor: c, width: 10 }]} />
        </View>
      ) : (
        <View style={g.bag}>
          <View style={[g.handle, { borderColor: c }]} />
          <View style={[g.body, { borderColor: c }]} />
        </View>
      )}
    </View>
  );
}

export function TabShell({ active, onChange, bagCount = 0 }: Props) {
  return (
    <GlassPanel style={styles.capsule}>
      <View style={styles.row}>
        {TABS.map((t) => {
          const on = t.id === active;
          return (
            <View key={t.id} style={styles.cell}>
              <PressableScale
                onPress={() => onChange(t.id)}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t.label}
              >
                <View>
                  <Glyph id={t.id} on={on} />
                  {t.id === "bag" && bagCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{bagCount > 9 ? "9+" : bagCount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                  {t.label}
                </Text>
              </PressableScale>
            </View>
          );
        })}
      </View>
    </GlassPanel>
  );
}

const g = StyleSheet.create({
  well: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  wellOn: {
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  grid: {
    width: 14,
    height: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  cell: { width: 6, height: 6, borderRadius: 1.5 },
  cup: {
    width: 16,
    height: 12,
    borderWidth: 1.6,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  steam: {
    position: "absolute",
    top: -7,
    width: 1.5,
    height: 6,
    borderRadius: 1,
    opacity: 0.85,
  },
  book: { width: 16, height: 16, justifyContent: "center", gap: 3 },
  line: { height: 1.6, width: 16, borderRadius: 1 },
  bag: { width: 16, height: 18, alignItems: "center" },
  handle: {
    width: 8,
    height: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  body: {
    width: 14,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 2,
    marginTop: -1,
  },
});

const styles = StyleSheet.create({
  capsule: {
    flex: 1,
    minWidth: 0,
    height: 62,
    borderRadius: 31,
    shadowColor: "#120e0b",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  row: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
  },
  cell: { flex: 1, minWidth: 0 },
  tab: {
    width: "100%",
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  label: {
    marginTop: 1,
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0,
    textAlign: "center",
    width: "100%",
  },
  labelOn: { color: colors.ink },
  badge: {
    position: "absolute",
    top: 0,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: colors.linen, fontFamily: fonts.bodyBold, fontSize: 9 },
});
