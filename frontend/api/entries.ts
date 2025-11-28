// frontend/api/entries.ts
import { apiRequest } from "./index";

export const entriesApi = {
  /** Get all entries of current user */
  async getAll() {
    return apiRequest("/entries/", {
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
  async create(content: string) {
    return apiRequest("/entries/", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  /** Update existing entry */
  async update(id: number, content: string) {
    return apiRequest(`/entries/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  },

  /** Soft delete entry */
  async remove(id: number) {
    return apiRequest(`/entries/${id}`, {
      method: "DELETE",
    });
  },
};
