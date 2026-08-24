import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

/**
 * iOS 26 Liquid Glass — frost + specular highlight + inner rim.
 * Use on chrome only (tab bar, orbs, docks). Never on product tiles.
 */
export function GlassPanel({ children, style, intensity = 44 }: Props) {
  return (
    <BlurView intensity={intensity} tint="extraLight" style={[styles.shell, style]}>
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.58)",
          "rgba(255,253,248,0.08)",
          "rgba(196,164,132,0.16)",
        ]}
        locations={[0, 0.4, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.rim} />
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  rim: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.45)",
  },
  inner: {
    position: "relative",
    zIndex: 1,
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
});
