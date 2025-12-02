// app/profile/companion.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CompanionSelectScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Choose Companion (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" },
  text: { fontSize: 18, color: "#666" },
});
