import { authApi } from "@/api/auth";
import { userApi } from "@/api/user";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await authApi.getCurrentUser();
        if (!mounted) return;
        setUser(data);
        setNickname(data?.username ?? "");
      } catch (err) {
        console.log("Failed to load user", err);
        Alert.alert(
          "Error",
          "Unable to load your profile. Please try again later."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  function validateName(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return "Nickname cannot be empty.";
    if (trimmed.length < 2) return "Nickname must be at least 2 characters.";
    if (trimmed.length > 30) return "Nickname cannot exceed 30 characters.";
    return null;
  }

  async function onSave() {
    setError(null);
    const v = validateName(nickname);
    if (v) {
      setError(v);
      return;
    }
    if (!user) {
      Alert.alert("Error", "User not found.");
      return;
    }

    setSubmitting(true);
    try {
      await userApi.updateNickname(nickname.trim());
      Alert.alert("Success", "Your nickname has been updated.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.log("Failed to update nickname", err);
      const msg = err?.message || "Failed to save changes. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#6A4A2A" />
        <Text style={{ marginTop: 12, color: "#6A4A2A" }}>
          Loading profile…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top: header consistent with Profile */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Image
              source={require("@/assets/images/profile/icon_close_capy.png")}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <View style={{ width: 48 }} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your nickname"
            placeholderTextColor="#B08A68"
            style={[
              styles.input,
              error ? { borderColor: "#D16A5A", backgroundColor: "#FFF4F2" } : null,
            ]}
            editable={!submitting}
            maxLength={30}
            returnKeyType="done"
            autoCorrect={false}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
          onPress={onSave}
          disabled={submitting}
          activeOpacity={0.9}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={submitting}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7E7D3",
  },

  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7E7D3",
  },

  // Top header
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

  // Content area
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  formCard: {
    backgroundColor: "#F8F2EA",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  label: {
    fontSize: 14,
    color: "#7E5F42",
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0C8AA",
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#4A2C22",
  },

  errorText: {
    marginTop: 8,
    color: "#D16A5A",
    fontSize: 13,
  },

  saveBtn: {
    marginTop: 26,
    backgroundColor: "#7CA073", // Same as journal send button color
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#7E5F42",
    fontSize: 15,
  },
});
