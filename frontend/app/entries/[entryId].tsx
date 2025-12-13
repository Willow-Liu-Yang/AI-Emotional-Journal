// app/entries/[entryId].tsx

import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
} from "react-native";

import { entriesApi } from "@/api/entries";
import type { Entry, EntryComment } from "@/api/entries";

// 根据 companion_id 映射头像 + 名字 + 副标题
const COMPANION_UI: Record<number, { name: string; subtitle: string; avatar: any }> =
  {
    1: {
      name: "Luna",
      subtitle: "Warmly listening",
      avatar: require("@/assets/images/profile/luna.png"),
    },
    2: {
      name: "Sol",
      subtitle: "Bright encouragement",
      avatar: require("@/assets/images/profile/sol.png"),
    },
    3: {
      name: "Terra",
      subtitle: "Steady grounding",
      avatar: require("@/assets/images/profile/terra.png"),
    },
  };

export default function EntryDetailScreen() {
  const router = useRouter();
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ 默认收起 Mood Summary
  const [showMoodSummary, setShowMoodSummary] = useState(false);

  const [reflection, setReflection] = useState("");
  const [sending, setSending] = useState(false);

  const [comments, setComments] = useState<EntryComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // 发送按钮缩放动画
  const sendScale = useRef(new Animated.Value(1)).current;

  const onSendPressIn = () => {
    Animated.spring(sendScale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const onSendPressOut = () => {
    Animated.spring(sendScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  // 拉取详情
  useEffect(() => {
    if (!entryId) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await entriesApi.getOne(Number(entryId));
        if (active) setEntry(data);
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load entry.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [entryId]);

  // 拉取评论列表（给自己的留言）
  useEffect(() => {
    if (!entryId) return;

    let active = true;
    (async () => {
      try {
        setCommentsLoading(true);
        const list = await entriesApi.getComments(Number(entryId));
        if (active) setComments(list || []);
      } catch (e) {
        console.log("Failed to load comments:", e);
      } finally {
        if (active) setCommentsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [entryId]);

  // 发送“给自己的留言”
  async function handleSendReflection() {
    const text = reflection.trim();
    if (!text || !entryId) return;

    try {
      setSending(true);
      const newComment = await entriesApi.addComment(Number(entryId), text);
      setComments((prev) => [...prev, newComment]);
      setReflection("");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to add your note.");
    } finally {
      setSending(false);
    }
  }

  // 删除某条留言
  function handleDeleteComment(commentId: number) {
    if (!entryId) return;

    Alert.alert("Delete note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await entriesApi.deleteComment(Number(entryId), commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete note.");
          }
        },
      },
    ]);
  }

  const createdAt = entry ? new Date(entry.created_at) : null;

  const dateLabel =
    createdAt &&
    createdAt
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
      .toUpperCase();

  const timeLabel =
    createdAt &&
    createdAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  // 右上角菜单：分享 + 删除整篇日记
  const handleShare = () => {
    Alert.alert("Share", "Sharing will be available in a later version.");
  };

  const handleDeletePress = () => {
    if (!entry) return;
    Alert.alert("Delete entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await entriesApi.remove(entry.id); // 软删除
            router.back();
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete entry.");
          }
        },
      },
    ]);
  };

  const handleMenuPress = () => {
    if (!entry) return;
    Alert.alert("Entry options", "", [
      { text: "Share", onPress: handleShare },
      { text: "Delete", style: "destructive", onPress: handleDeletePress },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ------- AI 卡片用到的 UI 数据 -------
  const companionId = entry?.ai_reply?.companion_id ?? 1;
  const companionUI = COMPANION_UI[companionId] ?? COMPANION_UI[1];

  return (
    <View style={{ flex: 1, backgroundColor: "#F2E4D2" }}>
      {/* Header：和 write.tsx 一致，但多一行时间 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#6A4A2A" />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.dateText}>{dateLabel ?? ""}</Text>
          <Text style={styles.timeText}>{timeLabel ?? ""}</Text>
        </View>

        {/* 右上角菜单：分享 + 删除 */}
        <TouchableOpacity onPress={handleMenuPress} disabled={!entry}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6A4A2A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#6A4A2A" />
          </View>
        )}

        {error && !loading && (
          <View style={styles.centerBox}>
            <Text style={{ color: "red" }}>{error}</Text>
          </View>
        )}

        {entry && !loading && (
          <>
            {/* 日记内容卡片 */}
            <View style={styles.entryCard}>
              <Text style={styles.entryText}>{entry.content}</Text>
            </View>

            {/* AI 回复卡片（有 ai_reply 才显示） */}
            {entry.ai_reply && (
              <View style={styles.aiCard}>
                <View style={styles.aiHeaderRow}>
                  <View style={styles.aiAvatarWrapper}>
                    <Image
                      source={companionUI.avatar}
                      style={styles.aiAvatarImage}
                    />
                  </View>
                  <View>
                    <Text style={styles.aiName}>{companionUI.name}</Text>
                    <Text style={styles.aiSubtitle}>{companionUI.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.aiText}>{entry.ai_reply.content}</Text>
              </View>
            )}

            {/* Mood Summary 卡片（默认收起） */}
            <View style={styles.moodCard}>
              <TouchableOpacity
                style={styles.moodToggleRow}
                onPress={() => setShowMoodSummary((v) => !v)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={showMoodSummary ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#6A4A2A"
                />
                <Text style={styles.moodToggleText}>Mood Summary</Text>
              </TouchableOpacity>

              {showMoodSummary && (
                <View style={styles.moodContentRow}>
                  <Ionicons
                    name="happy-outline"
                    size={18}
                    color="#6A4A2A"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.moodLine}>
                    {formatEmotionWithIntensity(
                      entry.emotion ?? null,
                      entry.emotion_intensity ?? null
                    )}
                  </Text>
                </View>
              )}
            </View>

            {/* 自己给自己的留言：圆形胶囊输入框 */}
            <View style={styles.reflectionBar}>
              <TextInput
                style={styles.reflectionInput}
                placeholder="Leave a note to yourself..."
                placeholderTextColor="#B08663"
                value={reflection}
                onChangeText={setReflection}
                multiline
              />
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onSendPressIn}
                onPressOut={onSendPressOut}
                onPress={handleSendReflection}
                disabled={sending}
              >
                <Animated.View
                  style={[
                    styles.sendBtn,
                    sending && { opacity: 0.7 },
                    { transform: [{ scale: sendScale }] },
                  ]}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="paper-plane" size={18} color="white" />
                  )}
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* 留言列表 */}
            {commentsLoading && (
              <View style={{ marginTop: 12 }}>
                <ActivityIndicator size="small" color="#6A4A2A" />
              </View>
            )}

            {comments.map((c) => (
              <CommentCard
                key={c.id}
                comment={c}
                onDelete={() => handleDeleteComment(c.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// 把情绪 + 强度变成人类可读
function formatEmotionWithIntensity(
  emotion: string | null,
  intensity: number | null
): string {
  if (!emotion) return "No emotion detected yet";

  const base = emotion.charAt(0).toUpperCase() + emotion.slice(1).toLowerCase();

  if (!intensity) return base;

  let label = "";
  if (intensity === 1) label = "low";
  else if (intensity === 2) label = "medium";
  else if (intensity === 3) label = "high";

  return label ? `${base} · ${label} intensity` : base;
}

// 单条留言卡片
function CommentCard({
  comment,
  onDelete,
}: {
  comment: EntryComment;
  onDelete: () => void;
}) {
  const created = new Date(comment.created_at);
  const dateLabel = created
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
  const timeLabel = created.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeaderRow}>
        <Image
          source={require("@/assets/images/profile/Profile.png")}
          style={styles.commentAvatar}
        />
        <Text style={styles.commentName}>You</Text>

        <View style={styles.commentMetaRow}>
          <Text style={styles.commentTime}>
            {dateLabel}, {timeLabel}
          </Text>
          <TouchableOpacity
            onPress={onDelete}
            style={styles.commentDeleteBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#9B7D5F" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingTop: 70,
    paddingHorizontal: 18,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#5A3E24",
  },
  timeText: {
    marginTop: 4,
    fontSize: 12,
    color: "#9B7D5F",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  centerBox: {
    marginTop: 40,
    alignItems: "center",
  },

  // 日记内容卡片
  entryCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 16,
  },
  entryText: {
    fontSize: 15,
    color: "#4A341E",
    lineHeight: 22,
  },

  // AI 回复
  aiCard: {
    backgroundColor: "#EED8B8",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  aiHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  aiAvatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFDFA4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aiAvatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  aiName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#5A3E24",
  },
  aiSubtitle: {
    fontSize: 12,
    color: "#9B7D5F",
  },
  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4A341E",
    marginTop: 4,
  },

  // Mood Summary 区域（更方）
  moodCard: {
    backgroundColor: "#FAF1E5",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    alignItems: "center",
  },
  moodToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moodToggleText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#5A3E24",
    fontWeight: "500",
    textAlign: "center",
  },
  moodContentRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  moodLine: {
    fontSize: 13,
    color: "#8F7458",
    textAlign: "center",
  },

  // 圆形输入框
  reflectionBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  reflectionInput: {
    flex: 1,
    fontSize: 14,
    color: "#4A341E",
    paddingRight: 10,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7CA073",
    alignItems: "center",
    justifyContent: "center",
  },

  // 留言卡片：和 entryCard 一致风格
  commentCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  commentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  commentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6A4B3C",
  },
  commentMetaRow: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  commentTime: {
    fontSize: 11,
    color: "#9B7D5F",
  },
  commentDeleteBtn: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 999,
  },
  commentText: {
    marginTop: 4,
    fontSize: 14,
    color: "#6A4B3C",
    lineHeight: 20,
  },
});
