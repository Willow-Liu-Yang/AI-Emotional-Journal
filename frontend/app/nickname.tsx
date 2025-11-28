import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { userApi } from "../api/user";


const API_URL = "http://192.168.31.154:9000";

export default function NicknamePage() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
  if (!nickname.trim()) {
    Alert.alert("Error", "Please enter a nickname.");
    return;
  }

  try {
    setLoading(true);

    // 1. Load the user ID from signup screen
    const userId = await AsyncStorage.getItem("temp_user_id");

    if (!userId) {
      Alert.alert("Error", "Cannot find user ID. Please re-register.");
      return;
    }

    // 2. Use userApi to update nickname (PATCH /users/{id}/username)
    await userApi.updateNickname(Number(userId), nickname);

    // 3. Clear temp user ID
    await AsyncStorage.removeItem("temp_user_id");

    Alert.alert("Success", "Nickname set successfully!");
    router.replace("/login");
  } catch (err: any) {
    console.error("Nickname error:", err);
    Alert.alert("Error", err.message || "Unable to update nickname.");
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
        <Text style={styles.title}>
          What should we{"\n"}call you?
        </Text>

        {/* 图片路径 */}
        <Image
          source={require("../assets/images/login/bear.png")}
          style={styles.illustration}
        />

        <Text style={styles.subtitle}>
          Your nickname makes this space feel{"\n"}more like home.
        </Text>

        <Text style={styles.label}>Nickname</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="How should we call you?"
            placeholderTextColor="#c6b7a6"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: loading ? 0.6 : 1 }]}
          disabled={loading}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          You can always change this later.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#5A4634",
    textAlign: "center",
    marginBottom: 18,
  },
  illustration: {
    width: 240,
    height: 240,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: {
    color: "#5A4634",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 40,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#5A4634",
    marginBottom: 6,
  },
  inputWrapper: {
    width: "100%",
    backgroundColor: "#FFF9F0",
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#CDBAA4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  input: {
    fontSize: 16,
    color: "#5A4634",
  },
  button: {
    width: "100%",
    backgroundColor: "#9DBA96",
    paddingVertical: 14,
    borderRadius: 28,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  footer: {
    marginTop: 12,
    color: "#5A4634",
    fontSize: 14,
  },
});
