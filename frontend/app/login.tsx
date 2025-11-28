import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { authApi } from "../api/auth";



// ⭐ 修改成你的后端地址（用电脑局域网IP，不要用 localhost）
const API_URL = "http://192.168.31.154:9000"; 

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill in both fields.");
    return;
  }

  try {
    // 使用封装好的 authApi.login
    const data = await authApi.login(email, password);

    // token 已在 authApi.login 中自动保存，无需你再保存

    // 跳转到主页面
    router.replace("/(tabs)");

  } catch (err: any) {
    Alert.alert("Login Failed", err.message || "Unable to connect.");
    console.error("Login error:", err);
  }
};


  return (
    <View style={styles.container}>

      {/* 插图 */}
      <Image 
        source={require("../assets/images/login/bear.png")}
        style={styles.illustration}
      />

      <Text style={styles.title}>Welcome back!</Text>

      {/* Email 输入框 */}
      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="#c6b7a6"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password 输入框 */}
      <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
      <View style={styles.inputWrapper}>
        <TextInput 
          style={styles.input}
          placeholder="••••••••••"
          placeholderTextColor="#c6b7a6"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#5a4634" 
          />
        </TouchableOpacity>
      </View>

      {/* Login 按钮 */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Log In</Text>
      </TouchableOpacity>

      {/* Signup 链接 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signup}>Sign Up</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9D8",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  illustration: {
    width: 240,
    height: 240,
    resizeMode: "contain",
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#5A4634",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    color: "#5A4634",
    fontSize: 16,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    marginTop: 28,
  },
  loginText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
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
  }
});
