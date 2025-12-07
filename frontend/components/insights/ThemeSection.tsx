// components/insights/ThemeSection.tsx

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function ThemeSection({ themes }: { themes: Record<string, number> }) {
  if (!themes || Object.keys(themes).length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Inner Landscape</Text>

      {/* Illustration */}
      <Image
        source={require("../../assets/images/insights/landscape_transparent 1.png")} 
        style={styles.illustration}
        resizeMode="contain"
      />

      {/* Theme list (3 items) */}
      <View style={styles.themeRow}>
        {Object.entries(themes).map(([key, value]) => (
          <View key={key} style={styles.themeItem}>
            {getThemeIcon(key)}
            <Text style={styles.themeLabel}>{capitalize(key)}</Text>
            <Text style={styles.themeValue}>{Math.round(value * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* Helper: display icons for each theme */
function getThemeIcon(key: string) {
  switch (key) {
    case "work":
      return <Text style={styles.icon}>💼</Text>;
    case "hobbies":
      return <Text style={styles.icon}>🌱</Text>;
    case "social":
      return <Text style={styles.icon}>🌸</Text>;
    default:
      return <Text style={styles.icon}>✨</Text>;
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF6EA",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B4F3A",
    marginBottom: 10,
  },

  illustration: {
    width: "100%",
    height: 160,
    marginBottom: 10,
  },

  themeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  themeItem: {
    alignItems: "center",
  },

  icon: {
    fontSize: 24,
    marginBottom: 4,
  },

  themeLabel: {
    fontSize: 14,
    color: "#6B4F3A",
  },

  themeValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    color: "#6B4F3A",
  },
});
