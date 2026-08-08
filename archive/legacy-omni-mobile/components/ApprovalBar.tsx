import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts } from "../theme";

type Props = {
  name: string;
  onApprove: () => void;
  onDeny: () => void;
  busy?: boolean;
};

export function ApprovalBar({ name, onApprove, onDeny, busy }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>AUTHORIZATION REQUIRED // {name}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.btn, styles.deny]}
          disabled={busy}
          onPress={async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            onDeny();
          }}
        >
          <Text style={styles.denyText}>DENY</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.approve]}
          disabled={busy}
          onPress={async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            onApprove();
          }}
        >
          <Text style={styles.approveText}>APPROVE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "rgba(42, 34, 12, 0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.warn,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  label: {
    color: colors.warn,
    fontFamily: fonts.monoMed,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
  },
  deny: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: "rgba(255,92,106,0.08)",
  },
  approve: {
    backgroundColor: colors.brand,
  },
  denyText: {
    color: colors.danger,
    fontFamily: fonts.monoBold,
    letterSpacing: 1.2,
  },
  approveText: {
    color: colors.brandInk,
    fontFamily: fonts.monoBold,
    letterSpacing: 1.2,
  },
});
