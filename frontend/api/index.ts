// frontend/api/index.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

//export const API_URL = "http://192.168.31.137:9000"; // your backend URL
export const API_URL = "http://192.168.31.27:9000"; // your backend URL

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
 * Main API request wrapper
 * - attaches Authorization header automatically
 * - parses JSON safely
 * - throws Error on non-200 response
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