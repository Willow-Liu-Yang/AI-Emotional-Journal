// components/insights/NoteSection.tsx

import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function NoteSection({ note }: { note: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/insights/note.png")}
          style={styles.icon}
        />

        <Text style={styles.noteText}>{note}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8E8",
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  content: {
    alignItems: "center",
  },

  icon: {
    width: 48,
    height: 48,
    marginBottom: 12,
    borderRadius: 24,
  },

  noteText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B4F3A",
    textAlign: "left",
    alignSelf: "stretch",
  },
});
