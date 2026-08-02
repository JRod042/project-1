import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { colors, fonts } from "../theme";
import type { AppSettings, ProviderName } from "../types";
import { healthCheck } from "../lib/api";

const PROVIDERS: ProviderName[] = ["xai", "openai", "gemini"];

type Props = {
  visible: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (next: AppSettings) => void;
};

export function SettingsSheet({ visible, settings, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(settings);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (visible) setDraft(settings);
  }, [visible, settings]);

  const ping = async () => {
    const url = draft.serverUrl.trim();
    const loopback =
      /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(url);
    if (loopback) {
      setStatus(
        `Unreachable on device: ${url || "(empty)"} is this iPad itself. Use http://YOUR_COMPUTER_LAN_IP:8787 (same Wi‑Fi) or an https tunnel URL, then SAVE.`
      );
      return;
    }
    try {
      setStatus(`Checking ${url}…`);
      const h = await healthCheck(url);
      const auth = h.authRequired
        ? draft.serverToken
          ? "auth=token set"
          : "auth=REQUIRED (set server token)"
        : "auth=open";
      setStatus(
        `Online · ${auth} · shell=${h.shellMode ?? "?"} · workspace ${h.workspaceRoot} · keys xai=${h.providers.xai} openai=${h.providers.openai} gemini=${h.providers.gemini}`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unreachable";
      setStatus(
        `${msg} — is omni-server running on that host:8787? Same Wi‑Fi? Firewall allowing 8787?`
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Systems</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>CLOSE</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>Agent server URL</Text>
            <TextInput
              style={styles.input}
              value={draft.serverUrl}
              onChangeText={(serverUrl) => setDraft((d) => ({ ...d, serverUrl }))}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://YOUR_LAN_IP:8787"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.hint}>
              On iPhone/iPad use your computer's LAN IP (e.g. http://192.168.1.20:8787),
              not localhost. Tap TEST LINK after starting the agent server.
            </Text>

            <Text style={styles.label}>Provider</Text>
            <View style={styles.row}>
              {PROVIDERS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setDraft((d) => ({ ...d, provider: p }))}
                  style={[
                    styles.provider,
                    draft.provider === p && styles.providerOn,
                  ]}
                >
                  <Text
                    style={[
                      styles.providerText,
                      draft.provider === p && styles.providerTextOn,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              value={draft.model}
              onChangeText={(model) => setDraft((d) => ({ ...d, model }))}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>API key (optional if set on server)</Text>
            <TextInput
              style={styles.input}
              value={draft.apiKey}
              onChangeText={(apiKey) => setDraft((d) => ({ ...d, apiKey }))}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="sk-… / xai-…"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Server token (OMNI_SERVER_TOKEN)</Text>
            <TextInput
              style={styles.input}
              value={draft.serverToken}
              onChangeText={(serverToken) =>
                setDraft((d) => ({ ...d, serverToken }))
              }
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="Required when server auth is enabled"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.hint}>
              If /health reports authRequired, chat and sessions need this token.
            </Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Auto-approve tools</Text>
                <Text style={styles.hint}>
                  Shell and file writes skip the confirm step.
                </Text>
              </View>
              <Switch
                value={draft.autoApprove}
                onValueChange={(autoApprove) =>
                  setDraft((d) => ({ ...d, autoApprove }))
                }
                trackColor={{ true: colors.brandDim, false: colors.line }}
                thumbColor={draft.autoApprove ? colors.brand : "#ccc"}
              />
            </View>

            <Pressable style={styles.secondary} onPress={ping}>
              <Text style={styles.secondaryText}>TEST LINK</Text>
            </Pressable>
            {status ? <Text style={styles.status}>{status}</Text> : null}
          </ScrollView>

          <Pressable
            style={styles.save}
            onPress={() => {
              onSave(draft);
              onClose();
            }}
          >
            <Text style={styles.saveText}>SAVE SYSTEMS</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "92%",
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  close: {
    color: colors.brand,
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.monoMed,
    fontSize: 12,
    marginTop: 8,
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgPanel,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  provider: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  providerOn: {
    borderColor: colors.brand,
    backgroundColor: "#1C2814",
  },
  providerText: {
    color: colors.textMuted,
    fontFamily: fonts.monoMed,
    fontSize: 12,
  },
  providerTextOn: {
    color: colors.brand,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  secondary: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.text,
    fontFamily: fonts.monoBold,
    letterSpacing: 1,
  },
  status: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
  },
  save: {
    marginHorizontal: 16,
    backgroundColor: colors.brand,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    color: "#0B0F0C",
    fontFamily: fonts.monoBold,
    letterSpacing: 1,
  },
});
