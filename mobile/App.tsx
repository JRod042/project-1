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
import { streamChat } from "./src/lib/api";
import { loadSettings, saveSettings } from "./src/lib/storage";
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
    text: "omni online — personal agent ready",
  },
  {
    id: "boot_2",
    kind: "assistant",
    text: "I'm Omni. Think Jarvis, but I actually run tools: research, code, shell, files, memory, multi-step missions. Tell me what to do.",
  },
];

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
  const [pendingApproval, setPendingApproval] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const listRef = useRef<FlatList<TimelineItem>>(null);
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    loadSettings().then(setSettings);
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

  const patch = useCallback((id: string, updater: (item: TimelineItem) => TimelineItem) => {
    setItems((prev) => prev.map((it) => (it.id === id ? updater(it) : it)));
  }, []);

  const run = useCallback(
    async (payload: {
      message?: string;
      approvalDecision?: { id: string; approve: boolean };
    }) => {
      if (!settings) return;
      setBusy(true);
      setPendingApproval(null);

      let assistantId: string | null = null;

      try {
        await streamChat(settings, { ...payload, sessionId }, (event) => {
          if (event.type === "session") {
            setSessionId(event.sessionId);
          } else if (event.type === "status") {
            append({ id: uid("st"), kind: "status", text: event.status });
          } else if (event.type === "text") {
            if (!assistantId) {
              assistantId = uid("as");
              append({ id: assistantId, kind: "assistant", text: event.text });
            } else {
              const id = assistantId;
              patch(id, (it) =>
                it.kind === "assistant"
                  ? { ...it, text: `${it.text}\n${event.text}` }
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
            append({
              id: uid("ap"),
              kind: "approval",
              toolId: event.id,
              name: event.name,
              args: event.arguments,
              reason: event.reason,
            });
            setPendingApproval({ id: event.id, name: event.name });
          } else if (event.type === "error") {
            append({ id: uid("err"), kind: "error", text: event.message });
          }
        });
      } catch (err) {
        append({
          id: uid("err"),
          kind: "error",
          text:
            err instanceof Error
              ? err.message
              : "Failed to reach Omni server. Open Systems and set your LAN URL + API key.",
        });
      } finally {
        setBusy(false);
        requestAnimationFrame(() =>
          listRef.current?.scrollToEnd({ animated: true })
        );
      }
    },
    [append, patch, sessionId, settings]
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
    setSessionId(undefined);
    setPendingApproval(null);
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
            <Text style={styles.tag}>personal agent · always on</Text>
          </View>
          <View style={styles.headerRight}>
            <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
            <Pressable onPress={newMission} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>NEW</Text>
            </Pressable>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>SYS</Text>
            </Pressable>
          </View>
        </View>

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

        <Composer busy={busy} onSend={onSend} />

        <SettingsSheet
          visible={settingsOpen}
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={async (next) => {
            setSettings(next);
            await saveSettings(next);
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
  headerBtnText: {
    color: colors.text,
    fontFamily: fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
});
