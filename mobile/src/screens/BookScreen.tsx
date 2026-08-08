import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { mockReservations } from "../lib/mockHouse";

export function BookScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Book</Text>
      <Text style={styles.sub}>Reservations for tonight</Text>
      <FlatList
        data={mockReservations}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.timeBlock}>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.status}>{item.status.replace("_", " ")}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name}>
                {item.name} · {item.party}
              </Text>
              {item.notes ? (
                <Text style={styles.notes}>{item.notes}</Text>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingTop: 20 },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
    paddingHorizontal: 24,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  row: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  timeBlock: { width: 88, gap: 4 },
  time: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  status: {
    color: colors.leafBright,
    fontFamily: fonts.body,
    fontSize: 12,
    textTransform: "capitalize",
  },
  body: { flex: 1, gap: 4 },
  name: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 17,
  },
  notes: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 14,
  },
});
