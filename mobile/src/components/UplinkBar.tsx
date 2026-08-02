import { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts } from "../theme";
import type { UplinkLevel, UplinkSnapshot } from "../lib/uplink";

type Props = {
  snap: UplinkSnapshot;
  modeLabel: string;
  onPress: () => void;
};

function tone(level: UplinkLevel) {
  switch (level) {
    case "online":
      return colors.brand;
    case "slow":
    case "loopback":
    case "unset":
      return colors.warn;
    case "offline":
      return colors.danger;
    case "probing":
    default:
      return colors.accent;
  }
}

/** Live uplink HUD — latency probe readout inspired by netly-style connection UX. */
export function UplinkBar({ snap, modeLabel, onPress }: Props) {
  const glow = useRef(new Animated.Value(0.45)).current;
  const color = tone(snap.level);

  useEffect(() => {
    if (snap.level !== "probing" && snap.level !== "slow") {
      glow.setValue(0.85);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow, snap.level]);

  const latency =
    snap.latencyMs != null ? `${snap.latencyMs}ms` : snap.level === "probing" ? "…" : "—";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Uplink ${snap.label}. ${snap.detail}. Tap to refresh or open systems.`}
    >
      <View style={[styles.corner, styles.tl, { borderColor: color }]} />
      <View style={[styles.corner, styles.tr, { borderColor: color }]} />
      <View style={[styles.corner, styles.bl, { borderColor: color }]} />
      <View style={[styles.corner, styles.br, { borderColor: color }]} />

      <View style={styles.row}>
        <Animated.View
          style={[styles.lamp, { backgroundColor: color, opacity: glow }]}
        />
        <Text style={[styles.label, { color }]}>{snap.label}</Text>
        <Text style={styles.sep}>│</Text>
        <Text style={styles.meta}>{modeLabel}</Text>
        <Text style={styles.sep}>│</Text>
        <Text style={[styles.meta, { color }]}>RTT {latency}</Text>
      </View>
      <Text style={styles.detail} numberOfLines={1}>
        {snap.detail}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 2,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "rgba(10, 16, 22, 0.72)",
    borderWidth: 1,
    borderColor: colors.line,
    gap: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  corner: {
    position: "absolute",
    width: 10,
    height: 10,
  },
  tl: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  lamp: {
    width: 7,
    height: 7,
  },
  label: {
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  sep: {
    color: colors.lineBright,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.monoMed,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  detail: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
});
