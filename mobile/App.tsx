import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Atmosphere } from "./src/components/Atmosphere";
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
import {
  isLoopbackServerUrl,
  loadSettings,
  saveSettings,
} from "./src/lib/storage";
import { colors, fonts } from "./src/theme";
import type { AppSettings, TimelineItem } from "./src/types";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const BOOT: TimelineItem[] = [
  {
    id: "boot_1",
    kind: "status",
    text: "uplink established — operator ready",
  },
  {
    id: "boot_2",
    kind: "assistant",
    text: "Omni online. I plan, research, write, run shell, and finish missions. Issue a command.",
  },
];

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
  const [items, setItems] = useState<TimelineItem[]>(BOOT);
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
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0.3,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.35,
            duration: 1100,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1100,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, pulseScale]);

  const append = useCallback((item: TimelineItem) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const patch = useCallback(
    (id: string, updater: (item: TimelineItem) => TimelineItem) => {
      setItems((prev) => prev.map((it) => (it.id === id ? updater(it) : it)));
    },
    []
  );

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
          const target = settings.serverUrl;
          const loopback = isLoopbackServerUrl(target);
          append({
            id: uid("err"),
            kind: "error",
            text: loopback
              ? `Cannot reach agent at ${target} — that's this iPad. SYS → set http://YOUR_COMPUTER_LAN_IP:8787 (or tunnel) → TEST LINK → SAVE. Server must be running.`
              : err instanceof Error
                ? err.message
                : `Failed to reach Omni server at ${target}. Open SYS, TEST LINK, fix URL.`,
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
        <Atmosphere />
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>OMNI</Text>
            <Text style={styles.tag}>OPERATOR LINK · ALWAYS ON</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.liveWrap}>
              <Animated.View
                style={[
                  styles.liveRing,
                  { opacity: pulse, transform: [{ scale: pulseScale }] },
                ]}
              />
              <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
            </View>
            <Pressable onPress={() => setSessionsOpen(true)} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>LOG</Text>
            </Pressable>
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
              Auth required — tap to set Server token (OMNI_SERVER_TOKEN)
            </Text>
          </Pressable>
        ) : null}

        {settings && isLoopbackServerUrl(settings.serverUrl) ? (
          <Pressable
            style={styles.connectBanner}
            onPress={() => setSettingsOpen(true)}
          >
            <Text style={styles.connectBannerText}>
              Agent URL is localhost — tap SYS and set your computer LAN IP or
              tunnel (TestFlight cannot use 127.0.0.1)
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
            setSettings(next);
            setAuthHint(false);
            await saveSettings(next);
          }}
        />

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
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineBright,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: colors.bgGlass,
  },
  brandBlock: {
    gap: 4,
  },
  brand: {
    color: colors.brand,
    fontFamily: fonts.displayExtra,
    fontSize: 40,
    letterSpacing: 4,
    lineHeight: 42,
  },
  tag: {
    color: colors.accent,
    fontFamily: fonts.monoMed,
    fontSize: 10,
    letterSpacing: 1.6,
    opacity: 0.85,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  liveRing: {
    position: "absolute",
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  liveDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.brand,
  },
  headerBtn: {
    borderWidth: 1,
    borderColor: colors.lineBright,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(16,24,32,0.65)",
  },
  headerBtnWarn: {
    borderColor: colors.danger,
  },
  headerBtnText: {
    color: colors.text,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  headerBtnTextWarn: {
    color: colors.danger,
  },
  authBanner: {
    backgroundColor: "rgba(58,31,31,0.95)",
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
  connectBanner: {
    backgroundColor: "rgba(42,36,16,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: colors.warn,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  connectBannerText: {
    color: colors.warn,
    fontFamily: fonts.monoMed,
    fontSize: 11,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },
});
