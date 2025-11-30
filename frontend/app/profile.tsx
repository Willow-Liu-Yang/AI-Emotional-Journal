import { authApi } from "@/api/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

  if (!user) return <View style={styles.container}><Text>Loading...</Text></View>;

  const joinDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const companion = user.companion; // Luna / Sol / Terra

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Profile</Text>

      {/* Avatar */}
      <View style={styles.center}>
        <Image
          source={require("@/assets/images/profile/Profile.png")}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user.username || "User"}</Text>
        <Text style={styles.joinDate}>Joined {joinDate}</Text>
      </View>

      {/* Edit Profile */}
      <TouchableOpacity
        style={styles.section}
        onPress={() => router.push("/profile/edit")}
      >
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.link}>Edit</Text>
      </TouchableOpacity>

      {/* AI Companion */}
      <TouchableOpacity
        style={[styles.companionCard, { backgroundColor: companion?.theme_color || "#eee" }]}
        onPress={() => router.push("/profile/companion")}
      >
        <View>
          <Text style={styles.companionName}>{companion?.name}</Text>
          <Text style={styles.companionTitle}>{companion?.identity_title}</Text>

          <View style={styles.tagRow}>
            {companion?.tags?.map((t: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 占位 AI 图片 */}
        <Image
          source={require("@/assets/images/profile/luna.png")} // 你之后替换
          style={styles.companionImg}
        />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={async () => {
          await authApi.logout();
          router.replace("/login");
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


// ---------- STYLE ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 22,
    backgroundColor: "white",
  },
  center: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
  },
  joinDate: {
    color: "#777",
    marginTop: 4,
  },

  section: {
    marginTop: 20,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    fontSize: 16,
    color: "#6C63FF",
  },

  companionCard: {
    marginTop: 25,
    padding: 20,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  companionName: {
    fontSize: 22,
    fontWeight: "700",
  },
  companionTitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#555",
    maxWidth: 180,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  companionImg: {
    width: 80,
    height: 80,
  },

  logoutBtn: {
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
