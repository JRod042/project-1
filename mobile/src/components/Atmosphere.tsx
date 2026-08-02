import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

/** Layered void HUD — grid, CRT lines, corner brackets, sparse noise, scan sweep. */
export function Atmosphere() {
  const scan = useRef(new Animated.Value(0)).current;
  const flicker = useRef(new Animated.Value(0.04)).current;

  const noise = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        key: `n-${i}`,
        left: ((i * 97) % 100) + (i % 3),
        top: ((i * 53) % 100) + (i % 5),
        size: 1 + (i % 3),
        opacity: 0.08 + (i % 5) * 0.03,
      })),
    []
  );

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, {
          toValue: 0.09,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(flicker, {
          toValue: 0.03,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flicker]);

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
        colors={[
          "rgba(184,255,61,0.12)",
          "transparent",
          "rgba(62,224,197,0.08)",
        ]}
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
      <View style={styles.crt}>
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={`crt-${i}`} style={styles.crtLine} />
        ))}
      </View>
      <Animated.View style={[styles.noiseLayer, { opacity: flicker }]}>
        {noise.map((n) => (
          <View
            key={n.key}
            style={[
              styles.noiseDot,
              {
                left: `${n.left}%`,
                top: `${n.top}%`,
                width: n.size,
                height: n.size,
                opacity: n.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>
      <Animated.View
        style={[styles.scanBand, { transform: [{ translateY }] }]}
      />
      <View style={[styles.bracket, styles.tl]} />
      <View style={[styles.bracket, styles.tr]} />
      <View style={[styles.bracket, styles.bl]} />
      <View style={[styles.bracket, styles.br]} />
      <View style={styles.vignette} />
    </View>
  );
}

const BRACKET = 22;

const styles = StyleSheet.create({
  flare: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
  },
  grid: {
    ...StyleSheet.absoluteFill,
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
  crt: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
    justifyContent: "space-evenly",
  },
  crtLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(232, 241, 244, 0.035)",
  },
  noiseLayer: {
    ...StyleSheet.absoluteFill,
  },
  noiseDot: {
    position: "absolute",
    backgroundColor: colors.accent,
  },
  scanBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: colors.scan,
  },
  bracket: {
    position: "absolute",
    width: BRACKET,
    height: BRACKET,
    borderColor: "rgba(184, 255, 61, 0.35)",
  },
  tl: {
    top: 10,
    left: 10,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  tr: {
    top: 10,
    right: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bl: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  br: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    borderWidth: 24,
    borderColor: "rgba(7,10,15,0.55)",
  },
});
