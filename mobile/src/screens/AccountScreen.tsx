import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { brand } from "../lib/catalog";

type Props = {
  onShowWelcome: () => void;
};

export function AccountScreen({ onShowWelcome }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.sub}>
        Sign-in and order history arrive with Shopify customer accounts.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{brand.name}</Text>
        <Text style={styles.cardBody}>
          {brand.tagline}. Shop the single-origin menu in-app; checkout will
          open against your Shopify store.
        </Text>
        <Text style={styles.site}>{brand.site}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Promo</Text>
        <Text style={styles.cardBody}>{brand.promo}</Text>
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
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 14,
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
    lineHeight: 22,
    marginBottom: 4,
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
    letterSpacing: 0.8,
  },
  cardBody: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  site: {
    color: colors.leafBright,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
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
