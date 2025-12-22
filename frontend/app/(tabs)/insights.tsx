// app/(tabs)/insights.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { insightsApi } from "../../api/insights";

import CalendarSection from "../../components/insights/CalendarSection";
import FeelingsSection from "../../components/insights/FeelingsSection";
import NoteSection from "../../components/insights/NoteSection";
import StatsSection from "../../components/insights/StatsSection";
import ThemeSection from "../../components/insights/ThemeSection";
import ValenceSection from "../../components/insights/ValenceSection";

export default function InsightsPage() {
  const router = useRouter();
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
      console.log("Insights error:", err?.message);
      setError(err?.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range]);

  // Fallback to avoid sections not rendering when undefined/null
  const safe = data ?? {};
  const safeStats = safe.stats ?? { entries: 0, words: 0, active_days: 0 };
  const safeThemes = safe.themes ?? {};
  const safeCalendar =
    safe.calendar ?? (range === "week" ? { week: [] } : { month: [] });
  const safeEmotions = safe.emotions ?? {};
  const safeTrend = Array.isArray(safe.valence_trend) ? safe.valence_trend : [];
  const safeNoteAuthor =
    typeof safe.note_author === "string" && safe.note_author.trim().length > 0
      ? safe.note_author
      : "Companion";
  const safeNote =
    typeof safe.note === "string" && safe.note.trim().length > 0
      ? safe.note
      : `Hi, I'm ${safeNoteAuthor}. I'm here and ready to listen whenever you write your first entry.`;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A67C52" />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== Header ===== */}
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Insights</Text>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={styles.avatarButton}
            >
              <Image
                source={require("@/assets/images/profile/Profile.png")}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>

          {/* ===== This Week / This Month Toggle ===== */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                range === "week" && styles.toggleActive,
              ]}
              onPress={() => setRange("week")}
            >
              <Text
                style={[
                  styles.toggleText,
                  range === "week" && styles.toggleTextActive,
                ]}
              >
                This Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                range === "month" && styles.toggleActive,
              ]}
              onPress={() => setRange("month")}
            >
              <Text
                style={[
                  styles.toggleText,
                  range === "month" && styles.toggleTextActive,
                ]}
              >
                This Month
              </Text>
            </TouchableOpacity>
          </View>

          {/* ===== Stats ===== */}
          <StatsSection stats={safeStats} />

          {/* ===== Themes (Inner Landscape) ===== */}
          <ThemeSection themes={safeThemes} />

          {/* ===== Calendar ===== */}
          <CalendarSection range={range} calendarData={safeCalendar} />

          {/* ===== Feelings ===== */}
          <FeelingsSection emotions={safeEmotions} />

          {/* ===== Valence Trend ===== */}
          <ValenceSection range={range} trend={safeTrend} />

          {/* ===== AI Companion Note ===== */}
          <NoteSection note={safeNote} author={safeNoteAuthor} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4EBDC",
  },

  scroll: {
    flex: 1,
  },

  // Key for layout 1: spacing lives in contentContainerStyle
  content: {
    paddingHorizontal: 20,
    paddingTop: 12, // Visual spacing only, not for safe area
    paddingBottom: 18,
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#6B4F3A",
  },
  headerWrap: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  /* Toggle */
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E3D6C7",
    borderRadius: 30,
    padding: 4,
    marginBottom: 18,
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
    paddingHorizontal: 20,
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
    textAlign: "center",
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
