import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  useFonts,
  Syne_700Bold,
  Syne_800ExtraBold,
} from "@expo-google-fonts/syne";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_700Bold,
} from "@expo-google-fonts/ibm-plex-mono";
import * as SplashScreen from "expo-splash-screen";
import { TerminalLine } from "./src/components/TerminalLine";
import { Composer } from "./src/components/Composer";
import { ApprovalBar } from "./src/components/ApprovalBar";
import { SettingsSheet } from "./src/components/SettingsSheet";
import { SessionDrawer } from "./src/components/SessionDrawer";
import { ApiError, getSession, streamChat } from "./src/lib/api";
import { controlUiUrl, normalizeOpenclawBaseUrl } from "./src/lib/openclaw";
import { loadSettings, saveSettings } from "./src/lib/storage";
import { colors, fonts } from "./src/theme";
import type { AppSettings, TimelineItem } from "./src/types";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function bootFor(settings: AppSettings | null): TimelineItem[] {
  if (!settings || settings.runtimeMode === "openclaw") {
    return [
      {
        id: "boot_1",
        kind: "status",
        text: "omni online — openclaw runtime",
      },
      {
        id: "boot_2",
        kind: "assistant",
        text: "I'm Omni, fronting OpenClaw — the Jarvis-class gateway. Open SYS → set Control UI URL + token → OPEN CONTROL UI. Or message your Telegram bot if you linked a channel. Type anything here to launch the Control UI.",
      },
    ];
  }
  return [
    {
      id: "boot_1",
      kind: "status",
      text: "omni online — legacy SSE agent",
    },
    {
      id: "boot_2",
      kind: "assistant",
      text: "Legacy mode: research, code, shell, files via the Omni server on :8787. Prefer OpenClaw in SYS for the full operator stack.",
    },
  ];
}

function messagesToTimeline(
  messages: Array<{
    role: string;
    content: string;
    name?: string;
    tool_call_id?: string;
  }>
): TimelineItem[] {
  const items: TimelineItem[] = [
    {
      id: uid("boot"),
      kind: "status",
      text: "session resumed",
    },
  ];
  for (const m of messages) {
    if (m.role === "user") {
      items.push({ id: uid("u"), kind: "user", text: m.content });
    } else if (m.role === "assistant" && m.content) {
      items.push({ id: uid("as"), kind: "assistant", text: m.content });
    } else if (m.role === "tool") {
      items.push({
        id: m.tool_call_id || uid("tool"),
        kind: "tool",
        name: m.name || "tool",
        output: m.content,
        ok: !m.content.startsWith("Error:") && m.content !== "User denied this action.",
        running: false,
      });
    }
  }
  return items;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Syne_700Bold,
    Syne_800ExtraBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_700Bold,
  });

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [items, setItems] = useState<TimelineItem[]>(bootFor(null));
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [authHint, setAuthHint] = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const listRef = useRef<FlatList<TimelineItem>>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setItems(bootFor(s));
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const append = useCallback((item: TimelineItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const patch = useCallback(
    (id: string, updater: (item: TimelineItem) => TimelineItem) => {
      setItems((prev) => prev.map((it) => (it.id === id ? updater(it) : it)));
    },
    []
  );

  const openOpenclawUi = useCallback(async () => {
    if (!settings) return;
    const base = normalizeOpenclawBaseUrl(settings.openclawUrl);
    if (!base) {
      append({
        id: uid("err"),
        kind: "error",
        text: "Set OpenClaw Control UI URL in SYS (LAN/Tailscale IP:18789 — not localhost).",
      });
      setSettingsOpen(true);
      return;
    }
    const url = controlUiUrl(base, settings.openclawToken);
    const hasToken = Boolean(settings.openclawToken.trim());
    try {
      await Linking.openURL(url);
      append({
        id: uid("st"),
        kind: "status",
        text: hasToken
          ? `opened control ui · ${base} · token via #token=`
          : `opened control ui · ${base} · set gateway token in SYS for auto-auth`,
      });
    } catch (err) {
      append({
        id: uid("err"),
        kind: "error",
        text:
          err instanceof Error
            ? err.message
            : `Could not open ${base}. Check SYS URL.`,
      });
    }
  }, [append, settings]);

  const cancelRun = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const run = useCallback(
    async (payload: {
      message?: string;
      approvalDecision?: { id: string; approve: boolean };
    }) => {
      if (!settings) return;
      cancelRun();
      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);
      setPendingApproval(null);
      setAuthHint(false);

      let assistantId: string | null = null;

      try {
        await streamChat(
          settings,
          { ...payload, sessionId },
          (event) => {
            if (event.type === "session") {
              setSessionId(event.sessionId);
            } else if (event.type === "status") {
              append({ id: uid("st"), kind: "status", text: event.status });
            } else if (event.type === "text" || event.type === "text_delta") {
              const chunk = event.text;
              const joiner = event.type === "text" ? (assistantId ? "\n" : "") : "";
              if (!assistantId) {
                assistantId = uid("as");
                append({ id: assistantId, kind: "assistant", text: chunk });
              } else {
                const id = assistantId;
                patch(id, (it) =>
                  it.kind === "assistant"
                    ? { ...it, text: `${it.text}${joiner}${chunk}` }
                    : it
                );
              }
            } else if (event.type === "tool_start") {
              append({
                id: event.id,
                kind: "tool",
                name: event.name,
                args: event.arguments,
                running: true,
              });
            } else if (event.type === "tool_result") {
              patch(event.id, (it) =>
                it.kind === "tool"
                  ? {
                      ...it,
                      running: false,
                      ok: event.ok,
                      output: event.output,
                    }
                  : it
              );
            } else if (event.type === "approval_required") {
              const queueNote =
                event.queueRemaining && event.queueRemaining > 0
                  ? ` (+${event.queueRemaining} queued)`
                  : "";
              append({
                id: uid("ap"),
                kind: "approval",
                toolId: event.id,
                name: event.name,
                args: event.arguments,
                reason: `${event.reason}${queueNote}`,
              });
              setPendingApproval({ id: event.id, name: event.name });
            } else if (event.type === "auth_required") {
              setAuthHint(true);
              append({
                id: uid("auth"),
                kind: "error",
                text:
                  event.message ||
                  "Server auth required. Open Systems and set Server token.",
              });
            } else if (event.type === "error") {
              if (event.code === "auth_required") setAuthHint(true);
              append({ id: uid("err"), kind: "error", text: event.message });
            }
          },
          controller.signal
        );
      } catch (err) {
        if (err instanceof ApiError && err.code === "aborted") {
          append({
            id: uid("st"),
            kind: "status",
            text: "cancelled",
          });
        } else if (err instanceof ApiError && err.status === 401) {
          setAuthHint(true);
          append({
            id: uid("err"),
            kind: "error",
            text: err.message,
          });
        } else {
          append({
            id: uid("err"),
            kind: "error",
            text:
              err instanceof Error
                ? err.message
                : "Failed to reach Omni server. Open Systems and set your LAN URL + API key.",
          });
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
        requestAnimationFrame(() =>
          listRef.current?.scrollToEnd({ animated: true })
        );
      }
    },
    [append, cancelRun, patch, sessionId, settings]
  );

  const onSend = (text: string) => {
    append({ id: uid("u"), kind: "user", text });
    if (settings?.runtimeMode === "openclaw") {
      append({
        id: uid("st"),
        kind: "status",
        text: "openclaw mode — launching control ui (chat + tools live there / telegram)",
      });
      void openOpenclawUi();
      return;
    }
    run({ message: text });
  };

  const onApprove = (approve: boolean) => {
    if (!pendingApproval) return;
    const toolId = pendingApproval.id;
    setItems((prev) =>
      prev.map((it) =>
        it.kind === "approval" && it.toolId === toolId
          ? { ...it, resolved: approve ? "approved" : "denied" }
          : it
      )
    );
    run({ approvalDecision: { id: toolId, approve } });
  };

  const newMission = () => {
    cancelRun();
    setSessionId(undefined);
    setPendingApproval(null);
    setAuthHint(false);
    if (settings?.runtimeMode === "openclaw") {
      setItems(bootFor(settings));
      return;
    }
    setItems([
      {
        id: uid("boot"),
        kind: "status",
        text: "new mission — clean context",
      },
      {
        id: uid("hi"),
        kind: "assistant",
        text: "Fresh session. What are we taking on?",
      },
    ]);
  };

  const resumeSession = async (id: string) => {
    if (!settings) return;
    cancelRun();
    try {
      const session = await getSession(settings, id);
      setSessionId(session.id);
      const timeline = messagesToTimeline(session.messages);
      if (session.pendingApproval) {
        timeline.push({
          id: uid("ap"),
          kind: "approval",
          toolId: session.pendingApproval.id,
          name: session.pendingApproval.name,
          args: session.pendingApproval.arguments,
          reason: session.pendingApproval.reason,
        });
        setPendingApproval({
          id: session.pendingApproval.id,
          name: session.pendingApproval.name,
        });
      } else {
        setPendingApproval(null);
      }
      setItems(timeline);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setAuthHint(true);
      append({
        id: uid("err"),
        kind: "error",
        text: err instanceof Error ? err.message : "Could not resume session",
      });
    }
  };

  if (!fontsLoaded || !settings) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#101A12", "#0B0F0C", "#0E1518"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>OMNI</Text>
            <Text style={styles.tag}>
              {settings.runtimeMode === "openclaw"
                ? "openclaw · personal operator"
                : "legacy sse · personal agent"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
            {settings.runtimeMode === "legacy" ? (
              <Pressable
                onPress={() => setSessionsOpen(true)}
                style={styles.headerBtn}
              >
                <Text style={styles.headerBtnText}>LOG</Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => void openOpenclawUi()} style={styles.headerBtn}>
                <Text style={styles.headerBtnText}>UI</Text>
              </Pressable>
            )}
            <Pressable onPress={newMission} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>NEW</Text>
            </Pressable>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={[styles.headerBtn, authHint && styles.headerBtnWarn]}
            >
              <Text
                style={[
                  styles.headerBtnText,
                  authHint && styles.headerBtnTextWarn,
                ]}
              >
                SYS
              </Text>
            </Pressable>
          </View>
        </View>

        {authHint ? (
          <Pressable
            style={styles.authBanner}
            onPress={() => setSettingsOpen(true)}
          >
            <Text style={styles.authBannerText}>
              Auth required — tap SYS and set the server / gateway token
            </Text>
          </Pressable>
        ) : null}

        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TerminalLine item={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {pendingApproval ? (
          <ApprovalBar
            name={pendingApproval.name}
            busy={busy}
            onApprove={() => onApprove(true)}
            onDeny={() => onApprove(false)}
          />
        ) : null}

        <Composer busy={busy} onSend={onSend} onCancel={cancelRun} />

        <SettingsSheet
          visible={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={async (next) => {
            const modeChanged = next.runtimeMode !== settings.runtimeMode;
            setSettings(next);
            setAuthHint(false);
            await saveSettings(next);
            if (modeChanged) {
              cancelRun();
              setSessionId(undefined);
              setPendingApproval(null);
              setItems(bootFor(next));
            }
          }}
        />

        {settings.runtimeMode === "legacy" ? (
          <SessionDrawer
            visible={sessionsOpen}
            settings={settings}
            activeSessionId={sessionId}
            onClose={() => setSessionsOpen(false)}
            onResume={(id) => {
              void resumeSession(id);
            }}
            onDeleted={(id) => {
              if (id === sessionId) newMission();
            }}
          />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "rgba(11,15,12,0.92)",
  },
  brand: {
    color: colors.brand,
    fontFamily: fonts.displayExtra,
    fontSize: 34,
    letterSpacing: 2,
    lineHeight: 36,
  },
  tag: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.brand,
    marginRight: 2,
  },
  headerBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  headerBtnWarn: {
    borderColor: colors.danger,
  },
  headerBtnText: {
    color: colors.text,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  headerBtnTextWarn: {
    color: colors.danger,
  },
  authBanner: {
    backgroundColor: "#3A1F1F",
    borderBottomWidth: 1,
    borderBottomColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  authBannerText: {
    color: colors.danger,
    fontFamily: fonts.monoMed,
    fontSize: 11,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
