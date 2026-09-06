import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { currentTier, nextTier } from "../lib/rewards";

export function StarsRing({ stars }: { stars: number }) {
  const current = currentTier(stars);
  const next = nextTier(stars);
  const start = current.min;
  const end = next?.min ?? current.min + 100;
  const span = Math.max(1, end - start);
  const pct = next ? Math.min(1, (stars - start) / span) : 1;
  const remain = next ? next.min - stars : 0;

  return (
    <View style={styles.row}>
      <View style={styles.well}>
        <Text style={styles.count}>{stars}</Text>
        <Text style={styles.starsLabel}>STARS</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.tier}>{current.name}</Text>
        <Text style={styles.hint}>
          {next ? `${remain} stars to ${next.name}` : "Highest tier. The harvest is yours."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  well: {
    width: 112,
    height: 112,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  count: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  starsLabel: {
    marginTop: 2,
    color: colors.linenMuted,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.6,
  },
  track: {
    marginTop: 10,
    alignSelf: "stretch",
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgPanel,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.kraftDeep,
  },
  copy: { flex: 1, minWidth: 0 },
  tier: { color: colors.ink, fontFamily: fonts.displaySoft, fontSize: 22 },
  hint: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
});
