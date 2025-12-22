import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { authApi } from "../api/auth";

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
  useWindowDimensions,
} from "react-native";

export default function Signup() {
  const { height: screenH } = useWindowDimensions();

  // More compact for small screens (e.g., iPhone SE)
  const compact = useMemo(() => screenH < 740, [screenH]);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const minPasswordLength = 6;
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const canSubmit =
    email.trim().length > 0 &&
    password.length >= minPasswordLength &&
    confirm.length > 0 &&
    password === confirm &&
    !loading;

  const handleRegister = async () => {
    if (loading) return;
    if (!email || !password) {
      setError("Please fill in email and password.");
      return;
    }
    if (password.length < minPasswordLength) {
      setError(`Password must be at least ${minPasswordLength} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await authApi.register(email, password);

      if (data?.access_token) {
        await AsyncStorage.setItem("token", data.access_token);
      } else {
        console.warn("Register response missing access_token:", data);
      }

      router.replace("/nickname");
    } catch (err: any) {
      console.error("register error:", err);
      setError(String(err?.message || err));
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
        {/* Illustration */}
        <Image
          source={require("../assets/images/login/bear.png")}
          style={[styles.illustration, compact && styles.illustrationCompact]}
        />

        {/* Title: below image, aligned with Login */}
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
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!loading}
          />
        </View>

        {/* Password */}
        <Text style={[styles.label, { marginTop: compact ? 12 : 14 }]}>
          Password
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#c6b7a6"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) setError(null);
            }}
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmRef.current?.focus()}
            editable={!loading}
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
            ref={confirmRef}
            style={styles.input}
            placeholder="********"
            placeholderTextColor="#c6b7a6"
            secureTextEntry
            value={confirm}
            onChangeText={(value) => {
              setConfirm(value);
              if (error) setError(null);
            }}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            editable={!loading}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Sign Up button */}
        <TouchableOpacity
          style={[
            styles.signUpButton,
            !canSubmit && styles.buttonDisabled,
            compact && { marginTop: 18 },
          ]}
          onPress={handleRegister}
          disabled={!canSubmit}
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
    paddingTop: 56, // Better than 70 for image-first layout
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
  buttonDisabled: {
    opacity: 0.6,
  },
  signUpText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    alignSelf: "flex-start",
    marginTop: 8,
    color: "#B33A3A",
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
