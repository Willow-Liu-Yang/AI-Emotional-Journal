// frontend/api/user.ts
import { apiRequest } from "./index";

export const userApi = {
  /** Update user's nickname */
  async updateNickname(userId: number, nickname: string) {
    return apiRequest(`/users/${userId}/username`, {
      method: "PATCH",
      body: JSON.stringify({ username: nickname }),
    });
  },
};
