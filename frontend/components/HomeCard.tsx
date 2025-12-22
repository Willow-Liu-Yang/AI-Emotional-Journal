import { Image, Text, TouchableOpacity, StyleSheet, View } from "react-native";

export interface HomeCardProps {
  icon: any;
  title: string;
  text: string;
  background: string;
  onPress?: () => void;
}

export function HomeCard({
  icon,
  title,
  text,
  background,
  onPress,
}: HomeCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: background }]}
    >
      {/* Row: icon + title */}
      <View style={styles.row}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Text on next line */}
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 18,
    minHeight: 150,
    justifyContent: "flex-start",
  },

  // Horizontal layout: icon + title
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  icon: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: "contain",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4A3828",
  },

  text: {
    fontSize: 14,
    color: "#7A6A54",
    lineHeight: 20,
  },
});
