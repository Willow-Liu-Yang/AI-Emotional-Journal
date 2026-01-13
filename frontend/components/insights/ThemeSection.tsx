// components/insights/ThemeSection.tsx

import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n";

type ThemeKey = "work" | "hobbies" | "social" | "other";
type ThemesInput = Partial<Record<ThemeKey, number>>;

type LandscapeVariant =
  | "balanced"
  | "only_work"
  | "only_hobbies"
  | "only_social"
  | "only_other"
  | "work_hobbies_only"
  | "work_social_only"
  | "work_other_only"
  | "hobbies_social_only"
  | "hobbies_other_only"
  | "social_other_only";

const LANDSCAPE_IMAGES: Record<LandscapeVariant, any> = {
  balanced: require("../../assets/images/insights/landscape/landscape_balanced.png"),

  only_work: require("../../assets/images/insights/landscape/landscape_only_work.png"),
  only_hobbies: require("../../assets/images/insights/landscape/landscape_only_hobbies.png"),
  only_social: require("../../assets/images/insights/landscape/landscape_only_social.png"),
  only_other: require("../../assets/images/insights/landscape/landscape_only_other.png"),

  work_hobbies_only: require("../../assets/images/insights/landscape/landscape_work_hobbies_only.png"),
  work_social_only: require("../../assets/images/insights/landscape/landscape_work_social_only.png"),
  work_other_only: require("../../assets/images/insights/landscape/landscape_work_other_only.png"),

  hobbies_social_only: require("../../assets/images/insights/landscape/landscape_hobbies_social_only.png"),
  hobbies_other_only: require("../../assets/images/insights/landscape/landscape_hobbies_other_only.png"),

  social_other_only: require("../../assets/images/insights/landscape/landscape_social_other_only.png"),
};

const EMPTY_STATE_IMAGE = require("../../assets/images/insights/landscape/landscape_empty_state.png");

const THEME_EMOJI: Record<ThemeKey, string> = {
  work: "⛰️", // Mountain
  hobbies: "🏡", // House
  social: "🌸", // Flower
  other: "☁️", // Cloud
};


function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeThemes(input: ThemesInput | null | undefined) {
  const work = clamp01(input?.work ?? 0);
  const hobbies = clamp01(input?.hobbies ?? 0);
  const social = clamp01(input?.social ?? 0);
  const otherFromServer = clamp01(input?.other ?? 0);

  const sum3 = work + hobbies + social;
  const other = input?.other == null ? clamp01(1 - sum3) : otherFromServer;

  const total = work + hobbies + social + other;
  if (total <= 0) return { work: 0, hobbies: 0, social: 0, other: 0 };

  return {
    work: work / total,
    hobbies: hobbies / total,
    social: social / total,
    other: other / total,
  };
}

function toPercent(n: number) {
  return Math.round(n * 100);
}

function isEmptyThemes(themes: ThemesInput | null | undefined) {
  if (!themes) return true;
  const sum =
    (themes.work ?? 0) +
    (themes.hobbies ?? 0) +
    (themes.social ?? 0) +
    (themes.other ?? 0);

  return !Number.isFinite(sum) || sum <= 0.000001;
}

function pickLandscapeVariant(t: { work: number; hobbies: number; social: number; other: number }): LandscapeVariant {
  const PRESENT_EPS = 0.08;
  const DOMINANT_MIN = 0.72;

  const keys: ThemeKey[] = ["work", "hobbies", "social", "other"];
  const present = keys.filter((k) => t[k] >= PRESENT_EPS);

  const top = keys
    .map((k) => ({ k, v: t[k] }))
    .sort((a, b) => b.v - a.v)[0];

  if (top.v >= DOMINANT_MIN) {
    if (top.k === "work") return "only_work";
    if (top.k === "hobbies") return "only_hobbies";
    if (top.k === "social") return "only_social";
    return "only_other";
  }

  if (present.length === 2) {
    const pair = present.slice().sort().join("+");
    if (pair === "hobbies+work") return "work_hobbies_only";
    if (pair === "social+work") return "work_social_only";
    if (pair === "other+work") return "work_other_only";
    if (pair === "hobbies+social") return "hobbies_social_only";
    if (pair === "hobbies+other") return "hobbies_other_only";
    return "social_other_only";
  }

  return "balanced";
}

function pickTopKey(t: { work: number; hobbies: number; social: number; other: number }): ThemeKey {
  const keys: ThemeKey[] = ["work", "hobbies", "social", "other"];
  return keys
    .map((k) => ({ k, v: t[k] }))
    .sort((a, b) => b.v - a.v)[0].k;
}

export default function ThemeSection({ themes }: { themes: ThemesInput }) {
  const { t } = useI18n();
  const empty = useMemo(() => isEmptyThemes(themes), [themes]);

  if (empty) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{t("theme.title")}</Text>
        <Image source={EMPTY_STATE_IMAGE} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.emptyHint} numberOfLines={1}>
          {t("theme.empty")}
        </Text>
      </View>
    );
  }

  const normalized = useMemo(() => normalizeThemes(themes), [themes]);
  const variant = useMemo(() => pickLandscapeVariant(normalized), [normalized]);
  const topKey = useMemo(() => pickTopKey(normalized), [normalized]);

  const pcts = {
    work: toPercent(normalized.work),
    hobbies: toPercent(normalized.hobbies),
    social: toPercent(normalized.social),
    other: toPercent(normalized.other),
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("theme.title")}</Text>

      <Image source={LANDSCAPE_IMAGES[variant]} style={styles.image} resizeMode="contain" />

      <View style={styles.grid}>
        <SoftTile theme="work" pct={pcts.work} active={topKey === "work"} />
        <SoftTile theme="hobbies" pct={pcts.hobbies} active={topKey === "hobbies"} />
        <SoftTile theme="social" pct={pcts.social} active={topKey === "social"} />
        <SoftTile theme="other" pct={pcts.other} active={topKey === "other"} />
      </View>
    </View>
  );
}

function SoftTile({ theme, pct, active }: { theme: ThemeKey; pct: number; active: boolean }) {
  const { t } = useI18n();
  const label = t(`theme.${theme}` as any);
  const emoji = THEME_EMOJI[theme];

  return (
    <View style={[styles.tile, active && styles.tileActive]}>
      {active && <View pointerEvents="none" style={styles.bottomShadowBand} />}

      <View style={styles.tileRow}>
        <Text style={styles.emoji}>{emoji}</Text>

        <View style={styles.textCol}>
          <Text style={[styles.pctText, active && styles.pctTextActive]}>{pct}%</Text>
          <Text style={[styles.labelText, active && styles.labelTextActive]}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
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
    marginBottom: 14,
    textAlign: "center",
  },

  image: {
    width: "100%",
    height: 170,
    marginBottom: 14,
  },

  emptyImage: {
    width: "100%",
    height: 170,
  },
  emptyHint: {
    marginTop: 8,
    textAlign: "center",
    color: "#6B4F3A",
    fontSize: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  tile: {
    width: "48%",
    borderRadius: 24, // Rounder
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(242, 231, 216, 0.55)",
    overflow: "hidden",
    position: "relative",
    minHeight: 64,
  },

  tileActive: {
    backgroundColor: "rgba(242, 231, 216, 0.48)",
  },

  bottomShadowBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 5, // Thinner (about one-third)
    backgroundColor: "rgba(127, 175, 134, 0.40)",
    shadowColor: "#7FAF86",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  tileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  emoji: {
    fontSize: 26,
    lineHeight: 28,
  },

  textCol: {
    flex: 1,
    justifyContent: "center",
  },

  pctText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#6B4F3A",
    lineHeight: 18,
  },
  pctTextActive: {
    color: "#2F6B57",
  },

  labelText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(107, 79, 58, 0.78)",
    lineHeight: 14,
  },
  labelTextActive: {
    color: "rgba(47, 107, 87, 0.9)",
  },
});
