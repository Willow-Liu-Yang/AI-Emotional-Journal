// app/(tabs)/insights.tsx

import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { insightsApi } from "../../api/insights";


import CalendarSection from "../../components/insights/CalendarSection";
import FeelingsSection from "../../components/insights/FeelingsSection";
import NoteSection from "../../components/insights/NoteSection";
import StatsSection from "../../components/insights/StatsSection";
import ThemeSection from "../../components/insights/ThemeSection";
import ValenceSection from "../../components/insights/ValenceSection";

export default function InsightsPage() {
  const [range, setRange] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await insightsApi.getInsights(range);
      setData(res);
    } catch (err: any) {
      console.log("Insights error:", err.message);
      setError(err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A67C52" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== 顶部标题 ===== */}
      <Text style={styles.title}>Insights</Text>

      {/* ===== This Week / This Month Toggle ===== */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, range === "week" && styles.toggleActive]}
          onPress={() => setRange("week")}
        >
          <Text style={[styles.toggleText, range === "week" && styles.toggleTextActive]}>
            This Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, range === "month" && styles.toggleActive]}
          onPress={() => setRange("month")}
        >
          <Text style={[styles.toggleText, range === "month" && styles.toggleTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== Stats ===== */}
      <StatsSection stats={data.stats} />

      {/* ===== Themes (Inner Landscape) ===== */}
      <ThemeSection themes={data.themes} />

      {/* ===== Calendar ===== */}
      <CalendarSection
        range={range}
        calendarData={data.calendar}
      />
      <FeelingsSection emotions={data.emotions} />

      <ValenceSection range={range} trend={data.valence_trend} />



      

      {/* ===== AI Companion Note ===== */}
      <NoteSection note={data.note} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EBDC",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#6B4F3A",
    marginBottom: 20,
  },

  /* Toggle */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E3D6C7",
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
  },
  toggleActive: {
    backgroundColor: "#7FAF86",
  },
  toggleText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B4F3A",
  },
  toggleTextActive: {
    color: "white",
    fontWeight: "600",
  },

  /* Loading / Error */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4EBDC",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B4F3A",
  },
  errorText: {
    fontSize: 16,
    color: "#B33A3A",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#A67C52",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: "white",
  },
});
