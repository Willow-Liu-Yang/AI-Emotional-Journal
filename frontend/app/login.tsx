import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "../api/auth";
import { insightsApi } from "../api/insights";
import { timeCapsuleApi } from "../api/timeCapsule";
import { useI18n } from "@/i18n";

export default function LoginScreen() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      setError(t("login.errorMissing"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authApi.login(email.trim(), password);
      void insightsApi.preloadToday("week");
      void insightsApi.preloadToday("month");
      void timeCapsuleApi.preloadToday();
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || t("login.errorUnable"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        // Add a small offset on iOS to avoid overlap
        keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Illustration */}
            <Image
              source={require("../assets/images/login/bear.png")}
              style={styles.illustration}
            />

            <Text style={styles.title}>{t("login.title")}</Text>

            {/* Email */}
            <Text style={styles.label}>{t("login.emailLabel")}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder={t("login.emailPlaceholder")}
                placeholderTextColor="#c6b7a6"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!loading}
                // More standard autofill (varies by platform but harmless)
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <Text style={[styles.label, styles.passwordLabel]}>
              {t("login.passwordLabel")}
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder={t("login.passwordPlaceholder")}
                placeholderTextColor="#c6b7a6"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                editable={!loading}
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#5a4634"
                />
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginButton, !canSubmit && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>{t("login.button")}</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("login.footerPrompt")} </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.signup}>{t("login.footerAction")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  safeArea: {
    flex: 1,
    backgroundColor: "#F6E9D8",
  },

  // Key: flexGrow keeps large screens from collapsing and allows small screens to scroll
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24, // Leave some space at bottom when keyboard shows
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    justifyContent: "flex-start",
  },

  illustration: {
    width: 240,
    height: 240,
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 6,
  },

  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#5A4634",
    textAlign: "center",
    marginBottom: 18,
  },

  label: {
    color: "#5A4634",
    fontSize: 16,
    marginBottom: 6,
  },
  passwordLabel: {
    marginTop: 14,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    borderWidth: 2,
    borderColor: "#CDBAA4",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#5A4634",
  },

  loginButton: {
    backgroundColor: "#9DBA96",
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 22,
    alignItems: "center",
  },
  loginText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    alignSelf: "flex-start",
    marginTop: 8,
    color: "#B33A3A",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#5A4634",
  },
  signup: {
    color: "#5A4634",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
