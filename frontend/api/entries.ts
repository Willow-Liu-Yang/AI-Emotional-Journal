// frontend/api/entries.ts
import { apiRequest } from "./index";

// ============== Type definitions ==============

export type EntryTheme = "job" | "hobbies" | "social" | "other";

// Backend AIReplyOut mapping
export interface AIReply {
  id: number;
  entry_id: number;
  companion_id: number;
  reply_type: string;
  content: string;
  model_name?: string | null;
  created_at: string;
}

// Backend EntrySummary mapping (list view)
export interface EntrySummary {
  id: number;
  summary: string;
  created_at: string;
  emotion?: string | null;

  // New: primary theme (for list display/filter)
  primary_theme?: EntryTheme | null;
}

// Backend EntryOut mapping (detail view)
export interface Entry {
  id: number;
  user_id: number;
  content: string;
  summary: string | null;
  created_at: string;

  emotion?: string | null;
  emotion_intensity?: number | null;

  // New: primary theme + distribution (for insights aggregation)
  primary_theme?: EntryTheme | null;

  // More robust: allow missing keys (legacy data/fallback)
  theme_scores?: Partial<Record<EntryTheme, number>> | null;

  // Now an object, not a string
  ai_reply?: AIReply | null;

  pleasure: number;
}

// Comment type
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
    // Keep trailing slash to avoid redirect losing Authorization header
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
  // AI reply related
  // ===============================

  /** Ask the current AI companion to generate/get a reply for an entry */
  async generateAiReply(
    entryId: number,
    options?: { forceRegenerate?: boolean }
  ): Promise<AIReply> {
    const force = options?.forceRegenerate ? "?force_regenerate=true" : "";
    return apiRequest(`/entries/${entryId}/ai_reply${force}`, { method: "POST" });
  },

  // ===============================
  // Self-notes (comments) section
  // ===============================

  /** Get all notes under an entry (ascending by time) */
  async getComments(entryId: number): Promise<EntryComment[]> {
    return apiRequest(`/entries/${entryId}/comments/`, { method: "GET" });
  },

  /** Add a note to an entry (self note) */
  async addComment(entryId: number, content: string): Promise<EntryComment> {
    return apiRequest(`/entries/${entryId}/comments/`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  /** Delete a note (only the author succeeds; backend checks permission) */
  async deleteComment(entryId: number, commentId: number) {
    return apiRequest(`/entries/${entryId}/comments/${commentId}`, {
      method: "DELETE",
    });
  },
};
