import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { PressableScale } from "./PressableScale";

export type TabId = "home" | "shop" | "cart" | "account";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "shop", label: "Shop" },
  { id: "cart", label: "Bag" },
  { id: "account", label: "Account" },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
  cartCount?: number;
};

export function TabShell({ active, onChange, cartCount = 0 }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((t) => {
        const on = t.id === active;
        return (
          <PressableScale
            key={t.id}
            onPress={() => onChange(t.id)}
            style={styles.tab}
            haptic
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
              {t.id === "cart" && cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </Text>
                </View>
              ) : null}
            </View>
            {on ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.tabGlass,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  label: {
    color: colors.linenDim,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  labelOn: {
    color: colors.brass,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: radii.pill,
    backgroundColor: colors.brass,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 10,
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
