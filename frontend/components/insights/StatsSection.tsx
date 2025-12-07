// components/insights/StatsSection.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatsSection({ stats }: { stats: any }) {
  return (
    <View style={styles.container}>
      {/* Entries */}
      <View style={styles.card}>
        <Text style={styles.number}>{stats.entries ?? 0}</Text>
        <Text style={styles.label}>Journal entries</Text>
      </View>

      {/* Words */}
      <View style={styles.card}>
        <Text style={styles.number}>{stats.words ?? 0}</Text>
        <Text style={styles.label}>Words written</Text>
      </View>

      {/* Active Days */}
      <View style={styles.card}>
        <Text style={styles.number}>{stats.active_days ?? 0}</Text>
        <Text style={styles.label}>Days active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    width: "32%",
    backgroundColor: "#EFE5D6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  number: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6B4F3A",
  },

  label: {
    fontSize: 13,
    marginTop: 4,
    color: "#6B4F3A",
  },
});
