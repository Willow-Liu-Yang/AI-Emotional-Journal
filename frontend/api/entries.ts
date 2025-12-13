// frontend/api/entries.ts
import { apiRequest } from "./index";

// ============== 类型定义 ==============

export type EntryTheme = "job" | "hobbies" | "social" | "other";

// 后端 AIReplyOut 映射
export interface AIReply {
  id: number;
  entry_id: number;
  companion_id: number;
  reply_type: string;
  content: string;
  model_name?: string | null;
  created_at: string;
}

// 后端 EntrySummary 映射（列表用）
export interface EntrySummary {
  id: number;
  summary: string;
  created_at: string;
  emotion?: string | null;

  // ✅ 新增：主主题（列表页可用于展示/筛选）
  primary_theme?: EntryTheme | null;
}

// 后端 EntryOut 映射（详情用）
export interface Entry {
  id: number;
  user_id: number;
  content: string;
  summary: string | null;
  created_at: string;

  emotion?: string | null;
  emotion_intensity?: number | null;

  // ✅ 新增：主主题 + 主题分布（insights 聚合用）
  primary_theme?: EntryTheme | null;

  // ✅ 更稳：允许缺少某些 key（历史数据 / fallback）
  theme_scores?: Partial<Record<EntryTheme, number>> | null;

  // ⭐ 现在是对象，不是 string 了
  ai_reply?: AIReply | null;

  pleasure: number;
}

// 评论类型
export interface EntryComment {
  id: number;
  content: string;
  created_at: string;
  author_name?: string | null;
}

export const entriesApi = {
  /** Get all entries of current user */
  async getAll(params?: {
    date?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<EntrySummary[]> {
    const query = new URLSearchParams();

    if (params?.date) query.append("date", params.date);
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);

    const qs = query.toString();
    // ✅ 保持带尾斜杠，避免重定向导致 Authorization header 丢失
    const url = qs ? `/entries/?${qs}` : "/entries/";

    return apiRequest(url, { method: "GET" });
  },

  /** Get single entry by ID */
  async getOne(id: number): Promise<Entry> {
    return apiRequest(`/entries/${id}`, { method: "GET" });
  },

  /** Create new journal entry */
  async create(payload: { content: string; need_ai_reply: boolean }): Promise<Entry> {
    return apiRequest("/entries/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Soft delete entry */
  async remove(id: number) {
    return apiRequest(`/entries/${id}`, { method: "DELETE" });
  },

  // ===============================
  // AI 回复相关
  // ===============================

  /** 让当前 AI 伴侣给某条日记生成 / 获取回复 */
  async generateAiReply(
    entryId: number,
    options?: { forceRegenerate?: boolean }
  ): Promise<AIReply> {
    const force = options?.forceRegenerate ? "?force_regenerate=true" : "";
    return apiRequest(`/entries/${entryId}/ai_reply${force}`, { method: "POST" });
  },

  // ===============================
  // 自己给自己的留言（评论）部分
  // ===============================

  /** 获取某条日记下的所有留言（按时间升序） */
  async getComments(entryId: number): Promise<EntryComment[]> {
    return apiRequest(`/entries/${entryId}/comments/`, { method: "GET" });
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
