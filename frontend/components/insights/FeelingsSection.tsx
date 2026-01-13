// components/insights/FeelingsSection.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type EmotionMap = Record<string, number>;

interface Props {
  emotions: EmotionMap;
}

export default function FeelingsSection({ emotions }: Props) {
  if (!emotions || Object.keys(emotions).length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Top Feelings</Text>
        <View style={styles.emptyRow}>
          <Image
            source={require("../../assets/images/insights/topfeelings_empty.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyHint}>
            Write an entry to see your emotions.
          </Text>
        </View>
      </View>
    );
  }

  const total = Object.values(emotions).reduce((a, b) => a + b, 0) || 1;

  // colors (tuned sadness to be more bluish)
  const COLORS: Record<string, string> = {
    joy: "#EEC373",      // warm yellow
    calm: "#C7D8C5",     // soft green
    anxiety: "#9FA4AF",  // grayish
    sadness: "#A3B6D6",  // bluish (was too gray previously)
    anger: "#D28A7C",
    tired: "#CDBBA7",
  };

  // donut chart params
  const size = 140;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // We'll iterate entries in a stable order: sort by count desc to make large arcs first (optional)
  const entries = Object.entries(emotions)
    .filter(([_, count]) => count > 0) // Filter out emotions with count 0
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Top Feelings</Text>
        <View style={styles.emptyRow}>
          <Image
            source={require("../../assets/images/insights/topfeelings_empty.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyHint}>
            Write an entry to see your emotions.
          </Text>
        </View>
      </View>
    );
  }

  // cumulative fraction tracker
  let cumulative = 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Top Feelings</Text>

      <View style={styles.container}>
        <Svg width={size} height={size}>
          {/* base circle as faint background */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#EFE8DD"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* draw slices: each slice uses strokeDasharray and strokeDashoffset.
              strokeDashoffset is computed from cumulative fraction so slices are placed consecutively. */}
          {entries.map(([emotion, count]) => {
            const pct = (count || 0) / total;
            const arcLength = pct * circumference;

            // strokeDasharray: draw arcLength then gap
            const dashArray = `${arcLength} ${circumference - arcLength}`;

            // strokeDashoffset: place the arc so its end aligns with cumulative position
            // We compute offset as circumference * (1 - cumulative - pct)
            // but using cumulative BEFORE adding current pct places the current arc after previous arcs.
            const offset = circumference * (1 - cumulative - pct);

            const circle = (
              <Circle
                key={emotion}
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS[emotion] ?? "#ccc"}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={offset}
                strokeLinecap="butt" // avoid visible gaps between arcs; change to "round" if you want rounded ends and handle overlap
                fill="transparent"
                rotation="-90"
                origin={`${center}, ${center}`}
              />
            );

            cumulative += pct;
            return circle;
          })}
        </Svg>

        {/* Right side legend */}
        <View style={styles.listContainer}>
          {entries.map(([emotion, count]) => {
            const pct = (count || 0) / total;
            return (
              <Text key={emotion} style={styles.listItem}>
                <Text style={{ color: COLORS[emotion] ?? "#666" }}>● </Text>
                {capitalize(emotion)} ({Math.round(pct * 100)}%)
              </Text>
            );
          })}
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
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyHint: {
    flex: 1,
    textAlign: "left",
    color: "#6B4F3A",
    fontSize: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B4F3A",
    marginBottom: 12,
    textAlign: "center",
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
