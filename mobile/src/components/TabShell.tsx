import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PressableScale } from "./PressableScale";
import { GlassPanel } from "./GlassPanel";

export type TabId = "home" | "order" | "rewards" | "you";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "order", label: "Order" },
  { id: "rewards", label: "Rewards" },
  { id: "you", label: "You" },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

function Glyph({ id, on }: { id: TabId; on: boolean }) {
  const c = on ? colors.ink : colors.linenMuted;
  return (
    <View style={[g.well, on && g.wellOn]}>
      {id === "home" ? (
        <View style={[g.house, { borderColor: c }]}>
          <View style={[g.roof, { borderBottomColor: c }]} />
        </View>
      ) : id === "order" ? (
        <View style={[g.cup, { borderColor: c }]}>
          <View style={[g.steam, { backgroundColor: c }]} />
        </View>
      ) : id === "rewards" ? (
        <View style={[g.star, { backgroundColor: c }]} />
      ) : (
        <View style={[g.person, { borderColor: c }]}>
          <View style={[g.head, { backgroundColor: c }]} />
        </View>
      )}
    </View>
  );
}

export function TabShell({ active, onChange }: Props) {
  return (
    <GlassPanel style={styles.bar} contentStyle={styles.row} interactive>
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
              <Glyph id={t.id} on={on} />
              <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                {t.label}
              </Text>
            </PressableScale>
          </View>
        );
      })}
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
    backgroundColor: "rgba(255,253,248,0.42)",
  },
  house: {
    width: 14,
    height: 10,
    borderWidth: 1.6,
    borderTopWidth: 0,
    marginTop: 4,
  },
  roof: {
    position: "absolute",
    top: -7,
    left: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
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
  star: {
    width: 10,
    height: 10,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  person: {
    width: 14,
    height: 8,
    borderWidth: 1.6,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 6,
    alignItems: "center",
  },
  head: {
    position: "absolute",
    top: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    minWidth: 0,
    height: 64,
    borderRadius: 32,
    shadowColor: "#120e0b",
    shadowOpacity: 0.12,
    shadowRadius: 20,
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
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  label: {
    marginTop: 1,
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 10,
    letterSpacing: 0.2,
    textAlign: "center",
    width: "100%",
  },
  labelOn: { color: colors.ink },
});
