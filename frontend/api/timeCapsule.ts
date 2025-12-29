import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./index";

export type TimeCapsuleSourceLevel = "year" | "month" | "week";

export interface TimeCapsule {
  found: boolean;
  source_date?: string | null;
  source_level?: TimeCapsuleSourceLevel | null;
  quote?: string | null;
  entry_id?: number | null;
}

function getTodayCacheKey() {
  const todayKey = new Date().toISOString().slice(0, 10);
  return `time_capsule_${todayKey}`;
}

async function readCachedToday(): Promise<TimeCapsule | null> {
  try {
    const cached = await AsyncStorage.getItem(getTodayCacheKey());
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

async function writeCachedToday(data: TimeCapsule): Promise<void> {
  try {
    await AsyncStorage.setItem(getTodayCacheKey(), JSON.stringify(data));
  } catch {
    // Ignore cache write errors.
  }
}

async function fetchTodayAndCache(): Promise<TimeCapsule> {
  const res = await apiRequest("/time-capsule/", { method: "GET" });
  await writeCachedToday(res);
  return res;
}

export const timeCapsuleApi = {
  async get(): Promise<TimeCapsule> {
    return apiRequest("/time-capsule/", { method: "GET" });
  },

  async getTodayCached(): Promise<TimeCapsule> {
    const cached = await readCachedToday();
    if (cached) return cached;
    return fetchTodayAndCache();
  },

  async preloadToday(): Promise<void> {
    try {
      const cached = await readCachedToday();
      if (cached) return;
      await fetchTodayAndCache();
    } catch {
      // Ignore preload failures; journal page will handle fallback.
    }
  },
};
