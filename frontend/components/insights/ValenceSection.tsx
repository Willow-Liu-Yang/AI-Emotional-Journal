// components/insights/ValenceSection.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface TrendItem {
  date: string;
  valence: number;
}

interface Props {
  range: "week" | "month";
  trend: TrendItem[];
}

export default function ValenceSection({ range, trend }: Props) {
  if (!trend || trend.length === 0) return null;

  // ---------------------------------------------------
  // 1. X labels
  // ---------------------------------------------------
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthLabels = ["Week1", "Week2", "Week3", "Week4"];

  const labels = range === "week" ? weekLabels : monthLabels;

  // ---------------------------------------------------
  // 2. Normalize data
  // ---------------------------------------------------
  const maxVal = 4;
  const minVal = -4;

  const points = trend.map((item, idx) => ({
    x: idx,
    y: item.valence,
  }));

  // pad missing points if backend returns fewer entries
  while (points.length < labels.length) {
    points.push({ x: points.length, y: 0 });
  }

  // canvas size
  const width = 300;
  const height = 150;
  const padding = 20;

  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const stepX = usableWidth / (labels.length - 1);

  // convert value to SVG Y position
  const toSvgY = (v: number) => {
    // v = -4 → bottom, v = 4 → top
    const norm = (v - minVal) / (maxVal - minVal);
    return height - padding - norm * usableHeight;
  };

  // build smooth bezier curve path
  const buildPath = () => {
    if (points.length < 2) return "";

    const cmds: string[] = [];
    const first = points[0];
    cmds.push(`M ${padding},${toSvgY(first.y)}`);

    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const prev = points[i - 1];

      const x1 = padding + prev.x * stepX;
      const x2 = padding + curr.x * stepX;

      const y1 = toSvgY(prev.y);
      const y2 = toSvgY(curr.y);

      const cx = (x1 + x2) / 2; // midpoint for smooth curve

      cmds.push(`C ${cx},${y1} ${cx},${y2} ${x2},${y2}`);
    }

    return cmds.join(" ");
  };

  const pathD = buildPath();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Emotional Valence Trend</Text>

      {/* Positive / Negative labels */}
      <View style={styles.legendRow}>
        <Text style={styles.legendPositive}>☀ Positive</Text>
        <Text style={styles.legendNegative}>🌙 negative</Text>
      </View>

      <Svg width={width} height={height}>
        {/* gradient fill */}
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FCE8A8" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#B0C3E5" stopOpacity="0.5" />
          </LinearGradient>
        </Defs>

        {/* Soft area fill */}
        <Path
          d={`${pathD} L ${padding + (labels.length - 1) * stepX},${height - padding} 
              L ${padding},${height - padding} Z`}
          fill="url(#grad)"
          opacity={0.6}
        />

        {/* Curve line */}
        <Path
          d={pathD}
          stroke="#6B4F3A"
          strokeWidth={3}
          fill="none"
        />

        {/* Points */}
        {points.map((p, idx) => {
          const cx = padding + p.x * stepX;
          const cy = toSvgY(p.y);
          return (
            <Circle
              key={idx}
              cx={cx}
              cy={cy}
              r={5}
              fill="#F7D678"
              stroke="#6B4F3A"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>

      {/* X labels */}
      <View style={styles.labelRow}>
        {labels.map((lab, i) => (
          <Text key={i} style={styles.xLabel}>
            {lab}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ---------------------------------------------------
 * Styles
 * --------------------------------------------------- */
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
    marginBottom: 8,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  legendPositive: {
    color: "#6B4F3A",
  },
  legendNegative: {
    color: "#6B4F3A",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: 6,
  },
  xLabel: {
    fontSize: 12,
    color: "#6B4F3A",
  },
});
