// app/profile/companion.tsx

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { authApi } from "@/api/auth";
import { companionsApi, Companion as BaseCompanion } from "@/api/companions";

// ---- 类型：在 API 基础上补上 description / avatar_key ----
type Companion = BaseCompanion & {
  description?: string | null;
  avatar_key?: string | null;
};

// 静态图片映射
const companionImages: Record<string, any> = {
  luna: require("@/assets/images/profile/luna.png"),
  sol: require("@/assets/images/profile/sol.png"),
  terra: require("@/assets/images/profile/terra.png"),
};

function getCompanionImage(c: Companion) {
  if (c.avatar_key && companionImages[c.avatar_key]) {
    return companionImages[c.avatar_key];
  }
  const key = (c.name || "").toLowerCase();
  if (companionImages[key]) {
    return companionImages[key];
  }
  return require("@/assets/images/profile/luna.png");
}

export default function CompanionSelectScreen() {
  const router = useRouter();

  const [companions, setCompanions] = useState<Companion[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  // 加载用户 + 伴侣列表
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const user = await authApi.getCurrentUser();
        if (!active) return;

        setCurrentId(user?.companion?.id ?? null);

        const list = await companionsApi.list();
        if (!active) return;
        setCompanions(list as Companion[]);
      } catch (err) {
        console.log("Load companions error:", err);
        if (active) {
          Alert.alert("Error", "Failed to load AI companions.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSelect(id: number) {
    if (savingId === id) return;

    setSavingId(id);
    try {
      await companionsApi.select(id);
      setCurrentId(id); // 只更新本地选中态，不自动返回

      Alert.alert("Updated", "Your AI Companion has been updated.");
    } catch (err) {
      console.log("Select companion error:", err);
      Alert.alert("Error", "Failed to update your AI Companion.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#6A4A2A" />
        <Text style={{ marginTop: 10, color: "#6A4A2A" }}>
          Loading companions…
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerClose}
          onPress={() => router.back()}
        >
          <Image
            source={require("@/assets/images/profile/icon_close_capy.png")}
            style={styles.headerCloseIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My AI Companion</Text>

        {/* 右侧占位，让标题居中 */}
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.headerSubtitle}>
        Connect with the listener who understands you best.
      </Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {companions.map((c) => {
          const img = getCompanionImage(c);
          const selected = currentId === c.id;
          const disabled = savingId !== null;

          return (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.9}
              style={[
                styles.card,
                { backgroundColor: c.theme_color || "#DADFEA" },
                selected && styles.cardSelected,
              ]}
              onPress={() => handleSelect(c.id)}
              disabled={disabled}
            >
              {/* 顶部：头像 + 文本 */}
              <View style={styles.cardTopRow}>
                <View style={styles.avatarWrapper}>
                  <Image source={img} style={styles.avatar} />
                </View>

                <View style={styles.cardTextWrapper}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName}>{c.name}</Text>
                    {/* 👉 不要点号了 */}
                  </View>

                  {c.identity_title ? (
                    <Text style={styles.cardTitle}>{c.identity_title}</Text>
                  ) : null}

                  {c.description ? (
                    <Text style={styles.cardDesc}>{c.description}</Text>
                  ) : null}
                </View>
              </View>

              {/* 底部：整行标签，单独一行 */}
              <View style={styles.tagsRow}>
                {(c.tags || []).map((t, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* 右上角选中勾 */}
              {selected && (
                <View style={styles.checkWrapper}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#5A3E24"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* 自定义按钮（占位） */}
        <TouchableOpacity
          style={styles.customBtn}
          activeOpacity={0.9}
          onPress={() =>
            Alert.alert(
              "Coming soon",
              "Custom listeners will be available in a future update."
            )
          }
        >
          <View style={styles.customIconWrapper}>
            <Ionicons name="add" size={20} color="#5A3E24" />
          </View>
          <Text style={styles.customText}>Customize Your Listener</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F2E4D2",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2E4D2",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCloseIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#4A2C22",
  },
  headerSubtitle: {
    marginTop: 8,
    paddingHorizontal: 40,
    textAlign: "center",
    fontSize: 14,
    color: "#7E5F42",
  },

  scroll: {
    flex: 1,
    marginTop: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  card: {
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "rgba(90,62,36,0.8)",
  },

  // 顶部：头像+文字
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.7)",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  cardName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A2C22",
  },
  cardTitle: {
    marginTop: 2,
    fontSize: 14,
    color: "#4A2C22",
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 13,
    color: "#4A2C22",
  },

  // 底部标签，单独一整行
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4A2C22",
  },

  checkWrapper: {
    position: "absolute",
    top: 12,
    right: 16,
  },

  customBtn: {
    marginTop: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#FDF7EF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  customIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#5A3E24",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  customText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4A2C22",
  },
});
