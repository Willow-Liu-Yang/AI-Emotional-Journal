// app/(tabs)/journal.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { entriesApi } from "@/api/entries";
import { timeCapsuleApi, TimeCapsule } from "@/api/timeCapsule";

// Emotion -> color mapping
const EMOTION_COLORS: Record<string, string> = {
  joy: "#F4D98E",
  calm: "#8CB89F",
  tired: "#C2A37A",
  anxiety: "#8E919F",
  sadness: "#607D96",
  anger: "#C66C5E",
};

// Filter entries by month (year+month)
function filterEntriesByMonth(allEntries: any[], monthStr: string) {
  if (!monthStr) return [];
  const [y, m] = monthStr.split("-");
  const year = Number(y);
  const monthInt = Number(m); // 1-12

  return allEntries.filter((e) => {
    const d = new Date(e.created_at);
    return d.getFullYear() === year && d.getMonth() + 1 === monthInt;
  });
}

export default function JournalListPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showHelp, setShowHelp] = useState(false); // Help popup
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [capsuleLoading, setCapsuleLoading] = useState(false);

  // Refresh on focus (initial load and return from write)
  useFocusEffect(
    useCallback(() => {
      loadAllMonths();
      loadTimeCapsule();
    }, [])
  );

  // Load all entries -> extract months and set default current month list
  async function loadAllMonths() {
    setLoading(true);
    try {
      const all = await entriesApi.getAll(); // No date -> return all entries

      const months = extractMonths(all);
      setAllMonths(months);

      if (months.length > 0) {
        const defaultMonth = months[0]; // Most recent month
        setCurrentMonth(defaultMonth);

        // Keep only entries from this month
        const filtered = filterEntriesByMonth(all, defaultMonth);
        setEntries(filtered);
      } else {
        setCurrentMonth("");
        setEntries([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  // When user picks a month: refresh only that month
  async function handleSelectMonth(m: string) {
    setShowMonthSelector(false);
    setCurrentMonth(m);

    try {
      const res = await entriesApi.getAll({ date: m });
      setEntries(res);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadTimeCapsule() {
    setCapsuleLoading(true);
    try {
      const res = await timeCapsuleApi.getTodayCached();
      setCapsule(res);
    } catch (err) {
      console.log(err);
    } finally {
      setCapsuleLoading(false);
    }
  }

  // Generate months that have content
  function extractMonths(allEntries: any[]): string[] {
    const set = new Set<string>();

    allEntries.forEach((e) => {
      const d = new Date(e.created_at);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      set.add(m);
    });

    // Sort by date descending
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1));
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color="#6A4B3C" />
      </SafeAreaView>
    );
  }

  const canOpenCapsule = Boolean(capsule?.found && capsule?.entry_id);

  function handleOpenCapsule() {
    if (!canOpenCapsule || !capsule?.entry_id) return;
    router.push(`/entries/${capsule.entry_id}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      {showMonthSelector && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMonthSelector(false)}
          style={styles.dropdownOverlay}
        />
      )}
      {/* Header */}
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Journal List</Text>

        {/* Top-right avatar (same as home) */}
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={require("@/assets/images/profile/Profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Time capsule card: left illustration + text + top-right question */}
      <View style={styles.capsule}>
        {/* Main content: illustration + text */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenCapsule}
          disabled={!canOpenCapsule}
          style={styles.capsuleMainRow}
        >
          <Image
            source={
              capsule?.found
                ? require("@/assets/images/capsule/capsule_filled.png")
                : require("@/assets/images/capsule/capsule_empty.png")
            }
            style={styles.capsuleImage}
            resizeMode="contain"
          />
          <View style={styles.capsuleTextWrap}>
            <Text style={styles.capsuleTitle}>
              {capsule?.found ? "Time Capsule" : "Empty Capsule"}
            </Text>
            {capsule?.found && capsule?.source_date && (
              <Text style={styles.capsuleDate}>
                From {formatCapsuleDate(capsule.source_date)}
              </Text>
            )}
            <Text style={styles.capsuleBody}>
              {capsuleLoading
                ? "Loading your time capsule..."
                : capsule?.found
                  ? capsule?.quote || "A special moment from your past."
                  : "Your time capsule is waiting to be filled."}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top-right question mark (floats, not covering text) */}
        <TouchableOpacity
          onPress={() => setShowHelp(true)}
          activeOpacity={0.8}
          style={styles.capsuleHelpButton}
        >
          <Image
            source={require("@/assets/images/icons/help.png")}
            style={styles.capsuleHelpIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Month selector + floating dropdown */}
      <View style={styles.monthWrapper}>
        <TouchableOpacity
          onPress={() => setShowMonthSelector(!showMonthSelector)}
          style={styles.monthRow}
        >
          <Text style={styles.monthText}>
            {currentMonth ? toLongMonth(currentMonth) : "NO ENTRIES YET"}
          </Text>
          {currentMonth !== "" && <Text style={styles.arrow}>▼</Text>}
        </TouchableOpacity>

        {showMonthSelector && currentMonth && (
          <View style={styles.dropdown}>
            {allMonths.map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => handleSelectMonth(m)}
                style={styles.monthItem}
              >
                <Text style={styles.monthItemText}>{toLongMonth(m)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Journal List */}
      <ScrollView style={{ flex: 1 }}>
        {entries.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </ScrollView>

      {/* Help popup: centered card with question icon + text */}
      {showHelp && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowHelp(false)}
          style={styles.popupOverlay}
        >
          <View style={styles.popupCard}>
            <View style={styles.popupRow}>
              <Image
                source={require("@/assets/images/icons/help.png")}
                style={styles.popupIcon}
                resizeMode="contain"
              />
              <Text style={styles.popupText}>
                Revisit a past moment to see your growth and reflect on your
                journey.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/** ---- Journal Card ---- **/
function JournalCard({ entry }: any) {
  const router = useRouter(); // Use useRouter in child component too

  const dateObj = new Date(entry.created_at);
  const day = dateObj.getDate();
  const weekday = dateObj
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();

  // Normalize emotion to lowercase before color lookup
  const emotionKey = (entry.emotion || "").toLowerCase();
  const emotionColor = EMOTION_COLORS[emotionKey] || "#D8CABC"; // Default soft beige

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/entries/${entry.id}`)}   // Go to detail page
    >
      {/* Date block */}
      <View style={styles.dateBox}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.week}>{weekday}</Text>
      </View>

      {/* Middle vertical line (slightly left) */}
      <View style={styles.cardDivider} />

      {/* Summary text: max 3 lines, RN adds ellipsis */}
      <Text numberOfLines={3} ellipsizeMode="tail" style={styles.summary}>
        {entry.summary}
      </Text>

      {/* Emotion dot */}
      <View style={[styles.emotionDot, { backgroundColor: emotionColor }]} />
    </TouchableOpacity>
  );
}

/** ---- Month Helper ---- **/
function toLongMonth(str: string) {
  const [y, m] = str.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
}

function formatCapsuleDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** ---- Styles ---- **/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F7F1E8",
  },

  headerWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  header: {
    fontSize: 30,
    fontWeight: "600",
    color: "#6A4B3C",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  /* Time capsule card */
  capsule: {
    position: "relative",
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#FFF9E9",
    marginBottom: 20,
  },
  capsuleMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  capsuleImage: {
    width: 70,
    height: 70,
  },
  capsuleTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  capsuleTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6A4B3C",
    marginBottom: 4,
  },
  capsuleDate: {
    fontSize: 12,
    color: "#8A6B5B",
    marginBottom: 6,
  },
  capsuleBody: {
    fontSize: 14,
    color: "#6A4B3C",
    lineHeight: 20,
  },
  capsuleHelpButton: {
    position: "absolute",
    top: 10,
    right: 14,
    padding: 4,
  },
  capsuleHelpIcon: {
    width: 32,
    height: 32,
  },

  /* Pop-up */
  popupOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  popupCard: {
    alignSelf: "stretch",
    marginHorizontal: 26,
    backgroundColor: "#FFF9E9",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  popupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  popupIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  popupText: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 21,
    color: "#6A4B3C",
  },

  /* Month Selector */
  monthWrapper: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 10,
    position: "relative",
    zIndex: 2,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F0E4D4",
  },
  monthText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginRight: 6,
    color: "#6A4B3C",
  },
  arrow: {
    fontSize: 12,
    color: "#6A4B3C",
    marginTop: 1,
  },

  dropdown: {
    position: "absolute",
    top: 40,
    left: 0,
    minWidth: 200,
    backgroundColor: "#FFF9E9",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    zIndex: 10,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  monthItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  monthItemText: {
    fontSize: 15,
    color: "#6A4B3C",
  },

  /* Journal Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dateBox: {
    width: 60,
    alignItems: "center",
    marginRight: 4,
  },
  day: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A4B3C",
  },
  week: {
    fontSize: 11,
    opacity: 0.7,
    color: "#6A4B3C",
  },

  cardDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#D8CABC",
    marginRight: 10,
    marginLeft: 2,
    borderRadius: 1,
  },

  summary: {
    flex: 1,
    fontSize: 14,
    color: "#6A4B3C",
  },
  emotionDot: {
    width: 20,
    height: 20,
    borderRadius: 20,
    marginLeft: 10,
  },
});

export {};
