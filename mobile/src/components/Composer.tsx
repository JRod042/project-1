import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "../theme";

const SUGGESTIONS = [
  "Plan my day and start the first task",
  "Research this and draft a plan",
  "Scan the workspace and tell me what matters",
  "Build something for me end to end",
];

type Props = {
  busy: boolean;
  onSend: (text: string) => void;
  onCancel?: () => void;
};

export function Composer({ busy, onSend, onCancel }: Props) {
  const [text, setText] = useState("");

  const submit = async (value?: string) => {
    const next = (value ?? text).trim();
    if (!next || busy) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setText("");
    onSend(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.topRule} />
      <View style={styles.bracketRow}>
        <View style={[styles.composerBracket, styles.composerBracketL]} />
        <Text style={styles.channel}>CMD CHANNEL</Text>
        <View style={[styles.composerBracket, styles.composerBracketR]} />
      </View>
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => submit(s)}
            style={({ pressed }) => [
              styles.chip,
              pressed && styles.chipPressed,
              busy && styles.chipDisabled,
            ]}
            disabled={busy}
          >
            <Text style={styles.chipText} numberOfLines={1}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.inputShell}>
          <Text style={styles.caret}>{">"}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Issue command…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
            editable={!busy}
            onSubmitEditing={() => submit()}
            blurOnSubmit
          />
        </View>
        {busy ? (
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCancel?.();
            }}
            style={styles.cancel}
          >
            <Text style={styles.cancelText}>STOP</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => submit()}
            disabled={!text.trim()}
            style={[styles.send, !text.trim() && styles.sendDisabled]}
          >
            <Text style={styles.sendText}>RUN</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bgGlass,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineBright,
  },
  topRule: {
    height: 2,
    backgroundColor: colors.brand,
    opacity: 0.35,
    marginBottom: 2,
  },
  bracketRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  composerBracket: {
    width: 14,
    height: 10,
    borderColor: colors.accentDim,
  },
  composerBracketL: {
    borderLeftWidth: 2,
    borderTopWidth: 2,
  },
  composerBracketR: {
    borderRightWidth: 2,
    borderTopWidth: 2,
  },
  channel: {
    color: colors.accentDim,
    fontFamily: fonts.monoMed,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: "100%",
    backgroundColor: "rgba(16,24,32,0.7)",
  },
  chipPressed: {
    borderColor: colors.accent,
    backgroundColor: "rgba(62,224,197,0.08)",
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  inputShell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  caret: {
    color: colors.brand,
    fontFamily: fonts.monoBold,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 1,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
    padding: 0,
    margin: 0,
  },
  send: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  cancel: {
    backgroundColor: "rgba(255,92,106,0.12)",
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: "center",
  },
  cancelText: {
    color: colors.danger,
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 1.2,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendText: {
    color: colors.brandInk,
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 1.4,
  },
});
