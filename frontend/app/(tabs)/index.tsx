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

      <Text style={styles.greeting}>Good morning, {username || "friend"}.</Text>

      <Image
        source={require("@/assets/images/login/bear.png")}
        style={styles.capyImage}
        resizeMode="contain"
      />

      {/* ✅ 居中一句话：Need... + See all */}
      <View style={styles.promptHeaderCentered}>
        <Text style={styles.promptLine}>
          Need a prompt to start?
          <Text
            style={styles.promptLink}
            onPress={() => router.push("/promptLibrary")}
          >
            {" "}
            See all &gt;
          </Text>
        </Text>
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

  // ✅ 图片更大 + 给下面留出空间（让下面部分“更靠下”）
  capyImage: {
    width: "100%",
    height: 270,
    marginTop: 6,
    marginBottom: 10,
  },

  // ✅ 这一段整体下移，并居中
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

  // ✅ 继续保持 dots 有一点距离
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
