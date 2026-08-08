import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

export type TabId = "today" | "book" | "floor" | "house" | "more";

const TABS: { id: TabId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "book", label: "Book" },
  { id: "floor", label: "Floor" },
  { id: "house", label: "House" },
  { id: "more", label: "More" },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function TabShell({ active, onChange }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <Pressable
            key={t.id}
            onPress={() => onChange(t.id)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
            {on ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgElevated,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  label: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  labelOn: {
    color: colors.brass,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.brass,
  },
  dotSpacer: {
    width: 5,
    height: 5,
  },
});
