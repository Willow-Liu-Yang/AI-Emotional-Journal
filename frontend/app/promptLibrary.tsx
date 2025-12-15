// app/promptLibrary.tsx  (或 app/promptLibrary/index.tsx)

import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PromptItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
};

const PROMPTS: PromptItem[] = [
  {
    id: "capture_joy",
    title: "Capture Joy",
    description: "What little moment brought you joy today?",
    icon: require("@/assets/images/icons/prompt/capture_joy.png"),
  },
  {
    id: "let_it_out",
    title: "Let It Out",
    description: "What feelings have been quietly rising inside you?",
    icon: require("@/assets/images/icons/prompt/let_it_out.png"),
  },
  {
    id: "warm_moments",
    title: "Warm Moments",
    description: "What made you feel warm, safe, or comforted today?",
    icon: require("@/assets/images/icons/prompt/warm_moments.png"),
  },
  {
    id: "steps_forward",
    title: "Steps Forward",
    description: "What small step did you take toward something important?",
    icon: require("@/assets/images/icons/prompt/steps_forward.png"),
  },
  {
    id: "reflect_grow",
    title: "Reflect & Grow",
    description: "What did you learn about yourself today?",
    icon: require("@/assets/images/icons/prompt/reflect_grow.png"),
  },
  {
    id: "rest_gently",
    title: "Rest Gently",
    description: "What helped your body or mind rest today?",
    icon: require("@/assets/images/icons/prompt/rest_gently.png"),
  },
];

function PromptRow({
  item,
  onPress,
}: {
  item: PromptItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.rowCard}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Image source={item.icon} style={styles.icon} />
        </View>
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PromptLibraryScreen() {
  const router = useRouter();

  const handleSelect = (promptKey: string) => {
    router.push({
      pathname: "/entries/write",
      params: { promptKey },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#5A4634" />
          </TouchableOpacity>

          <Text style={styles.title}>All Prompts</Text>

          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* ✅ Hint */}
        <Text style={styles.hint}>Tap a prompt to start writing.</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {PROMPTS.map((item) => (
            <PromptRow
              key={item.id}
              item={item}
              onPress={() => handleSelect(item.id)}
            />
          ))}

          <View style={{ height: 10 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5EAD9",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5EAD9",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 6,
  },
  backButton: {
    padding: 6,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#5A4634",
  },
  headerRightPlaceholder: {
    width: 36,
  },

  // ✅ Hint line under title
  hint: {
    fontSize: 13,
    color: "#7A6A54",
    textAlign: "center",
    marginBottom: 12,
  },

  scrollContent: {
    paddingBottom: 12,
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF1E5",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  rowLeft: {
    marginRight: 12,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "rgba(227, 214, 199, 0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#4A3828",
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 14,
    lineHeight: 18,
    color: "#7A6A54",
  },
});
