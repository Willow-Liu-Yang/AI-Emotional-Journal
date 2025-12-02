import React, { useState } from "react";
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
    description:
      "What small step did you take toward something important?",
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

// 专门给 Prompt Library 用的小卡片
function PromptCard({
  item,
  selected,
  onPress,
}: {
  item: PromptItem;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.cardWrapper,
        selected && styles.cardWrapperActive,
      ]}
    >
      <View style={styles.card}>
        <Image source={item.icon} style={styles.cardIcon} />

        {/* 小标题：比首页小一点 */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* 描述：字体稍微大一点，最多 3 行，基本都能放下 */}
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PromptLibraryScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (item: PromptItem) => {
    setSelectedId(item.id);
    // 之后在这里跳到写作页并带上 prompt
    // router.push({ pathname: "/write", params: { promptId: item.id } });
  };

  return (
    <View style={styles.container}>
      {/* 顶部标题 + 返回 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#5A4634" />
        </TouchableOpacity>

        {/* All Prompts：字号调小一点，看起来没那么“压”住下面 */}
        <Text style={styles.title}>All Prompts</Text>

        {/* 占位，让标题居中 */}
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* 内容区：2 列网格 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {PROMPTS.map((item) => (
            <PromptCard
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onPress={() => handleSelect(item)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

//
// ─── Styles ─────────────────────────────────────────────
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EAD9",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  backButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,          // ⭐ 比原来的 28 小一点
    fontWeight: "700",
    color: "#5A4634",
  },
  headerRightPlaceholder: {
    width: 28,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,     // 底部留少一点空
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  // 外层：控制大小 + 选中高亮
  cardWrapper: {
    width: "48%",          // 两列
    marginBottom: 14,
    borderRadius: 26,
    padding: 3,
  },
  cardWrapperActive: {
    borderWidth: 3,
    borderColor: "#3A7BFF",
  },

  // 内层：固定高度，让 6 个卡片基本填满屏幕
  card: {
    height: 185,           // ⭐ 比之前高一点，给文字更多空间
    borderRadius: 23,
    backgroundColor: "#FAF1E5",
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cardIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,          // ⭐ 小标题再小一点
    fontWeight: "700",
    color: "#4A3828",
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 6,
  },
  cardDesc: {
    fontSize: 13,          // ⭐ 描述略大一点，方便阅读
    color: "#7A6A54",
    textAlign: "center",
    marginTop: 6,
    marginHorizontal: 6,
  },
});
