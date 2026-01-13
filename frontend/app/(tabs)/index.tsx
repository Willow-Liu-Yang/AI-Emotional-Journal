// app/(tabs)/index.tsx

import { authApi } from "@/api/auth";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { HomeCard } from "@/components/HomeCard";
import { useI18n } from "@/i18n";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = 18;

export default function MainPage() {
  const router = useRouter();
  const { language, t } = useI18n();
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const today = new Date()
    .toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function fetchUser() {
        try {
          const data = await authApi.getCurrentUser();
          if (active) setUsername(data?.username ?? "");
        } catch (err) {
          console.log("Failed to load user:", err);
        }
      }

      fetchUser();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Top date + avatar */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={require("@/assets/images/profile/Profile.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.greeting}>
        {t("home.greeting", {
          name: username || t("home.friend"),
        })}
      </Text>

      <Image
        source={require("@/assets/images/login/bear.png")}
        style={styles.capyImage}
        resizeMode="contain"
      />

      {/* Centered line: Need... + See all */}
      <View style={styles.promptHeaderCentered}>
        <Text style={styles.promptLine}>
          {t("home.promptLine")}
          <Text
            style={styles.promptLink}
            onPress={() => router.push("/promptLibrary")}
          >
            {" "}
            {t("home.seeAll")}
          </Text>
        </Text>
      </View>

      {/* Prompt card carousel */}
      <View style={styles.carouselWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="center"
          contentContainerStyle={{
            paddingHorizontal: (width - CARD_WIDTH) / 2,
          }}
          onScroll={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            const index = Math.round(x / (CARD_WIDTH + CARD_SPACING));
            setCurrentPage(index);
          }}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          <View style={{ width: CARD_WIDTH }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/capture_joy.png")}
              title={t("home.card.captureJoy.title")}
              text={t("home.card.captureJoy.text")}
              background="#FAF1E5"
              onPress={() =>
                router.push({
                  pathname: "/entries/write",
                  params: { promptKey: "capture_joy" },
                })
              }
            />
          </View>

          <View style={{ width: CARD_WIDTH, marginLeft: CARD_SPACING }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/let_it_out.png")}
              title={t("home.card.letItOut.title")}
              text={t("home.card.letItOut.text")}
              background="#FAF1E5"
              onPress={() =>
                router.push({
                  pathname: "/entries/write",
                  params: { promptKey: "let_it_out" },
                })
              }
            />
          </View>

          <View style={{ width: CARD_WIDTH, marginLeft: CARD_SPACING }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/steps_forward.png")}
              title={t("home.card.stepsForward.title")}
              text={t("home.card.stepsForward.text")}
              background="#FAF1E5"
              onPress={() =>
                router.push({
                  pathname: "/entries/write",
                  params: { promptKey: "steps_forward" },
                })
              }
            />
          </View>
        </ScrollView>

        {/* Dots */}
        <View style={styles.dotsOverlay}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, currentPage === i && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Write-journal button without prompt */}
      <TouchableOpacity
        style={styles.writeBtn}
        onPress={() => router.push("/entries/write")}
      >
        <Text style={styles.writeBtnText}>{t("home.writeButton")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#F5EAD9",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  date: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A6A54",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  greeting: {
    paddingHorizontal: 22,
    fontSize: 28,
    fontWeight: "700",
    color: "#4A3828",
    marginTop: 10,
  },

  // Larger image + leave space below (push lower section down)
  capyImage: {
    width: "100%",
    height: 270,
    marginTop: 6,
    marginBottom: 10,
  },

  // Move this block down and center it
  promptHeaderCentered: {
    paddingHorizontal: 22,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  promptLine: {
    fontSize: 15,
    color: "#7A6A54",
    textAlign: "center",
  },
  promptLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4A3828",
    textDecorationLine: "underline",
  },

  // Keep some spacing from dots
  carouselWrapper: {
    marginTop: 14,
    position: "relative",
    paddingBottom: 28,
  },
  carousel: {
    flexGrow: 0,
  },

  dotsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    flexDirection: "row",
    justifyContent: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C9C2B5",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#9DBA96",
  },

  writeBtn: {
    backgroundColor: "#9DBA96",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 22,
    marginTop: 14,
  },
  writeBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
