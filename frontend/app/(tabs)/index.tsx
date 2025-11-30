// app/(tabs)/index.tsx

import { authApi } from "@/api/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const { width } = Dimensions.get("window");

export default function MainPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");

  // 获取今天日期
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // 调用 /users/me 获取当前用户
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await authApi.getCurrentUser();
        if (data?.username) {
          setUsername(data.username);
        }
      } catch (err) {
        console.log("Failed to load user:", err);
      }
    }
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* 顶部栏：日期 + 头像按钮 */}
      <View style={styles.header}>
        <Text style={styles.date}>{today}</Text>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={require("@/assets/login/bear.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Capybara 图片 */}
      <Image
        source={require("@/assets/login/bear.png")}
        style={styles.capyImage}
        resizeMode="contain"
      />

      {/* Greeting */}
      <Text style={styles.greeting}>Good morning, {username || "friend"}.</Text>
      <Text style={styles.subtitle}>ready to float with your thoughts today?</Text>

      {/* 轮播图，用 ScrollView 替代外部依赖 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.carousel}
      >
        <View style={[styles.card, { backgroundColor: "#FFE8D6" }]}>
          <Text style={styles.cardTitle}>Daily Reflection</Text>
          <Text style={styles.cardContent}>Take a moment to write down how you feel.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#FCDDEC" }]}>
          <Text style={styles.cardTitle}>Mood Tracker</Text>
          <Text style={styles.cardContent}>See how your emotions flow over time.</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#D6EAF8" }]}>
          <Text style={styles.cardTitle}>AI Companion</Text>
          <Text style={styles.cardContent}>Your personal capybara is here for you.</Text>
        </View>
      </ScrollView>

      {/* 写日记按钮 */}
      <TouchableOpacity style={styles.writeBtn} onPress={() => router.push("/write")}>
        <Text style={styles.writeBtnText}>Start writing for today</Text>
      </TouchableOpacity>
    </View>
  );
}

//
// --- Styles ---
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 60,
    backgroundColor: "white",
  },

  // 顶部栏
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // Capybara 图片
  capyImage: {
    width: "100%",
    height: 180,
    marginTop: 10,
  },

  // 文案
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    marginBottom: 20,
    color: "#777",
  },

  // 轮播图
  carousel: {
    marginTop: 10,
    height: 160,
  },
  card: {
    width: width * 0.75,
    marginRight: 18,
    padding: 20,
    borderRadius: 16,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  cardContent: {
    fontSize: 14,
    color: "#555",
  },

  // 写日记按钮
  writeBtn: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  writeBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
