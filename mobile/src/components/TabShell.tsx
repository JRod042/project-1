import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { PressableScale } from "./PressableScale";

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
  const c = on ? colors.brass : colors.linenMuted;
  if (id === "home") {
    return (
      <View style={g.home}>
        <View style={[g.roof, { borderBottomColor: c }]} />
        <View style={[g.body, { borderColor: c }]} />
      </View>
    );
  }
  if (id === "coffee") {
    return (
      <View style={[g.bean, { backgroundColor: c }]}>
        <View style={g.crease} />
      </View>
    );
  }
  if (id === "ritual") {
    return (
      <View style={[g.cup, { borderColor: c }]}>
        <View style={[g.steam, { backgroundColor: c }]} />
      </View>
    );
  }
  return (
    <View style={g.book}>
      <View style={[g.line, { backgroundColor: c }]} />
      <View style={[g.line, { backgroundColor: c, width: 12 }]} />
      <View style={[g.line, { backgroundColor: c, width: 10 }]} />
    </View>
  );
}

export function TabShell({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <PressableScale key={t.id} onPress={() => onChange(t.id)} style={styles.tab}>
            <Glyph id={t.id} on={on} />
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const g = StyleSheet.create({
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
    backgroundColor: colors.bg,
    opacity: 0.45,
    borderRadius: 1,
  },
  cup: {
    width: 16,
    height: 12,
    borderWidth: 1.6,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 6,
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
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lineBright,
    backgroundColor: colors.tabGlass,
    paddingBottom: 4,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    minHeight: 48,
    justifyContent: "center",
  },
  label: {
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  labelOn: { color: colors.brass },
});
