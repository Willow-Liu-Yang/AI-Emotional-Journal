// frontend/api/companions.ts
import { apiRequest } from "./index";

export type Companion = {
  id: number;
  name: string;
  identity_title?: string | null;
  tags?: string[] | null;
  theme_color?: string | null;
};

export const companionsApi = {
  /** 列出所有 AI 人设（选择页面用的） */
  async list(): Promise<Companion[]> {
    return apiRequest("/companions/", {
      method: "GET",
    });
  },

  /** 获取单个 AI 人设 */
  async getOne(id: number): Promise<Companion> {
    return apiRequest(`/companions/${id}`, {
      method: "GET",
    });
  },

  /** 选择 AI 人设 */
  async select(companion_id: number) {
    return apiRequest("/companions/select", {
      method: "POST",
      body: JSON.stringify({ companion_id }),
    });
  },
};
