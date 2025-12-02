// components/HomeCard.tsx
import { Image, StyleSheet, Text, View } from "react-native";

type HomeCardProps = {
  icon: any;
  title: string;
  text: string;
  background: string;
};

export function HomeCard({ icon, title, text, background }: HomeCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: background }]}>
      {/* 图标 + 标题一行 */}
      <View style={styles.headerRow}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* 描述文字 */}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%", // 具体宽度由外层控制（用于 peek 效果）
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A3828",
    marginLeft: 10,
  },
  text: {
    fontSize: 14,
    color: "#7A6A54",
  },
});
