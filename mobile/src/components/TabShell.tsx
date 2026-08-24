import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PressableScale } from "./PressableScale";
import { GlassPanel } from "./GlassPanel";

export type TabId = "home" | "coffee" | "ritual" | "story";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "coffee", label: "Coffee" },
  { id: "ritual", label: "Ritual" },
  { id: "story", label: "Story" },
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
        <View style={g.home}>
          <View style={[g.roof, { borderBottomColor: c }]} />
          <View style={[g.body, { borderColor: c }]} />
        </View>
      ) : id === "coffee" ? (
        <View style={[g.bean, { backgroundColor: c }]}>
          <View style={g.crease} />
        </View>
      ) : id === "ritual" ? (
        <View style={[g.cup, { borderColor: c }]}>
          <View style={[g.steam, { backgroundColor: c }]} />
        </View>
      ) : (
        <View style={g.book}>
          <View style={[g.line, { backgroundColor: c }]} />
          <View style={[g.line, { backgroundColor: c, width: 12 }]} />
          <View style={[g.line, { backgroundColor: c, width: 10 }]} />
        </View>
      )}
    </View>
  );
}

export function TabShell({ active, onChange }: Props) {
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
                <Glyph id={t.id} on={on} />
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
  home: { width: 22, height: 22, alignItems: "center" },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: 1,
  },
  body: {
    width: 12,
    height: 9,
    borderWidth: 1.6,
    borderTopWidth: 0,
    marginTop: -1,
  },
  bean: {
    width: 12,
    height: 16,
    borderRadius: 8,
    transform: [{ rotate: "-18deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  crease: {
    width: 1.5,
    height: 10,
    backgroundColor: colors.paper,
    opacity: 0.55,
    borderRadius: 1,
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
  book: { width: 16, height: 16, justifyContent: "center", gap: 3 },
  line: { height: 1.6, width: 16, borderRadius: 1 },
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
});
