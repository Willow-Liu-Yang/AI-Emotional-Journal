// app/write.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function WriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Write New Entry (Placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" },
  text: { fontSize: 18, color: "#666" },
});
