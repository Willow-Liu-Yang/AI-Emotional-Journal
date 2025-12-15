// components/insights/StatsSection.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatsSection({ stats }: { stats: any }) {
  const items = [
    { value: stats?.entries ?? 0, label: "Journal entries" },
    { value: stats?.words ?? 0, label: "Words written" },
    { value: stats?.active_days ?? 0, label: "Days active" },
  ];

  return (
    <View style={styles.container}>
      {items.map((it, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.number}>{it.value}</Text>

          <View style={styles.labelWrap}>
            <Text style={styles.label} numberOfLines={2}>
              {it.label}
            </Text>
          </View>
        </View>
      ))}
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
    backgroundColor: "#FFF6EA", // ✅ 跟 CalendarSection card 一致
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  number: {
    fontSize: 26,
    fontWeight: "700",
    color: "#6B4F3A",
    lineHeight: 30,
    textAlign: "center",
  },

  labelWrap: {
    marginTop: 6,
    minHeight: 34,
    justifyContent: "center",
    paddingBottom: 2,
  },

  label: {
    fontSize: 13,
    color: "#6B4F3A",
    textAlign: "center",
    lineHeight: 16,
  },
});
