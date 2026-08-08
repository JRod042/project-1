import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { mockMenu, mockTickets } from "../lib/mockHouse";

export function FloorScreen() {
  const eightySixed = mockMenu.filter((m) => m.eightySixed);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Floor</Text>
      <Text style={styles.sub}>Tickets & 86 board</Text>

      <Text style={styles.section}>Open tickets</Text>
      {mockTickets.map((t) => (
        <View key={t.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            Table {t.table} · {t.status}
          </Text>
          <Text style={styles.cardBody}>{t.items.join(" · ")}</Text>
        </View>
      ))}

      <Text style={[styles.section, { marginTop: 22 }]}>86</Text>
      {eightySixed.length === 0 ? (
        <Text style={styles.empty}>Nothing 86’d</Text>
      ) : (
        eightySixed.map((m) => (
          <Text key={m.id} style={styles.eighty}>
            {m.name}
          </Text>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.linen,
    fontFamily: fonts.display,
    fontSize: 32,
  },
  sub: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 18,
  },
  section: {
    color: colors.leafBright,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardTitle: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    textTransform: "capitalize",
  },
  cardBody: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  empty: { color: colors.linenDim, fontFamily: fonts.body },
  eighty: {
    color: colors.danger,
    fontFamily: fonts.bodyMed,
    fontSize: 16,
    marginBottom: 6,
  },
});
