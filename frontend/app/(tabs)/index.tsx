// app/(tabs)/index.tsx

import { authApi } from "@/api/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const CARD_SPACING = 18;

export default function MainPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authApi.getCurrentUser();
        if (data?.username) setUsername(data.username);
      } catch (err) {
        console.log("Failed to load user:", err);
      }
    }
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* 顶部日期 + 头像 */}
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
        Good morning, {username || "friend"}.
      </Text>

      <Image
        source={require("@/assets/images/login/bear.png")}
        style={styles.capyImage}
        resizeMode="contain"
      />

      {/* Ready + See All */}
      <View style={styles.promptHeader}>
        <Text style={styles.promptText}>
          Ready to float with your thoughts?
        </Text>

        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push("/promptLibrary")}
        >
          <Text style={styles.seeAll}>See All &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Prompt 卡片轮播 */}
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
          {/* 1 Capture Joy */}
          <View style={{ width: CARD_WIDTH }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/capture_joy.png")}
              title="Capture Joy"
              text="What little moment brought you joy today?"
              background="#FAF1E5"
              onPress={() =>
                router.push({
                  pathname: "/entries/write",
                  params: { promptKey: "capture_joy" },
                })
              }
            />
          </View>

          {/* 2 Let It Out */}
          <View style={{ width: CARD_WIDTH, marginLeft: CARD_SPACING }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/let_it_out.png")}
              title="Let It Out"
              text="What feelings have been quietly rising inside you?"
              background="#FAF1E5"
              onPress={() =>
                router.push({
                  pathname: "/entries/write",
                  params: { promptKey: "let_it_out" },
                })
              }
            />
          </View>

          {/* 3 Steps Forward */}
          <View style={{ width: CARD_WIDTH, marginLeft: CARD_SPACING }}>
            <HomeCard
              icon={require("@/assets/images/icons/prompt/steps_forward.png")}
              title="Steps Forward"
              text="What small step did you take toward something important?"
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

        {/* 圆点 */}
        <View style={styles.dotsOverlay}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, currentPage === i && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* 不带 prompt 的写日记按钮 */}
      <TouchableOpacity
        style={styles.writeBtn}
        onPress={() => router.push("/entries/write")}
      >
        <Text style={styles.writeBtnText}>Start writing for today</Text>
      </TouchableOpacity>
    </View>
  );
}

//
// ─── Styles ─────────────────────────────
//
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

  capyImage: {
    width: "100%",
    height: 180,
    marginTop: 4,
  },

  promptHeader: {
    paddingHorizontal: 22,
    marginTop: 8,
  },
  promptText: {
    fontSize: 15,
    color: "#7A6A54",
  },
  seeAllButton: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  seeAll: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A3828",
    textDecorationLine: "underline",
  },

  carouselWrapper: {
    marginTop: 8,
    height: 200,
    position: "relative",
  },
  carousel: {
    flexGrow: 0,
  },

  dotsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
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
    marginTop: 12,
  },
  writeBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
