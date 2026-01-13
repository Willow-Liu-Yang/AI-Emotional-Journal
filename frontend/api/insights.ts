// frontend/api/insights.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, getToken } from "./index";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function getCacheKey(range: "week" | "month") {
  const token = await getToken();
  const tokenSuffix = token ? token.slice(-12) : "anon";
  return `insights_${range}_${tokenSuffix}_${getTodayKey()}`;
}

export const insightsApi = {
  async getInsights(range: "week" | "month") {
    return apiRequest(`/insights/?range=${range}`);
  },

  async getInsightsCached(range: "week" | "month") {
    const cacheKey = await getCacheKey(range);

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
    const cacheKey = await getCacheKey(range);

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

  async refreshToday(range: "week" | "month") {
    const cacheKey = await getCacheKey(range);
    const res = await apiRequest(`/insights/?range=${range}`);
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(res));
    } catch {
      // Ignore cache write errors.
    }
    return res;
  },

  async invalidateToday(range: "week" | "month") {
    const cacheKey = await getCacheKey(range);
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch {
      // Ignore cache delete errors.
    }
  },
};
