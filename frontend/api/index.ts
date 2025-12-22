// frontend/api/index.ts

import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Auto-detect local LAN IP
 */
const hostUri = Constants.expoConfig?.hostUri;
const LAN_IP = hostUri?.split(":")[0] ?? "localhost";

// Prefer explicit override when available (more reliable for Expo Go / builds)
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${LAN_IP}:9000`;

console.log("🌐 Using API_URL:", API_URL);

/**
 * ============================================
 * Token management (key must match signup)
 * ============================================
 */
const TOKEN_KEY = "token";    // Keep consistent with signup key

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * ============================================
 * Main API request helper (with token)
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
