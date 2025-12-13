// components/insights/ThemeSection.tsx

import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ThemesInput = Partial<Record<"job" | "hobbies" | "social" | "other", number>>;

type LandscapeVariant =
  | "balanced"
  | "work_dominant"
  | "hobbies_dominant"
  | "social_dominant"
  | "work_hobbies"
  | "work_social"
  | "hobbies_social"
  | "other_dominant";

/**
 * 占位图策略：
 * 你补齐图片后，把 require 改成对应文件名即可。
 */


const LANDSCAPE_IMAGES: Record<LandscapeVariant, any> = {
  balanced: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  work_dominant: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  hobbies_dominant: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  social_dominant: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  work_hobbies: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  work_social: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  hobbies_social: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
  other_dominant: require("../../assets/images/insights/landscape/landscape_transparent 1.png"),
};

const EMPTY_STATE_IMAGE = require("../../assets/images/insights/landscape_empty_state.png");

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeThemes(input: ThemesInput | null | undefined) {
  const job = clamp01(input?.job ?? 0);
  const hobbies = clamp01(input?.hobbies ?? 0);
  const social = clamp01(input?.social ?? 0);
  const otherFromServer = clamp01(input?.other ?? 0);

  const sum3 = job + hobbies + social;
  const other = input?.other == null ? clamp01(1 - sum3) : otherFromServer;

  const total = job + hobbies + social + other;
  if (total <= 0) {
    return { job: 0, hobbies: 0, social: 0, other: 0 };
  }

  return {
    job: job / total,
    hobbies: hobbies / total,
    social: social / total,
    other: other / total,
  };
}

function pickLandscapeVariant(t: { job: number; hobbies: number; social: number; other: number }): LandscapeVariant {
  if (t.other >= 0.6) return "other_dominant";

  const three = [
    { k: "job" as const, v: t.job },
    { k: "hobbies" as const, v: t.hobbies },
    { k: "social" as const, v: t.social },
  ].sort((a, b) => b.v - a.v);

  const top = three[0];
  const second = three[1];

  if (top.v < 0.2) return "other_dominant";

  if (top.v >= 0.5 && top.v - second.v >= 0.15) {
    if (top.k === "job") return "work_dominant";
    if (top.k === "hobbies") return "hobbies_dominant";
    return "social_dominant";
  }

  if (top.v + second.v >= 0.75 && Math.abs(top.v - second.v) <= 0.2) {
    const pair = [top.k, second.k].sort().join("+");
    if (pair === "hobbies+job") return "work_hobbies";
    if (pair === "job+social") return "work_social";
    return "hobbies_social";
  }

  return "balanced";
}

function toPercent(n: number) {
  return Math.round(n * 100);
}

/**
 * 判断“没有足够数据”的策略（只依赖 themes 本身）：
 * - themes 为空/undefined/null -> empty
 * - 或四个值加起来非常小 -> empty
 *
 * 注：如果你愿意，也可以从父组件传入 data.stats.entries 来更精确判断；
 *     但目前“不改父组件”，只改 ThemeSection 也能工作。
 */
function isEmptyThemes(themes: ThemesInput | null | undefined) {
  if (!themes) return true;
  const sum =
    (themes.job ?? 0) +
    (themes.hobbies ?? 0) +
    (themes.social ?? 0) +
    (themes.other ?? 0);

  return !Number.isFinite(sum) || sum <= 0.000001;
}

export default function ThemeSection({ themes }: { themes: ThemesInput }) {
  const empty = useMemo(() => isEmptyThemes(themes), [themes]);

  // 空状态：直接展示图 + 文案，不显示百分比行
  if (empty) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Your Inner Landscape</Text>
        <Image source={EMPTY_STATE_IMAGE} style={styles.emptyImage} resizeMode="contain" />
      </View>
    );
  }

  const normalized = useMemo(() => normalizeThemes(themes), [themes]);
  const variant = useMemo(() => pickLandscapeVariant(normalized), [normalized]);

  const workPct = toPercent(normalized.job);
  const hobbiesPct = toPercent(normalized.hobbies);
  const socialPct = toPercent(normalized.social);
  const otherPct = toPercent(normalized.other);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Inner Landscape</Text>

      <Image source={LANDSCAPE_IMAGES[variant]} style={styles.image} resizeMode="contain" />

      <View style={styles.footerRow}>
        <ThemeItem iconName="briefcase-outline" label="Work" value={`${workPct}%`} />
        <ThemeItem iconName="color-palette-outline" label="Hobbies" value={`${hobbiesPct}%`} />
        <ThemeItem iconName="people-outline" label="Social" value={`${socialPct}%`} />
        <ThemeItem iconName="leaf-outline" label="Other" value={`${otherPct}%`} />
      </View>
    </View>
  );
}

function ThemeItem({
  iconName,
  label,
  value,
}: {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemTopRow}>
        <Ionicons name={iconName} size={16} color="#6B4F3A" />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B4F3A",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 170,
    marginBottom: 8,
  },
  emptyImage: {
    width: "100%",
    height: 170,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemLabel: {
    fontSize: 14,
    color: "#6B4F3A",
    fontWeight: "500",
  },
  itemValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#6B4F3A",
  },
});
