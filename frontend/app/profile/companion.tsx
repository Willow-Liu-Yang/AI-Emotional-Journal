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

import { authApi } from "@/api/auth";
import { apiRequest } from "@/api/index";

// Dynamic image map with fallback
const companionImages: Record<string, any> = {
  luna: require("@/assets/images/profile/luna.png"),   // replace later
  sol: require("@/assets/images/profile/sol.png"),
  terra: require("@/assets/images/profile/terra.png"),
};

interface Companion {
  id: number;
  name: string;
  identity_title: string;
  description: string;
  tags: string[];
  avatar_key?: string;
  theme_color?: string;
}

export default function CompanionSelectScreen() {
  const router = useRouter();

  const [companions, setCompanions] = useState<Companion[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user + companion list
  useEffect(() => {
    async function load() {
      try {
        const user = await authApi.getCurrentUser();
        setCurrent(user?.companion?.id ?? null);

        const list = await apiRequest("/companions/", { method: "GET" });
        setCompanions(list);
      } catch (err) {
        console.log("Load error:", err);
        Alert.alert("Error", "Failed to load AI companions.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function selectCompanion(id: number) {
    if (saving) return;

    setSaving(true);
    try {
      await apiRequest("/companions/select", {
        method: "POST",
        body: JSON.stringify({ companion_id: id }),
      });

      setCurrent(id);

      Alert.alert("Success", "Your AI Companion has been updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log("Select error:", err);
      Alert.alert("Error", "Failed to update your AI Companion.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading companions…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My AI Companion</Text>
      <Text style={styles.subtitle}>
        Choose the listener who understands you best.
      </Text>

      {companions.map((c) => {
        const img = companionImages[c.avatar_key || ""] ||
                    require("@/assets/images/profile/luna.png");

        return (
          <TouchableOpacity
            key={c.id}
            style={[styles.card, { backgroundColor: c.theme_color || "#eee" }]}
            onPress={() => selectCompanion(c.id)}
            disabled={saving}
          >
            <Image source={img} style={styles.avatar} />

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {c.name} · {c.identity_title}
              </Text>
              <Text style={styles.desc}>{c.description}</Text>

              <View style={styles.tagsRow}>
                {c.tags.map((t, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {current === c.id && <Text style={styles.checkmark}>✔</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 22,
    backgroundColor: "white",
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    color: "#555",
    fontSize: 14,
  },

  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 22,
    marginBottom: 18,
    alignItems: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    marginBottom: 8,
    color: "#444",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },

  checkmark: {
    fontSize: 24,
    marginLeft: 10,
    fontWeight: "bold",
    color: "#444",
  },
});
