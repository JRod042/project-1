import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { useCart } from "../lib/cart";
import { openCartOnShopify } from "../lib/shopify";
import { PressableScale } from "../components/PressableScale";

type Props = {
  onClose: () => void;
  onDone?: () => void;
};

/** Checkout is Shopify — never collect cards in-app. */
export function CheckoutScreen({ onClose }: Props) {
  const cart = useCart();

  useEffect(() => {
    void openCartOnShopify(
      cart.lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
    ).finally(onClose);
  }, [cart.lines, onClose]);

  return (
    <View style={styles.root}>
      <ActivityIndicator color={colors.brass} />
      <Text style={styles.copy}>Opening rusticopr.com…</Text>
      <PressableScale onPress={onClose}>
        <Text style={styles.link}>Back to bag</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  copy: { color: colors.linenDim, fontFamily: fonts.body, fontSize: 16 },
  link: { color: colors.brass, fontFamily: fonts.bodyMed, fontSize: 15 },
});
