import { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { GlassView } from "expo-glass-effect";
import { colors } from "../theme";
import { useChromeMaterial } from "../lib/liquidGlass";

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  interactive?: boolean;
  variant?: "regular" | "clear";
};

/**
 * System chrome only (tab bar, nav, sheets, docks). Never wrap product tiles.
 * iOS 26+ / iOS 27: native Liquid Glass. Older iOS + Android: frost fallback.
 */
export function GlassPanel({
  children,
  style,
  contentStyle,
  intensity = 48,
  interactive = false,
  variant = "regular",
}: Props) {
  const { native, reduce } = useChromeMaterial();
  const inner = <View style={[styles.inner, contentStyle]}>{children}</View>;

  if (reduce) {
    return <View style={[styles.solid, style]}>{inner}</View>;
  }

  if (native) {
    return (
      <GlassView
        glassEffectStyle={variant}
        tintColor={colors.glassTint}
        colorScheme="light"
        isInteractive={interactive}
        style={[styles.native, style]}
      >
        {inner}
      </GlassView>
    );
  }

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
      {inner}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  native: {},
  solid: {
    overflow: "hidden",
    backgroundColor: colors.glassStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  shell: {
    overflow: "hidden",
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorder,
  },
  rim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
