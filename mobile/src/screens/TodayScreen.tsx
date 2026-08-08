import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../theme";
import {
  coversBooked,
  houseName,
  mockReservations,
  mockStaff,
  mockTickets,
} from "../lib/mockHouse";

type Props = {
  onNewReservation: () => void;
};

export function TodayScreen({ onNewReservation }: Props) {
  const covers = coversBooked();
  const next = mockReservations.find((r) => r.status === "booked");
  const openTickets = mockTickets.filter((t) => t.status !== "closed").length;

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <LinearGradient
          colors={["#3A4434", "#1A2118"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroWash} />
        <Text style={styles.brand}>{houseName}</Text>
        <Text style={styles.headline}>{covers} covers on the books</Text>
        <Text style={styles.support}>
          {next
            ? `Next up · ${next.time} · ${next.name} · party of ${next.party}`
            : "No arrivals waiting — enjoy the calm."}
        </Text>
        <View style={styles.ctaRow}>
          <Pressable
            onPress={onNewReservation}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          >
            <Text style={styles.ctaText}>New reservation</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service pulse</Text>
        <Text style={styles.pulseLine}>
          Open tickets · {openTickets}
        </Text>
        <Text style={styles.pulseLine}>
          On tonight · {mockStaff.map((s) => s.name).join(", ")}
        </Text>
        <Text style={styles.hint}>
          Mock data — Supabase cloud comes next. No home server required.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hero: {
    minHeight: 340,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    justifyContent: "flex-end",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(196, 163, 90, 0.07)",
  },
  brand: {
    color: colors.brass,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  headline: {
    color: colors.linen,
    fontFamily: fonts.displaySoft,
    fontSize: 28,
    lineHeight: 34,
    maxWidth: 340,
  },
  support: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 340,
  },
  ctaRow: { marginTop: 8 },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: colors.brass,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.88 },
  ctaText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 22,
    gap: 8,
  },
  sectionTitle: {
    color: colors.leafBright,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  pulseLine: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    marginTop: 12,
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
