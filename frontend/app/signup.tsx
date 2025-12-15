import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { authApi } from "../api/auth";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function Signup() {
  const { height: screenH } = useWindowDimensions();

  // 小屏（例如 iPhone SE）更紧凑一些
  const compact = useMemo(() => screenH < 740, [screenH]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in email and password.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await authApi.register(email, password);

      if (data?.access_token) {
        await AsyncStorage.setItem("token", data.access_token);
      } else {
        console.warn("Register response missing access_token:", data);
      }

      router.replace("/nickname");
    } catch (err: any) {
      console.error("register error:", err);
      Alert.alert("Registration failed", String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 6 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          compact ? styles.containerCompact : null,
        ]}
      >
        {/* 插图 */}
        <Image
          source={require("../assets/images/login/bear.png")}
          style={[styles.illustration, compact && styles.illustrationCompact]}
        />

        {/* 标题：放在图片下面，和 Login 对齐 */}
        <Text style={[styles.headerText, compact && styles.headerTextCompact]}>
          Let&apos;s get cozy.
        </Text>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#c6b7a6"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password */}
        <Text style={[styles.label, { marginTop: compact ? 12 : 14 }]}>
          Password
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#c6b7a6"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#5A4634"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={[styles.label, { marginTop: compact ? 12 : 14 }]}>
          Confirm Password
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#c6b7a6"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />
        </View>

        {/* Sign Up button */}
        <TouchableOpacity
          style={[
            styles.signUpButton,
            { opacity: loading ? 0.7 : 1 },
            compact && { marginTop: 18 },
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6E9D8",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 56, // 比之前 70 更适合“先图后标题”的结构
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  containerCompact: {
    paddingTop: 44,
    paddingBottom: 28,
  },

  illustration: {
    width: 210,
    height: 210,
    resizeMode: "contain",
    marginBottom: 10,
  },
  illustrationCompact: {
    width: 175,
    height: 175,
    marginBottom: 8,
  },

  headerText: {
    width: "100%",
    fontSize: 30,
    fontWeight: "700",
    color: "#5A4634",
    textAlign: "center",
    marginBottom: 16,
  },
  headerTextCompact: {
    fontSize: 28,
    marginBottom: 12,
  },

  label: {
    alignSelf: "flex-start",
    color: "#5A4634",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 6,
  },

  inputWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#CDBAA4",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#5A4634",
  },

  signUpButton: {
    width: "100%",
    backgroundColor: "#9DBA96",
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 22,
    alignItems: "center",
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
  },
  footerText: {
    color: "#5A4634",
  },
  loginLink: {
    color: "#5A4634",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginLeft: 6,
  },
});
