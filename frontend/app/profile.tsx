import { authApi } from "@/api/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- types ----------
type Companion = {
  name?: string;
  identity_title?: string;
  tags?: string[];
  theme_color?: string;
};

type SettingsItem = {
  key: string;
  label: string;
  icon: any;
  route?: string;
};

// ---------- config ----------
const SETTINGS_ITEMS: SettingsItem[] = [
  {
    key: "notification",
    label: "Notification",
    icon: require("@/assets/images/profile/icon_notification.png"),
    route: "/settings/notification",
  },
  {
    key: "language",
    label: "Language",
    icon: require("@/assets/images/profile/icon_language.png"),
    route: "/settings/language",
  },
  {
    key: "theme",
    label: "Theme",
    icon: require("@/assets/images/profile/icon_theme.png"),
    route: "/settings/theme",
  },
  {
    key: "privacy",
    label: "Privacy & Security",
    icon: require("@/assets/images/profile/icon_privacy.png"),
    route: "/settings/privacy",
  },
  {
    key: "help",
    label: "Help & Support",
    icon: require("@/assets/images/profile/icon_help.png"),
    route: "/settings/help",
  },
];

const getCompanionImage = (name?: string) => {
  switch (name) {
    case "Sol":
      return require("@/assets/images/profile/sol.png");
    case "Terra":
      return require("@/assets/images/profile/terra.png");
    default:
      return require("@/assets/images/profile/luna.png");
  }
};

// ---------- component ----------
export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 加载用户信息
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await authApi.getCurrentUser();
        setUser(data);
      } catch (err) {
        console.log("Failed to load user:", err);
      }
    }
    loadUser();
  }, []);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const companion: Companion | null = user.companion || null;
  const companionTags =
    companion?.tags && companion.tags.length > 0
      ? companion.tags
      : ["Gentle", "Insightful", "Calming"];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header 区域 */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* 左侧关闭按钮 */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Image
              source={require("@/assets/images/profile/icon_close_capy.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Space</Text>

          {/* 右侧占位，用来让标题居中 */}
          <View style={{ width: 48 }} />
        </View>

        {/* 用户信息行 */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require("@/assets/images/profile/Profile.png")}
              style={styles.avatarImg}
            />
          </View>

          <View style={styles.profileText}>
            <Text style={styles.usernameText}>
              {user.username || "User"}
            </Text>
            {joinDate ? (
              <Text style={styles.joinText}>Joined on {joinDate}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/profile/edit")}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        {/* AI Companion 卡片 */}
        <TouchableOpacity
          style={[
            styles.companionCard,
            companion?.theme_color
              ? { backgroundColor: companion.theme_color }
              : null,
          ]}
          onPress={() => router.push("/profile/companion")}
        >
          <View style={styles.companionAvatarWrapper}>
            <Image
              source={getCompanionImage(companion?.name)}
              style={styles.companionAvatar}
            />
          </View>

          <View style={styles.companionTextWrapper}>
            <Text style={styles.companionSectionTitle}>My AI Companion</Text>

            <View style={styles.companionNameRow}>
              <Text style={styles.companionNameText}>
                {companion?.name || "Luna"}
              </Text>
              <Text style={styles.dot}> · </Text>
              <Text style={styles.companionSubtitleText}>
                {companion?.identity_title || "Your Gentle Companion"}
              </Text>
            </View>

            <View style={styles.tagRow}>
              {companionTags.map((t, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={22} color="#7E5F42" />
          </View>
        </TouchableOpacity>

        {/* 设置列表 */}
        <View style={styles.menuSection}>
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuRow}
              onPress={() => {
                if (!item.route) return;
                router.push(item.route as any);
              }}
            >
              <View style={styles.menuLeft}>
                <Image source={item.icon} style={styles.menuIcon} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuArrow}>
                <Ionicons name="chevron-forward" size={22} color="#7E5F42" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出 + 版本号 */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={async () => {
              await authApi.logout();
              router.replace("/login");
            }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>CapyDiary v1.0.1</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7E7D3", // 整体米黄色
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7E7D3",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#EBCDA3",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#4A2C22",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "#D7A871",
    backgroundColor: "#F9EAD8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarImg: {
    width: 64,
    height: 64,
    resizeMode: "cover",
  },
  profileText: {
    flex: 1,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4A2C22",
  },
  joinText: {
    marginTop: 4,
    fontSize: 14,
    color: "#7E5F42",
  },
  editBtn: {
    marginLeft: 8,
  },
  editText: {
    fontSize: 14,
    color: "#7E5F42",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },

  companionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#DADFEA", // 默认 Luna 底色
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  companionAvatarWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: "hidden",
    marginRight: 14,
  },
  companionAvatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  companionTextWrapper: {
    flex: 1,
  },
  companionSectionTitle: {
    fontSize: 14,
    color: "#7E5F42",
    marginBottom: 2,
  },
  companionNameRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  companionNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A2C22",
  },
  dot: {
    fontSize: 16,
    color: "#7E5F42",
    marginHorizontal: 4,
  },
  companionSubtitleText: {
    fontSize: 14,
    color: "#7E5F42",
    flexShrink: 1,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A2C22",
  },

  cardArrow: {
    marginLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  menuSection: {
    marginTop: 26,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
    resizeMode: "contain",
  },
  menuLabel: {
    fontSize: 16,
    color: "#4A2C22",
  },
  menuArrow: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    marginTop: 32,
    alignItems: "center",
    paddingBottom: 24,
  },
  logoutText: {
    fontSize: 18,
    color: "#B54730",
    fontWeight: "600",
  },
  versionText: {
    marginTop: 6,
    fontSize: 12,
    color: "#A4886B",
  },
});
