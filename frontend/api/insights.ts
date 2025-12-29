// frontend/api/insights.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./index";

export const insightsApi = {
  async getInsights(range: "week" | "month") {
    return apiRequest(`/insights/?range=${range}`);
  },

  async getInsightsCached(range: "week" | "month") {
    const todayKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `insights_${range}_${todayKey}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Ignore cache errors and fall back to network.
    }

    const res = await apiRequest(`/insights/?range=${range}`);
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(res));
    } catch {
      // Ignore cache write errors.
    }
    return res;
  },

  async preloadToday(range: "week" | "month") {
    const todayKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `insights_${range}_${todayKey}`;

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return;
    } catch {
      // Ignore cache read errors and proceed to fetch.
    }

    try {
      const res = await apiRequest(`/insights/?range=${range}`);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(res));
    } catch {
      // Ignore preload failures.
    }
  },
};
