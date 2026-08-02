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
      <View style={styles.suggestions}>
        {SUGGESTIONS.map((s) => (
          <Pressable
            key={s}
            onPress={() => submit(s)}
            style={styles.chip}
            disabled={busy}
          >
            <Text style={styles.chipText} numberOfLines={1}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Command Omni…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          editable={!busy}
          onSubmitEditing={() => submit()}
          blurOnSubmit
        />
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
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "100%",
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
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
  },
  send: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  cancel: {
    backgroundColor: "#3A1F1F",
    borderWidth: 1,
    borderColor: "#E57373",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  cancelText: {
    color: "#E57373",
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 1,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  sendText: {
    color: "#0B0F0C",
    fontFamily: fonts.monoBold,
    fontSize: 13,
    letterSpacing: 1,
  },
});
