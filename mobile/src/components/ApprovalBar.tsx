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
      <Text style={styles.label}>Authorize {name}?</Text>
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
    backgroundColor: "#2A2110",
    borderTopWidth: 1,
    borderTopColor: colors.warn,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  label: {
    color: colors.warn,
    fontFamily: fonts.monoMed,
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  deny: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  approve: {
    backgroundColor: colors.brand,
  },
  denyText: {
    color: colors.danger,
    fontFamily: fonts.monoBold,
    letterSpacing: 1,
  },
  approveText: {
    color: "#0B0F0C",
    fontFamily: fonts.monoBold,
    letterSpacing: 1,
  },
});
