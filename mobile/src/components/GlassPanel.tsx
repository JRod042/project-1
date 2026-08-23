import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii } from "../theme";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  strong?: boolean;
};

/** Translucent material approximating Apple liquid glass. */
export function GlassPanel({ children, style, strong }: Props) {
  return (
    <View style={[styles.shell, strong && styles.shellStrong, style]}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.14)",
          "rgba(255,255,255,0.04)",
          "rgba(255,255,255,0.02)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
  },
  shellStrong: {
    backgroundColor: colors.glassStrong,
    borderColor: colors.glassHighlight,
  },
  inner: {
    position: "relative",
  },
});
