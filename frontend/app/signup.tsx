import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";



export default function Signup() {
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

    // call API wrapper
    const data = await authApi.register(email, password);

    // save user id for nickname page
    await AsyncStorage.setItem("temp_user_id", String(data.id));

    // navigate to nickname page
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
      style={{ flex: 1, backgroundColor: "#F6E9D8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerText}>Let&apos;s get cozy.</Text>

        {}
        <Image
          source={require("../assets/images/login/bear.png")}
          style={styles.illustration}
        />

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
        <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
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
        <Text style={[styles.label, { marginTop: 14 }]}>Confirm Password</Text>
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
          style={[styles.signUpButton, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Footer: already have account */}
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerText: {
    width: "100%",
    fontSize: 36,
    fontWeight: "700",
    color: "#5A4634",
    textAlign: "center",
    marginBottom: 6,
  },
  illustration: {
    width: 220,
    height: 220,
    resizeMode: "contain",
    marginBottom: 10,
  },
  label: {
    alignSelf: "flex-start",
    color: "#5A4634",
    fontSize: 16,
    marginTop: 8,
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
