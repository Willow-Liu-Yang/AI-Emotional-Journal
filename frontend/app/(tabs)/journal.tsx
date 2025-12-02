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

// Emotion → Color 映射
const EMOTION_COLORS: Record<string, string> = {
  joy: "#F4D98E",
  calm: "#8CB89F",
  tired: "#C2A37A",
  anxiety: "#8E919F",
  sadness: "#607D96",
  anger: "#C66C5E",
};

// 按月过滤 entries（用年+月）
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
  const [showHelp, setShowHelp] = useState(false); // 问号弹窗

  // 🔁 每次页面获得焦点时刷新（包括第一次进入和从写日记返回）
  useFocusEffect(
    useCallback(() => {
      loadAllMonths();
    }, [])
  );

  // 加载全部 entries → 提取月份 & 设置“默认当前月”的列表
  async function loadAllMonths() {
    setLoading(true);
    try {
      const all = await entriesApi.getAll(); // 不加 date → 返回所有 entries

      const months = extractMonths(all);
      setAllMonths(months);

      if (months.length > 0) {
        const defaultMonth = months[0]; // 最近一个月
        setCurrentMonth(defaultMonth);

        // 只保留这个月的 entries
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

  // 用户在下拉里选择月份时：只刷新这个月
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

  // 从所有日记中生成“有内容的月份”
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

    // 按日期从新到旧排序
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Text style={styles.header}>Journal List</Text>

        {/* 右上角头像（和首页一致） */}
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={require("@/assets/images/profile/Profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* 时间胶囊卡片：左插画 + 文案 + 右上问号 */}
      <View style={styles.capsule}>
        {/* 主内容：插画 + 文案 */}
        <View style={styles.capsuleMainRow}>
          <Image
            source={require("@/assets/images/capsule/capsule_empty.png")}
            style={styles.capsuleImage}
            resizeMode="contain"
          />
          <View style={styles.capsuleTextWrap}>
            <Text style={styles.capsuleTitle}>Empty Capsule</Text>
            <Text style={styles.capsuleBody}>
              Your time capsule is waiting to be filled.
            </Text>
          </View>
        </View>

        {/* 右上角问号（悬在角上，不挡下面文字） */}
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

      {/* 月份选择 + 悬浮下拉 */}
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

      {/* 问号弹出的 pop-up：居中小卡片，左问号 + 右文字 */}
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

/** ---- Journal Card（日记卡片） ---- **/
function JournalCard({ entry }: any) {
  const dateObj = new Date(entry.created_at);
  const day = dateObj.getDate();
  const weekday = dateObj
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();

  // 把 emotion 统一转成小写再查颜色
  const emotionKey = (entry.emotion || "").toLowerCase();
  const emotionColor = EMOTION_COLORS[emotionKey] || "#D8CABC"; // 默认一个柔和米色

  return (
    <TouchableOpacity style={styles.card}>
      {/* 日期块 */}
      <View style={styles.dateBox}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.week}>{weekday}</Text>
      </View>

      {/* 中间那根小竖线（稍微靠左） */}
      <View style={styles.cardDivider} />

      {/* 摘要文字：最多 3 行，让 RN 自己尾部加 ... */}
      <Text numberOfLines={3} ellipsizeMode="tail" style={styles.summary}>
        {entry.summary}
      </Text>

      {/* 情绪小圆点 */}
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

  /* 时间胶囊卡片 */
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
