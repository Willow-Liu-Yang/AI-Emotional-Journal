// frontend/api/entries.ts
import { apiRequest } from "./index";

export interface EntryComment {
  id: number;
  content: string;
  created_at: string;
  author_name?: string | null; // CommentOut 里如果有就用，没有也没关系
}

export const entriesApi = {
  /** Get all entries of current user */
  async getAll(params?: { date?: string; from_date?: string; to_date?: string }) {
    const query = new URLSearchParams();

    if (params?.date) query.append("date", params.date);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);

    const qs = query.toString();
    const url = qs ? `/entries/?${qs}` : "/entries/";

    return apiRequest(url, {
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
    emotion: string;
    emotion_intensity: number;
    need_ai_reply: boolean;
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

  // ===============================
  // 自己给自己的留言（评论）部分
  // ===============================

  /** 获取某条日记下的所有留言（按时间升序） */
  async getComments(entryId: number): Promise<EntryComment[]> {
    return apiRequest(`/entries/${entryId}/comments/`, {
      method: "GET",
    });
  },

  /** 给某条日记添加一条留言（自己对自己的 note） */
  async addComment(entryId: number, content: string): Promise<EntryComment> {
    return apiRequest(`/entries/${entryId}/comments/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  /** 删除一条留言（只有作者本人才会成功，后端做权限判断） */
  async deleteComment(entryId: number, commentId: number) {
    return apiRequest(`/entries/${entryId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};
