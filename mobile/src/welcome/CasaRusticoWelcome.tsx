/**
 * Casa Rustico welcome — Appllama welcome-engine (GPL) + original brand.
 *
 * Structure/timing follow the onX Hunt–style study in
 * https://github.com/Appllama/top-welcome-screens (splash hold → CTA page).
 * Motif stagger echoes the Yazio study’s spring entrances.
 * All copy, colors, and marks are Casa Rustico originals.
 */
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import type { CasaWelcomeScreenProps } from "./types";
import { resolveActionPress } from "./shared/actions";
import { box, segment } from "./shared/geometry";
import { useInteractionGate } from "./shared/interaction-gate";
import { ReplicaPressable } from "./shared/pressable";
import { ReferenceCanvas } from "./shared/reference-canvas";
import { useWelcomeTimeline } from "./shared/timeline";

const SPLASH_MS = 1067;
const TOTAL_MS = 1733;

type MotifProps = {
  label: string;
  glyph: string;
  enter: readonly [number, number];
  fromX: number;
  time: SharedValue<number>;
  boxStyle: object;
};

function Motif({ label, glyph, enter, fromX, time, boxStyle }: MotifProps) {
  const style = useAnimatedStyle(() => {
    const progress = Easing.out(Easing.back(1.4))(
      segment(time.value, enter[0], enter[1])
    );
    return {
      opacity: time.value >= enter[0] ? 1 : 0,
      transform: [
        { translateX: interpolate(progress, [0, 1], [fromX, 0]) },
        { translateY: interpolate(progress, [0, 1], [28, 0]) },
        { scale: interpolate(progress, [0, 1], [0.92, 1]) },
      ],
    };
  });

  return (
    <Animated.View style={[boxStyle, style]}>
      <Text style={styles.motifGlyph}>{glyph}</Text>
      <Text style={styles.motifLabel}>{label}</Text>
    </Animated.View>
  );
}

export function CasaRusticoWelcome({
  autoplay = true,
  onActionPress,
  onPrimaryPress,
  replayKey = 0,
}: CasaWelcomeScreenProps) {
  const time = useWelcomeTimeline(TOTAL_MS, autoplay, replayKey);
  const interactionsReady = useInteractionGate({
    autoplay,
    delayMs: SPLASH_MS,
    replayKey,
  });

  const splashStyle = useAnimatedStyle(() => ({
    opacity: 1 - Easing.out(Easing.quad)(segment(time.value, 900, SPLASH_MS)),
  }));

  const shellStyle = useAnimatedStyle(() => ({
    opacity: time.value >= 700 ? 1 : 0,
  }));

  return (
    <ReferenceCanvas backgroundColor="#1A2118" testID="welcome-casa-rustico">
      <StatusBar style="light" />

      <Animated.View style={[StyleSheet.absoluteFill, shellStyle]}>
        <LinearGradient
          colors={["#2A3326", "#1A2118", "#12160F"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroWash} />

        <Text style={styles.eyebrow}>SERVICE DESK</Text>
        <Text style={styles.brand}>Casa{"\n"}Rustico</Text>
        <Text style={styles.tagline}>
          The house, in your pocket — books, floor, and close.
        </Text>

        <Motif
          boxStyle={styles.motifBook}
          enter={[1180, 1480]}
          fromX={-40}
          glyph="◈"
          label="Book"
          time={time}
        />
        <Motif
          boxStyle={styles.motifFloor}
          enter={[1280, 1580]}
          fromX={0}
          glyph="◎"
          label="Floor"
          time={time}
        />
        <Motif
          boxStyle={styles.motifHouse}
          enter={[1380, 1680]}
          fromX={40}
          glyph="▤"
          label="House"
          time={time}
        />

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

      <Animated.View pointerEvents="none" style={[styles.splash, splashStyle]}>
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
