// frontend/api/insights.ts
import { apiRequest } from "./index";

export const insightsApi = {
  async getInsights(range: "week" | "month") {
    return apiRequest(`/insights?range=${range}`);
  },
};
