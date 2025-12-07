// components/insights/FeelingsSection.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type EmotionMap = Record<string, number>;

interface Props {
  emotions: EmotionMap;
}

export default function FeelingsSection({ emotions }: Props) {
  if (!emotions || Object.keys(emotions).length === 0) return null;

  const total = Object.values(emotions).reduce((a, b) => a + b, 0) || 1;

  // fixed color scheme matching UI
  const COLORS: Record<string, string> = {
    joy: "#EEC373",
    calm: "#C7D8C5",
    anxiety: "#9FA4AF",
    sadness: "#A8B8D0",
    anger: "#D28A7C",
    tired: "#CDBBA7",
  };

  // donut chart setup
  const size = 160;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetStart = 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Feelings</Text>

      <View style={styles.container}>
        {/* Donut Chart */}
        <Svg width={size} height={size}>
          {Object.entries(emotions).map(([emotion, count], index) => {
            const pct = count / total;
            const strokeDashoffset = circumference * (1 - pct);
            const circle = (
              <Circle
                key={emotion}
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS[emotion] ?? "#ccc"}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={circumference - offsetStart * circumference}
                strokeLinecap="round"
                fill="transparent"
                rotation={-90}
                origin={`${center}, ${center}`}
              />
            );
            offsetStart += pct;
            return circle;
          })}
        </Svg>

        {/* Right Side Emotion List */}
        <View style={styles.listContainer}>
          {Object.entries(emotions)
            .sort((a, b) => b[1] - a[1])
            .map(([emotion, count]) => (
              <Text key={emotion} style={styles.listItem}>
                <Text style={{ color: COLORS[emotion] ?? "#666" }}>
                  ●{" "}
                </Text>
                {capitalize(emotion)} ({Math.round((count / total) * 100)}%)
              </Text>
            ))}
        </View>
      </View>
    </View>
  );
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
    marginBottom: 12,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContainer: {
    marginLeft: 20,
    flex: 1,
  },
  listItem: {
    fontSize: 15,
    color: "#6B4F3A",
    marginBottom: 6,
  },
});
