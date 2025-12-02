// frontend/api/index.ts

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ============================================
 *  自动检测本机的局域网 IP（适用于 Expo）
 *  e.g. hostUri = "192.168.31.27:8081"
 *  自动取出前半部分 → "192.168.31.27"
 * ============================================
 */
const hostUri = Constants.expoConfig?.hostUri;
const LAN_IP = hostUri?.split(":")[0] ?? "localhost";

/**
 * ============================================
 *  全局统一后端 API 地址
 *  不需要手动改 IP，自动识别
 *  e.g. http://192.168.31.27:9000
 * ============================================
 */
export const API_URL = `http://${LAN_IP}:9000`;

console.log("🌐 Using API_URL:", API_URL);

/**
 * ============================================
 *  Token 管理
 * ============================================
 */
const TOKEN_KEY = "access_token";

/** Save token */
export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/** Get stored token */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/** Remove stored token */
export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * ============================================
 *  全局主请求方法 apiRequest
 *  - 自动附加 token
 *  - 自动解析 json
 *  - 非 200 自动抛出错误
 * ============================================
 */
export async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const txt = await resp.text().catch(() => "");
  let body = null;

  try {
    body = txt ? JSON.parse(txt) : null;
  } catch {
    body = txt;
  }

  if (!resp.ok) {
    const msg = body?.detail || body?.message || body || `HTTP ${resp.status}`;
    throw new Error(msg);
  }

  return body;
}
