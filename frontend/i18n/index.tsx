import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "zh";

type I18nKey =
  | "home.greeting"
  | "home.friend"
  | "home.promptLine"
  | "home.seeAll"
  | "home.writeButton"
  | "home.card.captureJoy.title"
  | "home.card.captureJoy.text"
  | "home.card.letItOut.title"
  | "home.card.letItOut.text"
  | "home.card.stepsForward.title"
  | "home.card.stepsForward.text"
  | "language.title"
  | "language.subtitle"
  | "language.option.en.title"
  | "language.option.en.desc"
  | "language.option.zh.title"
  | "language.option.zh.desc";

const STRINGS: Record<I18nKey, { en: string; zh: string }> = {
  "home.greeting": {
    en: "Good morning, {name}.",
    zh: "早上好，{name}。",
  },
  "home.friend": {
    en: "friend",
    zh: "朋友",
  },
  "home.promptLine": {
    en: "Need a prompt to start?",
    zh: "需要一个提示来开始吗？",
  },
  "home.seeAll": {
    en: "See all >",
    zh: "查看全部 >",
  },
  "home.writeButton": {
    en: "Start writing for today",
    zh: "开始今天的书写",
  },
  "home.card.captureJoy.title": {
    en: "Capture Joy",
    zh: "捕捉快乐",
  },
  "home.card.captureJoy.text": {
    en: "What little moment brought you joy today?",
    zh: "今天哪一个小小的瞬间让你感到快乐？",
  },
  "home.card.letItOut.title": {
    en: "Let It Out",
    zh: "把它说出来",
  },
  "home.card.letItOut.text": {
    en: "What feelings have been quietly rising inside you?",
    zh: "有哪些情绪一直在你心里悄悄升起？",
  },
  "home.card.stepsForward.title": {
    en: "Steps Forward",
    zh: "向前一步",
  },
  "home.card.stepsForward.text": {
    en: "What small step did you take toward something important?",
    zh: "你今天朝重要的事情迈出了哪一步？",
  },
  "language.title": {
    en: "Language",
    zh: "语言",
  },
  "language.subtitle": {
    en: "Choose the language you want to use across the app.",
    zh: "选择你想在应用中使用的语言。",
  },
  "language.option.en.title": {
    en: "English",
    zh: "英语",
  },
  "language.option.en.desc": {
    en: "Use English for all texts.",
    zh: "应用内文本使用英语。",
  },
  "language.option.zh.title": {
    en: "Chinese",
    zh: "中文",
  },
  "language.option.zh.desc": {
    en: "Use Simplified Chinese for all texts.",
    zh: "应用内文本使用简体中文。",
  },
};

const STORAGE_KEY = "app_language";

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: I18nKey, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function translate(
  language: Language,
  key: I18nKey,
  vars?: Record<string, string>
) {
  const template = STRINGS[key]?.[language] ?? STRINGS[key]?.en ?? "";
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (saved === "en" || saved === "zh")) {
          setLanguageState(saved);
        }
      } catch {
        // Ignore read errors.
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {
      // Ignore storage errors.
    });
  }, []);

  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string>) =>
      translate(language, key, vars),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
