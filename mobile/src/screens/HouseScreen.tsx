import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { mockMenu, mockStaff } from "../lib/mockHouse";

export function HouseScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>House</Text>
      <Text style={styles.sub}>Menu & staff tonight</Text>

      <Text style={styles.section}>Menu</Text>
      <FlatList
        data={mockMenu}
        keyExtractor={(m) => m.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.category}
                {item.eightySixed ? " · 86" : ""}
              </Text>
            </View>
            <Text style={styles.price}>${item.price}</Text>
          </View>
        )}
      />

      <Text style={[styles.section, { marginTop: 20 }]}>Staff</Text>
      {mockStaff.map((s) => (
        <Text key={s.id} style={styles.staff}>
          {s.name} · {s.role} · {s.when}
        </Text>
      ))}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    gap: 12,
  },
  name: {
    color: colors.linen,
    fontFamily: fonts.bodyMed,
    fontSize: 16,
  },
  meta: {
    color: colors.linenDim,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    color: colors.brass,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  staff: {
    color: colors.linen,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 8,
  },
});
