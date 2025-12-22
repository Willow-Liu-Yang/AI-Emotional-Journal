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
  /** List all AI personas (for selection page) */
  async list(): Promise<Companion[]> {
    return apiRequest("/companions/", {
      method: "GET",
    });
  },

  /** Get a single AI persona */
  async getOne(id: number): Promise<Companion> {
    return apiRequest(`/companions/${id}`, {
      method: "GET",
    });
  },

  /** Select an AI persona */
  async select(companion_id: number) {
    return apiRequest("/companions/select", {
      method: "POST",
      body: JSON.stringify({ companion_id }),
    });
  },
};
