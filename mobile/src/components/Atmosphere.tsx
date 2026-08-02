import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

/** Layered void + slow scan sweep — presence without noise. */
export function Atmosphere() {
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, {
          toValue: 1,
          duration: 5200,
          useNativeDriver: true,
        }),
        Animated.timing(scan, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const translateY = scan.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 720],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#0A1620", "#070A0F", "#0B1014", "#061018"]}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(184,255,61,0.12)", "transparent", "rgba(62,224,197,0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.flare}
      />
      <View style={styles.grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`h-${i}`} style={[styles.hLine, { top: i * 64 }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`v-${i}`} style={[styles.vLine, { left: i * 56 }]} />
        ))}
      </View>
      <Animated.View
        style={[
          styles.scanBand,
          { transform: [{ translateY }] },
        ]}
      />
      <View style={styles.vignette} />
    </View>
  );
}

const styles = StyleSheet.create({
  flare: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  grid: {
    ...StyleSheet.absoluteFill,
    opacity: 1,
  },
  hLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.grid,
  },
  vLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.grid,
  },
  scanBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: colors.scan,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    borderWidth: 24,
    borderColor: "rgba(7,10,15,0.55)",
  },
});
