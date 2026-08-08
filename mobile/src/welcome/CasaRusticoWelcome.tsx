/**
 * Casa Rustico welcome — Appllama ReferenceCanvas/geometry (GPL shared/) +
 * original brand, timed with React Native Animated (no Reanimated native module).
 *
 * Structure follows Appllama onX Hunt (splash hold → CTA) and Yazio (staggered motifs).
 */
import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { CasaWelcomeScreenProps } from "./types";
import { resolveActionPress } from "./shared/actions";
import { box } from "./shared/geometry";
import { ReplicaPressable } from "./shared/pressable";
import { ReferenceCanvas } from "./shared/reference-canvas";

const SPLASH_HOLD_MS = 900;
const SPLASH_FADE_MS = 420;

export function CasaRusticoWelcome({
  autoplay = true,
  onActionPress,
  onPrimaryPress,
  replayKey = 0,
}: CasaWelcomeScreenProps) {
  const splash = useRef(new Animated.Value(1)).current;
  const content = useRef(new Animated.Value(0)).current;
  const motifA = useRef(new Animated.Value(0)).current;
  const motifB = useRef(new Animated.Value(0)).current;
  const motifC = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;
  const [interactionsReady, setInteractionsReady] = useState(!autoplay);

  useEffect(() => {
    splash.setValue(autoplay ? 1 : 0);
    content.setValue(autoplay ? 0 : 1);
    motifA.setValue(autoplay ? 0 : 1);
    motifB.setValue(autoplay ? 0 : 1);
    motifC.setValue(autoplay ? 0 : 1);
    cta.setValue(autoplay ? 0 : 1);
    setInteractionsReady(!autoplay);

    if (!autoplay) return;

    const anim = Animated.sequence([
      Animated.delay(SPLASH_HOLD_MS),
      Animated.timing(splash, {
        toValue: 0,
        duration: SPLASH_FADE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.stagger(110, [
        Animated.timing(content, {
          toValue: 1,
          duration: 480,
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
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    anim.start(({ finished }) => {
      if (finished) setInteractionsReady(true);
    });

    return () => anim.stop();
  }, [autoplay, replayKey, splash, content, motifA, motifB, motifC, cta]);

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
    <ReferenceCanvas backgroundColor="#1A2118" testID="welcome-casa-rustico">
      <StatusBar style="light" />

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: content }]}>
        <LinearGradient
          colors={["#2A3326", "#1A2118", "#12160F"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroWash} />

        <Animated.View style={rise(content, 14)}>
          <Text style={styles.eyebrow}>SERVICE DESK</Text>
          <Text style={styles.brand}>Casa{"\n"}Rustico</Text>
          <Text style={styles.tagline}>
            The house, in your pocket — books, floor, and close.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.motifBook, rise(motifA, 24)]}>
          <Text style={styles.motifGlyph}>◈</Text>
          <Text style={styles.motifLabel}>Book</Text>
        </Animated.View>
        <Animated.View style={[styles.motifFloor, rise(motifB, 24)]}>
          <Text style={styles.motifGlyph}>◎</Text>
          <Text style={styles.motifLabel}>Floor</Text>
        </Animated.View>
        <Animated.View style={[styles.motifHouse, rise(motifC, 24)]}>
          <Text style={styles.motifGlyph}>▤</Text>
          <Text style={styles.motifLabel}>House</Text>
        </Animated.View>

        <Animated.View style={rise(cta, 20)}>
          <ReplicaPressable
            accessibilityLabel="Enter the house"
            disabled={!interactionsReady}
            onPress={resolveActionPress(
              "casa.enter-house",
              onActionPress,
              onPrimaryPress
            )}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>Enter the house</Text>
          </ReplicaPressable>
          <Text style={styles.footnote}>Cloud-ready · no home server</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.splash, { opacity: splash }]}
      >
        <Text style={styles.splashMark}>CR</Text>
        <Text style={styles.splashWord}>CASA RUSTICO</Text>
      </Animated.View>
    </ReferenceCanvas>
  );
}

const styles = StyleSheet.create({
  heroWash: {
    ...box([0, 0, 640, 520]),
    backgroundColor: "rgba(196, 163, 90, 0.08)",
  },
  eyebrow: {
    ...box([56, 220, 528, 28]),
    color: "#C4A35A",
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 18,
    letterSpacing: 4,
  },
  brand: {
    ...box([56, 260, 528, 160]),
    color: "#F3EDE2",
    fontFamily: "Fraunces_700Bold",
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -1.5,
  },
  tagline: {
    ...box([56, 440, 520, 80]),
    color: "rgba(243, 237, 226, 0.72)",
    fontFamily: "SourceSans3_400Regular",
    fontSize: 26,
    lineHeight: 34,
  },
  motifBook: {
    ...box([56, 560, 160, 140]),
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(243, 237, 226, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(243, 237, 226, 0.14)",
  },
  motifFloor: {
    ...box([240, 560, 160, 140]),
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(243, 237, 226, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(243, 237, 226, 0.14)",
  },
  motifHouse: {
    ...box([424, 560, 160, 140]),
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(243, 237, 226, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(243, 237, 226, 0.14)",
  },
  motifGlyph: {
    color: "#C4A35A",
    fontSize: 34,
  },
  motifLabel: {
    color: "#F3EDE2",
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 20,
    letterSpacing: 0.8,
  },
  primary: {
    ...box([56, 1090, 528, 90]),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4A35A",
  },
  primaryText: {
    color: "#12160F",
    fontFamily: "SourceSans3_700Bold",
    fontSize: 28,
    letterSpacing: 0.4,
  },
  footnote: {
    ...box([56, 1200, 528, 40]),
    color: "rgba(243, 237, 226, 0.55)",
    fontFamily: "SourceSans3_400Regular",
    fontSize: 20,
    textAlign: "center",
  },
  splash: {
    ...box([0, 0, 640, 1385]),
    alignItems: "center",
    backgroundColor: "#1A2118",
    justifyContent: "center",
    gap: 18,
  },
  splashMark: {
    color: "#C4A35A",
    fontFamily: "Fraunces_700Bold",
    fontSize: 96,
    letterSpacing: 6,
  },
  splashWord: {
    color: "#F3EDE2",
    fontFamily: "SourceSans3_600SemiBold",
    fontSize: 22,
    letterSpacing: 6,
  },
});
