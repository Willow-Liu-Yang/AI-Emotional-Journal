// frontend/api/auth.ts
import { apiRequest, clearToken, setToken } from "./index";

export const authApi = {
  /** Register new user */
  async register(email: string, password: string) {
    return apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  /** Login and store access_token */
  async login(email: string, password: string) {
    const data = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data?.access_token) {
      await setToken(data.access_token);
    }

    return data;
  },

  /** Logout = remove token */
  async logout() {
    await clearToken();
  },

  /** Get current user from backend */
  async getCurrentUser() {
    // backend route: GET /users/me
    return apiRequest("/users/me", {
      method: "GET",
    });
  },
};
