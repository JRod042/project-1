import { useEffect, useRef, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import type { TimelineItem } from "../types";

function prettyArgs(args?: Record<string, unknown>) {
  if (!args) return "";
  try {
    return JSON.stringify(args);
  } catch {
    return String(args);
  }
}

function FadeIn({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(6)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, y]);
  return (
    <Animated.View style={{ opacity, transform: [{ translateY: y }] }}>
      {children}
    </Animated.View>
  );
}

export function TerminalLine({ item }: { item: TimelineItem }) {
  if (item.kind === "user") {
    return (
      <FadeIn>
        <View style={styles.block}>
          <Text style={styles.prompt}>YOU //</Text>
          <Text style={styles.user}>{item.text}</Text>
        </View>
      </FadeIn>
    );
  }

  if (item.kind === "assistant") {
    return (
      <FadeIn>
        <View style={styles.block}>
          <Text style={styles.promptBrand}>OMNI //</Text>
          <Text style={styles.assistant}>{item.text}</Text>
        </View>
      </FadeIn>
    );
  }

  if (item.kind === "status") {
    return (
      <FadeIn>
        <Text style={styles.status}>∷ {item.text}</Text>
      </FadeIn>
    );
  }

  if (item.kind === "error") {
    return (
      <FadeIn>
        <View style={[styles.rail, styles.railDanger]}>
          <Text style={styles.errorLabel}>FAULT //</Text>
          <Text style={styles.error}>{item.text}</Text>
        </View>
      </FadeIn>
    );
  }

  if (item.kind === "tool") {
    const mark = item.running ? "RUN" : item.ok === false ? "ERR" : "OK";
    return (
      <FadeIn>
        <View style={[styles.rail, styles.railTool]}>
          <View style={styles.toolHead}>
            <Text style={styles.toolMark}>[{mark}]</Text>
            <Text style={styles.toolHeader}>tool::{item.name}</Text>
          </View>
          {item.args ? (
            <Text style={styles.toolMeta} numberOfLines={3}>
              {prettyArgs(item.args)}
            </Text>
          ) : null}
          {item.output ? (
            <Text style={styles.toolOut} numberOfLines={12}>
              {item.output}
            </Text>
          ) : null}
        </View>
      </FadeIn>
    );
  }

  if (item.kind === "approval") {
    return (
      <FadeIn>
        <View style={[styles.rail, styles.railWarn]}>
          <Text style={styles.approvalHeader}>
            HOLD // authorize {item.name}
          </Text>
          <Text style={styles.toolMeta}>{item.reason}</Text>
          <Text style={styles.toolOut} numberOfLines={8}>
            {prettyArgs(item.args)}
          </Text>
          {item.resolved ? (
            <Text style={styles.status}>∷ {item.resolved}</Text>
          ) : null}
        </View>
      </FadeIn>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
    gap: 6,
  },
  prompt: {
    color: colors.textMuted,
    fontFamily: fonts.monoMed,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  promptBrand: {
    color: colors.brand,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  user: {
    color: colors.user,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 23,
  },
  assistant: {
    color: colors.assistant,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 23,
  },
  status: {
    color: colors.accentDim,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  rail: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginBottom: 14,
    gap: 5,
    paddingVertical: 2,
  },
  railTool: { borderLeftColor: colors.tool },
  railWarn: { borderLeftColor: colors.warn },
  railDanger: { borderLeftColor: colors.danger },
  errorLabel: {
    color: colors.danger,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 20,
  },
  toolHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toolMark: {
    color: colors.accent,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  toolHeader: {
    color: colors.tool,
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  approvalHeader: {
    color: colors.warn,
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  toolMeta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  toolOut: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
});
