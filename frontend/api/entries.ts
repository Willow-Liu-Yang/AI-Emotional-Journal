// frontend/api/entries.ts
import { apiRequest } from "./index";

export const entriesApi = {
  /** Get all entries of current user */
  async getAll(params?: { date?: string; from_date?: string; to_date?: string }) {
    const query = new URLSearchParams();

    if (params?.date) query.append("date", params.date);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);

    return apiRequest(`/entries/?${query.toString()}`, {
      method: "GET",
    });
  },

  /** Get single entry by ID */
  async getOne(id: number) {
    return apiRequest(`/entries/${id}`, {
      method: "GET",
    });
  },

  /** Create new journal entry */
  async create(payload: {
    content: string;
    emotion: string;             // 六选一：sad / happy / fear / etc.
    emotion_intensity: number;   // 1 / 2 / 3
    need_ai_reply: boolean;      // 开关
  }) {
    return apiRequest("/entries/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  

  /** Soft delete entry */
  async remove(id: number) {
    return apiRequest(`/entries/${id}`, {
      method: "DELETE",
    });
  },
};
