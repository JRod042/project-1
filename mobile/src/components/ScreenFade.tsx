import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

/** Visible immediately. A 0→1 fade left Shop/You blank on iPad during App Review. */
export function ScreenFade({ children }: { children: ReactNode }) {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
