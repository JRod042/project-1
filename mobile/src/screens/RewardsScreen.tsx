import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radii } from "../theme";
import { REDEEMS, STARS_PER_DOLLAR, TIERS } from "../lib/catalog";
import { useRewards, currentTier } from "../lib/rewards";
import { StarsRing } from "../components/StarsRing";
import { ScreenFade } from "../components/ScreenFade";

export function RewardsScreen() {
  const { stars, lifetime } = useRewards();
  const current = currentTier(stars);

  return (
    <ScreenFade>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>HACIENDA REWARDS</Text>
        <Text style={styles.title}>Stars on the cup</Text>

        <View style={styles.card}>
          <StarsRing stars={stars} />
          <Text style={styles.meta}>
            {STARS_PER_DOLLAR} stars per dollar at checkout. Lifetime {lifetime}.
          </Text>
        </View>

        <Text style={styles.section}>Tiers</Text>
        {TIERS.map((t) => {
          const on = current.id === t.id;
          return (
            <View key={t.id} style={[styles.tier, on && styles.tierOn]}>
              <View style={styles.tierRow}>
                <Text style={[styles.tierName, on && styles.onInk]}>{t.name}</Text>
                <Text style={[styles.tierMin, on && styles.onMute]}>{t.min} stars</Text>
              </View>
              <Text style={[styles.tierPerk, on && styles.onMute]}>{t.perks}</Text>
            </View>
          );
        })}

        <Text style={styles.section}>Redeem in checkout</Text>
        {REDEEMS.map((r) => (
          <View key={r.stars} style={styles.redeem}>
            <View>
              <Text style={styles.redeemLabel}>{r.label}</Text>
              <Text style={styles.redeemStars}>{r.stars} stars</Text>
            </View>
            <Text style={styles.redeemValue}>${r.value}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, paddingBottom: 180 },
  kicker: {
    marginTop: 8,
    color: colors.kraftDeep,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  title: {
    marginTop: 6,
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  card: {
    marginTop: 18,
    backgroundColor: colors.paper,
    borderRadius: radii.xl,
    padding: 16,
  },
  meta: { marginTop: 14, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  section: {
    marginTop: 24,
    marginBottom: 10,
    color: colors.ink,
    fontFamily: fonts.displaySoft,
    fontSize: 22,
  },
  tier: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  tierOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tierRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  tierName: { color: colors.ink, fontFamily: fonts.displaySoft, fontSize: 18 },
  tierMin: { color: colors.linenMuted, fontFamily: fonts.body, fontSize: 12 },
  tierPerk: { marginTop: 4, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 14 },
  onInk: { color: colors.linen },
  onMute: { color: "rgba(247,243,236,0.72)" },
  redeem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  redeemLabel: { color: colors.ink, fontFamily: fonts.bodyBold, fontSize: 16 },
  redeemStars: { marginTop: 2, color: colors.linenMuted, fontFamily: fonts.body, fontSize: 13 },
  redeemValue: { color: colors.kraftDeep, fontFamily: fonts.bodyBold, fontSize: 16 },
});
