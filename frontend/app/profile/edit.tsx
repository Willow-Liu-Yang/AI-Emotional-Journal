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
        Alert.alert("Error", "Unable to load your profile. Please try again later.");
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
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nickname</Text>
          <TextInput
            value={nickname}
            onChangeText={(t) => setNickname(t)}
            placeholder="Enter your nickname"
            style={[styles.input, error ? { borderColor: "#FF6B6B" } : null]}
            editable={!submitting}
            maxLength={30}
            returnKeyType="done"
            autoCorrect={false}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, submitting ? { opacity: 0.7 } : null]}
          onPress={onSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
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

//
// ---------- STYLE ----------
const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 22,
    backgroundColor: "white",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
  },

  form: {
    marginTop: 8,
  },

  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  errorText: {
    marginTop: 8,
    color: "#FF6B6B",
    fontSize: 13,
  },

  saveBtn: {
    marginTop: 30,
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 15,
  },
});
