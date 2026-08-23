import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { PressableScale } from "./PressableScale";

export type TabId = "home" | "shop" | "cart" | "account";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "shop", label: "Shop", icon: "◎" },
  { id: "cart", label: "Bag", icon: "◫" },
  { id: "account", label: "You", icon: "◌" },
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
          >
            <View>
              <Text style={[styles.icon, on && styles.iconOn]}>{t.icon}</Text>
              {t.id === "cart" && cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, on && styles.labelOn]}>{t.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.tabGlass,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 4,
  },
  icon: {
    color: colors.linenMuted,
    fontSize: 18,
    textAlign: "center",
  },
  iconOn: {
    color: colors.brass,
  },
  label: {
    color: colors.linenMuted,
    fontFamily: fonts.bodyMed,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  labelOn: {
    color: colors.brass,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.brass,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
  },
});
