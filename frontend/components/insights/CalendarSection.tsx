// components/insights/CalendarSection.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useI18n } from "@/i18n";

/**
 * calendarData structure:
 *  - week:  [{ date, paw }]
 *  - month: [[paw, paw, ...], ...]
 *
 * paw value: "none" | "light" | "dark" | "empty"
 *
 * This component prefers assets/insights/paw_*.png (none/light/dark),
 * and falls back to emoji when images are missing.
 */

// try to require images (if present)
let pawNoneImg: any = null;
let pawLightImg: any = null;
let pawDarkImg: any = null;
let pawEmptyImg: any = null;

try {
  pawNoneImg = require("../../assets/images/insights/paw.png");
} catch (e) {
  pawNoneImg = null;
}
try {
  pawLightImg = require("../../assets/images/insights/paw_light.png");
} catch (e) {
  pawLightImg = null;
}
try {
  pawDarkImg = require("../../assets/images/insights/paw_dark.png");
} catch (e) {
  pawDarkImg = null;
}
try {
  pawEmptyImg = require("../../assets/images/insights/paw_empty.png");
} catch (e) {
  pawEmptyImg = null;
}

export default function CalendarSection({
  range,
  calendarData,
}: {
  range: "week" | "month";
  calendarData: any;
}) {
  if (!calendarData) return null;
  const { t } = useI18n();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("calendar.title")}</Text>

      {range === "week" ? (
        <WeekCalendar week={calendarData.week ?? []} />
      ) : (
        <MonthCalendar month={calendarData.month ?? []} />
      )}
    </View>
  );
}

/* ----------------------------------------------------
 * WEEK VIEW (Mon – Sun)
 * ---------------------------------------------------- */
function WeekCalendar({ week }: { week: Array<any> }) {
  const { t } = useI18n();
  const labels = [
    t("day.mon"),
    t("day.tue"),
    t("day.wed"),
    t("day.thu"),
    t("day.fri"),
    t("day.sat"),
    t("day.sun"),
  ];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.weekRow}>
      {labels.map((label, i) => {
        const item = week[i];
        const paw = item?.paw ?? "none";
        const dateStr = item?.date ?? null;
        const isToday = dateStr === todayIso;
        const isFuture = dateStr ? dateStr > todayIso : false;
        const displayPaw = paw === "none" ? (isFuture ? "empty" : "none") : paw;

        return (
          <View key={i} style={styles.weekItem}>
            <Text style={styles.weekDay}>{label}</Text>
            <View style={[styles.pawWrapper, isToday && styles.todayGlow]}>
              {renderPawImageOrEmoji(displayPaw)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ----------------------------------------------------
 * MONTH VIEW (6 x 7 grid)
 * ---------------------------------------------------- */
function MonthCalendar({ month }: { month: string[][] }) {
  const { t } = useI18n();
  const labels = [
    t("day.mon"),
    t("day.tue"),
    t("day.wed"),
    t("day.thu"),
    t("day.fri"),
    t("day.sat"),
    t("day.sun"),
  ];
  // month is array of 6 rows, each row is 7 strings: "none"/"light"/"dark"
  // Build a local calendar grid for the current month so we can show date numbers.
  const today = new Date();
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

  const grid = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const idx = r * 7 + c;
      const dayNum = idx - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      return dayNum;
    })
  );

  return (
    <View>
      <View style={styles.monthHeader}>
        {labels.map((d) => (
          <Text key={d} style={styles.monthDay}>
            {d}
          </Text>
        ))}
      </View>

      {grid.map((row, rIdx) => (
        <View key={rIdx} style={styles.monthRow}>
          {row.map((dayNum, cIdx) => {
            const pawState = month?.[rIdx]?.[cIdx] ?? "none";
            const isFuture =
              dayNum != null &&
              (year > today.getFullYear() ||
                (year === today.getFullYear() &&
                  (monthIndex > today.getMonth() ||
                    (monthIndex === today.getMonth() && dayNum > today.getDate()))));
            const isToday =
              dayNum != null &&
              dayNum === today.getDate() &&
              year === today.getFullYear() &&
              monthIndex === today.getMonth();
            const displayPaw =
              dayNum == null
                ? "none"
                : pawState === "none"
                  ? isFuture
                    ? "empty"
                    : "none"
                  : pawState;
            return (
              <View key={cIdx} style={styles.monthCell}>
                <View style={[styles.monthPawWrapper, isToday && styles.todayGlow]}>
                  {renderPawImageOrEmoji(displayPaw)}
                </View>
                <Text style={styles.monthDateText}>{dayNum ?? ""}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/* ----------------------------------------------------
 * Render using image if available, else fallback emoji
 * ---------------------------------------------------- */
function renderPawImageOrEmoji(state: string) {
  // prefer images if available
  if (state === "dark" && pawDarkImg) {
    return <Image source={pawDarkImg} style={styles.pawImage} resizeMode="contain" />;
  }
  if (state === "light" && pawLightImg) {
    return <Image source={pawLightImg} style={styles.pawImage} resizeMode="contain" />;
  }
  if (state === "none" && pawNoneImg) {
    return <Image source={pawNoneImg} style={styles.pawImage} resizeMode="contain" />;
  }
  if (state === "empty" && pawEmptyImg) {
    return <Image source={pawEmptyImg} style={styles.pawImage} resizeMode="contain" />;
  }

  if (state === "empty") {
    return null;
  }

  // fallback emoji with correct color
  switch (state) {
    case "dark":
      return <Text style={[styles.pawEmoji, { color: "#8C5E33" }]}>🐾</Text>;
    case "light":
      return <Text style={[styles.pawEmoji, { color: "#D4C0A3" }]}>🐾</Text>;
    case "none":
      return <Text style={[styles.pawEmoji, { color: "#E8E0D0" }]}>🐾</Text>;
    default:
      return null;
  }
}

/* ----------------------------------------------------
 * Styles
 * ---------------------------------------------------- */

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

  /* ----- Week ----- */
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  weekItem: {
    alignItems: "center",
    width: 44,
  },

  weekDay: {
    fontSize: 12,
    marginBottom: 6,
    color: "#6B4F3A",
  },

  pawWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  todayGlow: {
    // yellow outline for today
    borderWidth: 2,
    borderColor: "#F6D36B",
  },

  /* ----- Month ----- */
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  monthDay: {
    width: 44,
    textAlign: "center",
    fontSize: 12,
    color: "#6B4F3A",
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  monthCell: {
    width: 44,
    height: 68,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  monthPawWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  monthDateText: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B4F3A",
  },

  pawImage: {
    width: 34,
    height: 34,
  },

  pawEmoji: {
    fontSize: 28,
  },
});
