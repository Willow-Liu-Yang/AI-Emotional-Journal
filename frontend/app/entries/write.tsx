// app/entries/write.tsx

import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Animated,
  Keyboard,
  Switch,
  Image,
  Dimensions,
} from "react-native";

import { entriesApi } from "@/api/entries";

// ===== 动态高度 =====
const SCREEN_HEIGHT = Dimensions.get("window").height;

// 无 prompt 时输入区 ~40% 屏幕
const EDITOR_HEIGHT_NO_PROMPT = SCREEN_HEIGHT * 0.40;

// 有 prompt 时输入区 ~33% 屏幕
const EDITOR_HEIGHT_WITH_PROMPT = SCREEN_HEIGHT * 0.33;

// ===== prompt 数据 =====
const PROMPTS: Record<string, { icon: any; text: string }> = {
  capture_joy: {
    icon: require("@/assets/images/icons/prompt/capture_joy.png"),
    text: "What little moment brought you joy today?",
  },
  let_it_out: {
    icon: require("@/assets/images/icons/prompt/let_it_out.png"),
    text: "What feelings have been quietly rising inside you?",
  },
  steps_forward: {
    icon: require("@/assets/images/icons/prompt/steps_forward.png"),
    text: "What small step did you take toward something important?",
  },
};

export default function WriteScreen() {
  const router = useRouter();

  // 首页传过来的 promptKey
  const { promptKey } = useLocalSearchParams<{ promptKey?: string }>();
  const promptData = promptKey ? PROMPTS[promptKey] : null;

  const [content, setContent] = useState("");
  const [needAI, setNeedAI] = useState(true);
  const [loading, setLoading] = useState(false);

  // bottom bar 动画
  const bottomAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(bottomAnim, {
        toValue: e.endCoordinates.height - 10,
        duration: 260,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  async function handleSubmit() {
    if (!content.trim()) {
      alert("Please write something first.");
      return;
    }

    try {
      setLoading(true);

      // ✅ 关键修复：后端不再接收 emotion / emotion_intensity
      // 只传 content + need_ai_reply
      await entriesApi.create({
        content,
        need_ai_reply: needAI,
      });

      router.back();
    } catch (err: any) {
      alert(err.message || "Failed to save entry.");
    } finally {
      setLoading(false);
    }
  }

  const todayLabel = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: "#F2E4D2" }}>
      {/* TOP区域 */}
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#6A4A2A" />
          </TouchableOpacity>

          <Text style={styles.dateText}>{todayLabel}</Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Prompt card */}
        {promptData && (
          <View style={styles.promptCard}>
            <Image source={promptData.icon} style={styles.promptIcon} />
            <Text style={styles.promptText}>{promptData.text}</Text>
          </View>
        )}

        {/* 动态高度编辑区域 */}
        <View
          style={[
            styles.editorCard,
            {
              height: promptData ? EDITOR_HEIGHT_WITH_PROMPT : EDITOR_HEIGHT_NO_PROMPT,
            },
          ]}
        >
          <TextInput
            style={styles.editorInput}
            placeholder="Write about your day..."
            placeholderTextColor="#B08663"
            multiline
            scrollEnabled={true} // ★ 内部滚动
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Bottom Bar */}
      <Animated.View style={[styles.bottomBar, { bottom: bottomAnim }]}>
        <View style={styles.aiRow}>
          <Text style={styles.aiLabel}>AI Feedback</Text>
          <Switch
            value={needAI}
            onValueChange={setNeedAI}
            thumbColor={Platform.OS === "android" ? "white" : undefined}
            trackColor={{ false: "#D0C2B5", true: "#82A277" }}
          />
        </View>

        <TouchableOpacity
          style={[styles.doneBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="checkmark" size={18} color="white" />
          <Text style={styles.doneText}>{loading ? "Saving..." : "Done"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 18,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#5A3E24",
  },

  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EED8B8",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  promptIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },

  promptText: {
    flex: 1,
    fontSize: 14,
    color: "#5F4324",
    lineHeight: 20,
  },

  editorCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  editorInput: {
    flex: 1,
    fontSize: 15,
    color: "#4A341E",
    padding: 0,
    lineHeight: 22,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderTopWidth: 1,
    borderTopColor: "#E6E0D6",
  },

  aiRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiLabel: {
    fontSize: 15,
    color: "#6A4A2A",
    marginRight: 10,
  },

  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7CA073",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },

  doneText: {
    color: "white",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "700",
  },
});
