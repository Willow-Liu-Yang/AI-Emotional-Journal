// frontend/api/user.ts
import { apiRequest } from "./index";

export const userApi = {
  /** Update user's nickname */
  async updateNickname(nickname: string) {
    return apiRequest("/users/me/username", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: nickname }),
    });
  },
};
