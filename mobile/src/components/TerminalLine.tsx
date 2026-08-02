import { StyleSheet, Text, View } from "react-native";
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

export function TerminalLine({ item }: { item: TimelineItem }) {
  if (item.kind === "user") {
    return (
      <View style={styles.block}>
        <Text style={styles.prompt}>you ›</Text>
        <Text style={styles.user}>{item.text}</Text>
      </View>
    );
  }

  if (item.kind === "assistant") {
    return (
      <View style={styles.block}>
        <Text style={styles.promptBrand}>omni ›</Text>
        <Text style={styles.assistant}>{item.text}</Text>
      </View>
    );
  }

  if (item.kind === "status") {
    return <Text style={styles.status}>// {item.text}</Text>;
  }

  if (item.kind === "error") {
    return (
      <View style={styles.block}>
        <Text style={styles.errorLabel}>error ›</Text>
        <Text style={styles.error}>{item.text}</Text>
      </View>
    );
  }

  if (item.kind === "tool") {
    return (
      <View style={styles.toolBox}>
        <Text style={styles.toolHeader}>
          {item.running ? "⟳" : item.ok === false ? "✗" : "✓"} tool::{item.name}
        </Text>
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
    );
  }

  if (item.kind === "approval") {
    return (
      <View style={[styles.toolBox, styles.approvalBox]}>
        <Text style={styles.approvalHeader}>needs approval › {item.name}</Text>
        <Text style={styles.toolMeta}>{item.reason}</Text>
        <Text style={styles.toolOut} numberOfLines={8}>
          {prettyArgs(item.args)}
        </Text>
        {item.resolved ? (
          <Text style={styles.status}>// {item.resolved}</Text>
        ) : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 14,
    gap: 4,
  },
  prompt: {
    color: colors.textMuted,
    fontFamily: fonts.monoMed,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  promptBrand: {
    color: colors.brandDim,
    fontFamily: fonts.monoMed,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  user: {
    color: colors.user,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
  },
  assistant: {
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
  },
  status: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 8,
  },
  errorLabel: {
    color: colors.danger,
    fontFamily: fonts.monoMed,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  toolBox: {
    borderLeftWidth: 2,
    borderLeftColor: colors.tool,
    paddingLeft: 10,
    marginBottom: 12,
    gap: 4,
  },
  approvalBox: {
    borderLeftColor: colors.warn,
  },
  toolHeader: {
    color: colors.tool,
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  approvalHeader: {
    color: colors.warn,
    fontFamily: fonts.monoBold,
    fontSize: 12,
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
