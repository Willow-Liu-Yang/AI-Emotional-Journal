import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "@/i18n";

export default function WelcomePage() {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/welcome/Capy_bath.png")}
        style={styles.illustration}
      />

      <Text style={styles.title}>{t("welcome.title")}</Text>

      <Text style={styles.subtitle}>{t("welcome.subtitle")}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>{t("welcome.button")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9D8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  illustration: {
    width: 260,
    height: 260,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#5A4634",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#5A4634",
    fontSize: 18,
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    backgroundColor: "#9DBA96",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 28,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
