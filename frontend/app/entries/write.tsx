// app/entries/write.tsx

import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Keyboard,
  Switch,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";

import { entriesApi } from "@/api/entries";
import { useI18n } from "@/i18n";
import { insightsApi } from "@/api/insights";

// ===== prompt data (must cover all incoming promptKey) =====
const PROMPT_ICONS: Record<string, any> = {
  capture_joy: require("@/assets/images/icons/prompt/capture_joy.png"),
  let_it_out: require("@/assets/images/icons/prompt/let_it_out.png"),
  warm_moments: require("@/assets/images/icons/prompt/warm_moments.png"),
  steps_forward: require("@/assets/images/icons/prompt/steps_forward.png"),
  reflect_grow: require("@/assets/images/icons/prompt/reflect_grow.png"),
  rest_gently: require("@/assets/images/icons/prompt/rest_gently.png"),
};

export default function WriteScreen() {
  const router = useRouter();
  const { language, t } = useI18n();

  // promptKey from Home/PromptLibrary
  const { promptKey } = useLocalSearchParams<{ promptKey?: string }>();
  const prompts: Record<string, { icon: any; text: string }> = {
    capture_joy: {
      icon: PROMPT_ICONS.capture_joy,
      text: t("prompt.capture_joy.desc"),
    },
    let_it_out: {
      icon: PROMPT_ICONS.let_it_out,
      text: t("prompt.let_it_out.desc"),
    },
    warm_moments: {
      icon: PROMPT_ICONS.warm_moments,
      text: t("prompt.warm_moments.desc"),
    },
    steps_forward: {
      icon: PROMPT_ICONS.steps_forward,
      text: t("prompt.steps_forward.desc"),
    },
    reflect_grow: {
      icon: PROMPT_ICONS.reflect_grow,
      text: t("prompt.reflect_grow.desc"),
    },
    rest_gently: {
      icon: PROMPT_ICONS.rest_gently,
      text: t("prompt.rest_gently.desc"),
    },
  };
  const promptData = promptKey ? prompts[promptKey] : null;

  const [content, setContent] = useState("");
  const [needAI, setNeedAI] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) {
      alert(t("write.alertEmpty"));
      return;
    }

    try {
      setLoading(true);

      // Backend only needs content + need_ai_reply
      await entriesApi.create({
        content,
        need_ai_reply: needAI,
      });

      void insightsApi.refreshToday("week");
      void insightsApi.refreshToday("month");
      router.replace("/(tabs)/journal");
    } catch (err: any) {
      alert(err.message || t("write.alertSaveError"));
    } finally {
      setLoading(false);
    }
  }

  const todayLabel = new Date()
    .toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: "#F2E4D2" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Tap outside editor to dismiss keyboard (not wrapping bottom bar) */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

            {/* Editor area: flex:1 fills space above bottom bar */}
            <View style={styles.editorCard}>
              <TextInput
                style={styles.editorInput}
                placeholder={t("write.placeholder")}
                placeholderTextColor="#B08663"
                multiline
                scrollEnabled={true}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* Add some space between editor and bottom bar */}
            <View style={{ height: 10 }} />
          </View>
        </TouchableWithoutFeedback>

        {/* Bottom Bar: in normal layout, real height; lifts with keyboard */}
        <View style={styles.bottomBar}>
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>{t("write.aiFeedback")}</Text>
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
            <Text style={styles.doneText}>
              {loading ? t("write.saving") : t("write.done")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  // Key: let editor fill remaining height (up to Bottom Bar)
  editorCard: {
    flex: 1,
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
