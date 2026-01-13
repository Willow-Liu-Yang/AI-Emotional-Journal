import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n";

export default function LanguageSettings() {
  const router = useRouter();
  const { language, setLanguage, t } = useI18n();

  const options = [
    {
      key: "en",
      title: t("language.option.en.title"),
      desc: t("language.option.en.desc"),
    },
    {
      key: "zh",
      title: t("language.option.zh.title"),
      desc: t("language.option.zh.desc"),
    },
  ] as const;

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
          <Text style={styles.headerTitle}>{t("language.title")}</Text>
          <View style={{ width: 48 }} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.subtitleCard}>
          <Text style={styles.subtitleText}>{t("language.subtitle")}</Text>
        </View>

        <View style={styles.optionCard}>
          {options.map((opt) => {
            const selected = language === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionRow, selected && styles.optionRowSelected]}
                onPress={() => setLanguage(opt.key)}
                activeOpacity={0.85}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    selected && styles.radioOuterSelected,
                  ]}
                >
                  {selected && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  subtitleCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 16,
  },
  subtitleText: {
    color: "#7E5F42",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  optionCard: {
    backgroundColor: "#FFF9F0",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  optionRowSelected: {
    backgroundColor: "#F1E3D1",
  },
  optionLeft: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4A2C22",
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: "#7E5F42",
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#CDBAA4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioOuterSelected: {
    backgroundColor: "#7CA073",
    borderColor: "#7CA073",
  },
});
