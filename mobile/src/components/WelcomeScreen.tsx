import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { colors, fonts } from "../theme";

type Props = {
  onEnter: () => void;
};

/**
 * Original Casa Rustico welcome.
 * Motion patterns studied from Appllama/top-welcome-screens (GPL — not copied):
 * brand splash hold → dissolve → staggered motifs + CTA.
 */
export function WelcomeScreen({ onEnter }: Props) {
  const { height } = useWindowDimensions();
  const splash = useRef(new Animated.Value(1)).current;
  const content = useRef(new Animated.Value(0)).current;
  const motifA = useRef(new Animated.Value(0)).current;
  const motifB = useRef(new Animated.Value(0)).current;
  const motifC = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hold = 900;
    Animated.sequence([
      Animated.delay(hold),
      Animated.timing(splash, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(120, [
      Animated.timing(content, {
        toValue: 1,
        duration: 520,
        delay: hold + 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(motifA, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(motifB, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(motifC, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(cta, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [splash, content, motifA, motifB, motifC, cta]);

  const rise = (v: Animated.Value, from = 18) => ({
    opacity: v,
    transform: [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [from, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#243024", colors.bg, "#12160F"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Atmosphere: soft linen wash — not Omni grid/CRT */}
      <View style={[styles.heroWash, { height: height * 0.42 }]} />

      <Animated.View style={[styles.main, rise(content, 14)]}>
        <Text style={styles.eyebrow}>SERVICE DESK</Text>
        <Text style={styles.brand}>Casa{"\n"}Rustico</Text>
        <Text style={styles.tagline}>
          The house, in your pocket — books, floor, and close.
        </Text>

        <View style={styles.motifs}>
          <Animated.View style={[styles.motif, rise(motifA, 22)]}>
            <Text style={styles.motifGlyph}>◈</Text>
            <Text style={styles.motifLabel}>Book</Text>
          </Animated.View>
          <Animated.View style={[styles.motif, rise(motifB, 22)]}>
            <Text style={styles.motifGlyph}>◎</Text>
            <Text style={styles.motifLabel}>Floor</Text>
          </Animated.View>
          <Animated.View style={[styles.motif, rise(motifC, 22)]}>
            <Text style={styles.motifGlyph}>▤</Text>
            <Text style={styles.motifLabel}>House</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.footer, rise(cta, 24)]}>
        <Pressable
          onPress={onEnter}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Enter the house"
        >
          <Text style={styles.primaryText}>Enter the house</Text>
        </Pressable>
        <Text style={styles.footnote}>Cloud-ready · no home server</Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.splash, { opacity: splash }]}
      >
        <Text style={styles.splashMark}>CR</Text>
        <Text style={styles.splashWord}>CASA RUSTICO</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  heroWash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(196, 163, 90, 0.08)",
  },
  main: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 88,
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.brass,
    fontFamily: fonts.bodyMed,
    fontSize: 12,
    letterSpacing: 3.2,
    marginBottom: 14,
  },
  brand: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 58,
    letterSpacing: -1.2,
    marginBottom: 16,
  },
  tagline: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 26,
    maxWidth: 320,
  },
  motifs: {
    flexDirection: "row",
    gap: 12,
    marginTop: 36,
  },
  motif: {
    flex: 1,
    backgroundColor: "rgba(243, 237, 226, 0.06)",
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    gap: 8,
  },
  motifGlyph: {
    color: colors.brass,
    fontSize: 22,
  },
  motifLabel: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 14,
  },
  primary: {
    backgroundColor: colors.brass,
    paddingVertical: 18,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.88,
  },
  primaryText: {
    color: colors.ink,
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    letterSpacing: 0.4,
  },
  footnote: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: "center",
  },
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  splashMark: {
    color: colors.brass,
    fontFamily: fonts.display,
    fontSize: 72,
    letterSpacing: 4,
  },
  splashWord: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    letterSpacing: 4.5,
  },
});
