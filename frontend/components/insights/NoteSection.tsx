// components/insights/NoteSection.tsx

import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";

export default function NoteSection({
  note,
  author,
}: {
  note: string;
  author: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI Companion Note</Text>
      <View style={styles.content}>
        <Image
          source={require("../../assets/images/insights/note.png")}
          style={styles.noteBg}
        />

        <Text style={styles.noteText}>{`"${note}"`}</Text>
        <Text style={styles.signature}>{`- ${author}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF8E8",
    padding: 18,
    borderRadius: 18,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B4F3A",
    marginBottom: 12,
    textAlign: "center",
  },

  content: {
    position: "relative",
    alignItems: "center",
    paddingTop: 8,
  },

  noteBg: {
    position: "absolute",
    top: -2,
    left: "50%",
    width: 140,
    height: 140,
    opacity: 0.12,
    transform: [{ translateX: -70 }],
  },

  noteText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B4F3A",
    textAlign: "left",
    alignSelf: "stretch",
    fontFamily: Platform.select({
      ios: "Bradley Hand",
      android: "cursive",
      default: "serif",
    }),
  },
  signature: {
    alignSelf: "flex-end",
    marginTop: 8,
    color: "#6B4F3A",
    fontSize: 14,
    fontFamily: Platform.select({
      ios: "Bradley Hand",
      android: "cursive",
      default: "serif",
    }),
  },
});
