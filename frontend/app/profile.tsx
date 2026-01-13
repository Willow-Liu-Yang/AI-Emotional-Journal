import { authApi } from "@/api/auth";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Companion } from "@/api/companions"; // Reuse type
import { useI18n } from "@/i18n";

// ---------- types ----------
type SettingsItem = {
  key: string;
  label: string;
  icon: any;
  route?: string;
};

// Approx structure returned by /users/me
type CurrentUser = {
  id: number;
  username?: string | null;
  email: string;
  created_at: string;
  companion?: Companion | null;
};

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
  const { language, t } = useI18n();
  const [user, setUser] = useState<CurrentUser | null>(null);

  // Refresh /users/me whenever the screen gains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadUser() {
        try {
          const data = await authApi.getCurrentUser();
          if (active) {
            setUser(data as CurrentUser);
          }
        } catch (err) {
          console.log("Failed to load user:", err);
        }
      }

      loadUser();

      return () => {
        active = false;
      };
    }, [])
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t("profile.loading")}</Text>
      </View>
    );
  }

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(
        language === "zh" ? "zh-CN" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )
    : "";

  const companion = user.companion || null;

  const companionTags =
    companion?.tags && companion.tags.length > 0
      ? companion.tags
      : [
          t("companion.tag.gentle"),
          t("companion.tag.insightful"),
          t("companion.tag.calming"),
        ];

  const settingsItems: SettingsItem[] = [
    {
      key: "notification",
      label: t("profile.settings.notification"),
      icon: require("@/assets/images/profile/icon_notification.png"),
      route: "/settings/notification",
    },
    {
      key: "language",
      label: t("profile.settings.language"),
      icon: require("@/assets/images/profile/icon_language.png"),
      route: "/settings/language",
    },
    {
      key: "theme",
      label: t("profile.settings.theme"),
      icon: require("@/assets/images/profile/icon_theme.png"),
      route: "/settings/theme",
    },
    {
      key: "privacy",
      label: t("profile.settings.privacy"),
      icon: require("@/assets/images/profile/icon_privacy.png"),
      route: "/settings/privacy",
    },
    {
      key: "help",
      label: t("profile.settings.help"),
      icon: require("@/assets/images/profile/icon_help.png"),
      route: "/settings/help",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Top header: background matches page background */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* Left close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
          >
            <Image
              source={require("@/assets/images/profile/icon_close_capy.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t("profile.title")}</Text>

          {/* Right placeholder to center title */}
          <View style={{ width: 48 }} />
        </View>
      </View>

      {/* Character section: full-width color band */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require("@/assets/images/profile/Profile.png")}
              style={styles.avatarImg}
            />
          </View>

          <View style={styles.profileText}>
            <View style={styles.nameRow}>
              <Text style={styles.usernameText}>
                {user.username || t("profile.userFallback")}
              </Text>

              <TouchableOpacity
                style={styles.editIconBtn}
                onPress={() => router.push("/profile/edit")}
              >
                <Ionicons name="pencil" size={18} color="#7E5F42" />
              </TouchableOpacity>
            </View>

            {joinDate ? (
              <Text style={styles.joinText}>
                {t("profile.joinedOn", { date: joinDate })}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Content area */}
      <View style={styles.content}>
        {/* AI Companion card */}
        <TouchableOpacity
          style={[
            styles.companionCard,
            companion?.theme_color
              ? { backgroundColor: companion.theme_color }
              : null,
          ]}
          onPress={() => router.push("/profile/companion")}
        >
          {/* Top row: avatar + text, arrow aligned with name */}
          <View style={styles.companionTopRow}>
            <View style={styles.companionAvatarWrapper}>
              <Image
                source={getCompanionImage(companion?.name)}
                style={styles.companionAvatar}
              />
            </View>

          <View style={styles.companionTextWrapper}>
              <Text style={styles.companionSectionTitle}>
                {t("profile.companion")}
              </Text>

              <View style={styles.companionNameRow}>
                <Text
                  style={styles.companionNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {companion?.name || "Luna"}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#7E5F42"
                />
              </View>

              <Text
                style={styles.companionSubtitleText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {companion?.identity_title || t("profile.companionFallbackTitle")}
              </Text>
            </View>
          </View>

          {/* Bottom row: tags, full-width */}
          <View style={styles.tagRow}>
            {companionTags.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Settings list */}
        <View style={styles.menuSection}>
          {settingsItems.map((item) => (
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

        {/* Logout + version */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={async () => {
              await authApi.logout();
              router.replace("/login");
            }}
          >
            <Text style={styles.logoutText}>{t("profile.logout")}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>{t("profile.version")}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7E7D3", // Page background
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7E7D3",
  },

  // Top header: only title, background uses page color
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: "#F7E7D3",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
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

  // Character area: full-width band, slightly taller
  profileSection: {
    backgroundColor: "#EBCDA3",
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 26, // Make it a bit taller
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    width: 88,              // Larger avatar
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#D7A871",
    backgroundColor: "#F9EAD8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarImg: {
    width: 72,
    height: 72,
    resizeMode: "cover",
  },
  profileText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  usernameText: {
    fontSize: 26,          // Slightly larger text
    fontWeight: "700",
    color: "#4A2C22",
  },
  editIconBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 999,
  },
  joinText: {
    marginTop: 6,
    fontSize: 15,          // Slightly larger text
    color: "#7E5F42",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,        // Add spacing from character area
  },

  companionCard: {
    borderRadius: 22,
    backgroundColor: "#DADFEA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  // Top row: avatar + text
  companionTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  companionAvatarWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: "hidden",
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "space-between", // Name left, arrow right
  },
  companionNameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A2C22",
    marginRight: 8,
    flexShrink: 1,
  },
  companionSubtitleText: {
    marginTop: 4,
    fontSize: 14,
    color: "#7E5F42",
  },

  // Bottom row: tags
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
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
