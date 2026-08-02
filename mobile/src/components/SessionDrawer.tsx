import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts } from "../theme";
import type { AppSettings, SessionSummary } from "../types";
import { ApiError, deleteSession, listSessions } from "../lib/api";

type Props = {
  visible: boolean;
  settings: AppSettings;
  activeSessionId?: string;
  onClose: () => void;
  onResume: (sessionId: string) => void;
  onDeleted: (sessionId: string) => void;
};

function fmt(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function SessionDrawer({
  visible,
  settings,
  activeSessionId,
  onClose,
  onResume,
  onDeleted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      setSessions(await listSessions(settings));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Auth required — set Server token in Systems.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) void refresh();
  }, [visible, settings.serverUrl, settings.serverToken]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Sessions</Text>
            <View style={styles.headerActions}>
              <Pressable onPress={() => void refresh()}>
                <Text style={styles.action}>REFRESH</Text>
              </Pressable>
              <Pressable onPress={onClose}>
                <Text style={styles.action}>CLOSE</Text>
              </Pressable>
            </View>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.brand} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.body}>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {!error && !sessions.length ? (
                <Text style={styles.empty}>No saved sessions yet.</Text>
              ) : null}
              {sessions.map((s) => {
                const active = s.id === activeSessionId;
                return (
                  <View
                    key={s.id}
                    style={[styles.row, active && styles.rowActive]}
                  >
                    <Pressable
                      style={styles.rowMain}
                      onPress={() => {
                        onResume(s.id);
                        onClose();
                      }}
                    >
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {s.title || "Untitled"}
                      </Text>
                      <Text style={styles.rowMeta}>
                        {s.messageCount} msgs · {fmt(s.updatedAt)}
                        {s.pendingApproval ? " · approval pending" : ""}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={async () => {
                        try {
                          await deleteSession(settings, s.id);
                          setSessions((prev) =>
                            prev.filter((x) => x.id !== s.id)
                          );
                          onDeleted(s.id);
                        } catch (err) {
                          setError(
                            err instanceof Error ? err.message : "Delete failed"
                          );
                        }
                      }}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteText}>DEL</Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          )}
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
    maxHeight: "88%",
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderColor: colors.line,
    minHeight: 280,
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
  headerActions: { flexDirection: "row", gap: 16 },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
  },
  action: {
    color: colors.brand,
    fontFamily: fonts.monoBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  body: { padding: 16, gap: 10, paddingBottom: 28 },
  center: { padding: 40, alignItems: "center" },
  empty: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.mono,
    fontSize: 12,
    marginBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
  },
  rowActive: {
    borderColor: colors.brand,
    backgroundColor: "rgba(184,255,61,0.08)",
  },
  rowMain: { flex: 1, padding: 12, gap: 4 },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.monoMed,
    fontSize: 13,
  },
  rowMeta: {
    color: colors.textMuted,
    fontFamily: fonts.mono,
    fontSize: 10,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderLeftWidth: 1,
    borderLeftColor: colors.line,
  },
  deleteText: {
    color: colors.danger,
    fontFamily: fonts.monoBold,
    fontSize: 11,
  },
});
