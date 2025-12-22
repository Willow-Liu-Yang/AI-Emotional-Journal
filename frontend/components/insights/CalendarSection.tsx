// components/insights/CalendarSection.tsx
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

/**
 * calendarData structure:
 *  - week:  [{ date, paw }]
 *  - month: [[paw, paw, ...], ...]
 *
 * paw value: "none" | "light" | "dark"
 *
 * This component prefers assets/insights/paw_*.png (none/light/dark),
 * and falls back to emoji when images are missing.
 */

// try to require images (if present)
let pawNoneImg: any = null;
let pawLightImg: any = null;
let pawDarkImg: any = null;

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

export default function CalendarSection({
  range,
  calendarData,
}: {
  range: "week" | "month";
  calendarData: any;
}) {
  if (!calendarData) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Paw Print Calendar</Text>

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
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <View style={styles.weekRow}>
      {labels.map((label, i) => {
        const item = week[i];
        const paw = item?.paw ?? "none";
        const dateStr = item?.date ?? null;
        const isToday = dateStr === todayIso;

        return (
          <View key={i} style={styles.weekItem}>
            <Text style={styles.weekDay}>{label}</Text>
            <View style={[styles.pawWrapper, isToday && styles.todayGlow]}>
              {renderPawImageOrEmoji(paw)}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/* ----------------------------------------------------
 * MONTH VIEW (6 × 7 grid)
 * ---------------------------------------------------- */
function MonthCalendar({ month }: { month: string[][] }) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // month is array of 6 rows, each row is 7 strings: "none"/"light"/"dark"
  // we don't have date numbers here by default; if you want numbers show, backend should return them.
  // We'll highlight today if a matching cell has today's date by comparing a parallel data structure.
  // For now we just render paw images per state.

  // attempt to detect today's position if backend returned real dates instead of simple states:
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <View>
      <View style={styles.monthHeader}>
        {labels.map((d) => (
          <Text key={d} style={styles.monthDay}>
            {d}
          </Text>
        ))}
      </View>

      {month.map((row, rIdx) => (
        <View key={rIdx} style={styles.monthRow}>
          {row.map((state, cIdx) => {
            const pawState = state ?? "none";
            // if backend returns objects instead of string, adapt: if typeof state === 'object' use state.paw
            const isToday = false; // placeholder: month view highlighting needs backend-provided date info to be precise
            return (
              <View key={cIdx} style={styles.monthCell}>
                <View style={[styles.pawWrapper, isToday && styles.todayGlow]}>
                  {renderPawImageOrEmoji(pawState)}
                </View>
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

  // fallback emoji with correct color
  switch (state) {
    case "dark":
      return <Text style={[styles.pawEmoji, { color: "#8C5E33" }]}>🐾</Text>;
    case "light":
      return <Text style={[styles.pawEmoji, { color: "#D4C0A3" }]}>🐾</Text>;
    default:
      return <Text style={[styles.pawEmoji, { color: "#E8E0D0" }]}>🐾</Text>;
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
    backgroundColor: "#F2E7D8",
    justifyContent: "center",
    alignItems: "center",
  },

  todayGlow: {
    // subtle yellow glow for today
    shadowColor: "#F0D87A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
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
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  pawImage: {
    width: 34,
    height: 34,
  },

  pawEmoji: {
    fontSize: 28,
  },
});
