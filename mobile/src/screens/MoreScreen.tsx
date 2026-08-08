import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

type Props = {
  onShowWelcome: () => void;
};

export function MoreScreen({ onShowWelcome }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.sub}>
        Settings, reports, and cloud setup live here next.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Runtime</Text>
        <Text style={styles.cardBody}>
          Cloud-only Casa Rustico. OpenClaw / LAN gateway removed from the
          product path — no Linux host required.
        </Text>
      </View>

      <Pressable
        onPress={onShowWelcome}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.btnText}>Replay welcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 1,
  },
  cardBody: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingVertical: 14,
    alignItems: "center",
  },
  pressed: { opacity: 0.85 },
  btnText: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 15,
  },
});
