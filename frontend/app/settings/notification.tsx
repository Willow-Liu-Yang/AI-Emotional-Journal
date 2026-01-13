import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n";

export default function NotificationSettings() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Image
              source={require("@/assets/images/profile/icon_close_capy.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("settings.notification.title")}</Text>
          <View style={{ width: 48 }} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>{t("common.comingSoon")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7E7D3",
  },
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
    fontSize: 22,
    fontWeight: "700",
    color: "#4A2C22",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  placeholderCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  placeholderText: {
    color: "#7E5F42",
    fontSize: 15,
  },
});
