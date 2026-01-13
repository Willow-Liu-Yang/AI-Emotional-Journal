import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Language = "en" | "zh";

type I18nKey =
  | "common.loading"
  | "common.errorTitle"
  | "common.successTitle"
  | "common.updatedTitle"
  | "common.retry"
  | "common.cancel"
  | "common.delete"
  | "common.saveChanges"
  | "common.comingSoon"
  | "common.back"
  | "common.continue"
  | "common.ok"
  | "common.share"
  | "welcome.title"
  | "welcome.subtitle"
  | "welcome.button"
  | "login.title"
  | "login.emailLabel"
  | "login.passwordLabel"
  | "login.emailPlaceholder"
  | "login.passwordPlaceholder"
  | "login.button"
  | "login.errorMissing"
  | "login.errorUnable"
  | "login.footerPrompt"
  | "login.footerAction"
  | "signup.title"
  | "signup.emailLabel"
  | "signup.passwordLabel"
  | "signup.confirmLabel"
  | "signup.emailPlaceholder"
  | "signup.passwordPlaceholder"
  | "signup.confirmPlaceholder"
  | "signup.button"
  | "signup.footerPrompt"
  | "signup.footerAction"
  | "signup.errorMissing"
  | "signup.errorMinLength"
  | "signup.errorMismatch"
  | "nickname.title"
  | "nickname.subtitle"
  | "nickname.label"
  | "nickname.placeholder"
  | "nickname.button"
  | "nickname.footer"
  | "nickname.errorEmpty"
  | "nickname.notLoggedTitle"
  | "nickname.notLoggedBody"
  | "nickname.successBody"
  | "nickname.errorUpdate"
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
  | "promptLibrary.title"
  | "promptLibrary.hint"
  | "prompt.capture_joy.title"
  | "prompt.capture_joy.desc"
  | "prompt.let_it_out.title"
  | "prompt.let_it_out.desc"
  | "prompt.warm_moments.title"
  | "prompt.warm_moments.desc"
  | "prompt.steps_forward.title"
  | "prompt.steps_forward.desc"
  | "prompt.reflect_grow.title"
  | "prompt.reflect_grow.desc"
  | "prompt.rest_gently.title"
  | "prompt.rest_gently.desc"
  | "write.aiFeedback"
  | "write.placeholder"
  | "write.alertEmpty"
  | "write.alertSaveError"
  | "write.done"
  | "write.saving"
  | "entry.moodSummary"
  | "entry.noEmotion"
  | "entry.intensity.low"
  | "entry.intensity.medium"
  | "entry.intensity.high"
  | "entry.comment.placeholder"
  | "entry.comment.you"
  | "entry.comment.deleteTitle"
  | "entry.comment.deleteBody"
  | "entry.comment.addError"
  | "entry.comment.deleteError"
  | "entry.entry.shareTitle"
  | "entry.entry.shareBody"
  | "entry.entry.deleteTitle"
  | "entry.entry.deleteBody"
  | "entry.entry.deleteError"
  | "entry.entry.optionsTitle"
  | "entry.entry.optionsShare"
  | "entry.entry.optionsDelete"
  | "entry.entry.optionsCancel"
  | "entry.loadError"
  | "journal.title"
  | "journal.monthNone"
  | "journal.timeCapsule.title"
  | "journal.timeCapsule.emptyTitle"
  | "journal.timeCapsule.from"
  | "journal.timeCapsule.loading"
  | "journal.timeCapsule.quoteFallback"
  | "journal.timeCapsule.emptyBody"
  | "journal.helpText"
  | "insights.title"
  | "insights.loading"
  | "insights.error"
  | "insights.retry"
  | "insights.week"
  | "insights.month"
  | "insights.noteAuthorFallback"
  | "insights.noteFallback"
  | "stats.journalEntries"
  | "stats.wordsWritten"
  | "stats.daysActive"
  | "calendar.title"
  | "feelings.title"
  | "feelings.empty"
  | "emotion.joy"
  | "emotion.calm"
  | "emotion.anxiety"
  | "emotion.sadness"
  | "emotion.anger"
  | "emotion.tired"
  | "theme.title"
  | "theme.work"
  | "theme.hobbies"
  | "theme.social"
  | "theme.other"
  | "theme.empty"
  | "valence.title"
  | "valence.empty"
  | "valence.positive"
  | "valence.negative"
  | "day.mon"
  | "day.tue"
  | "day.wed"
  | "day.thu"
  | "day.fri"
  | "day.sat"
  | "day.sun"
  | "week.one"
  | "week.two"
  | "week.three"
  | "week.four"
  | "note.title"
  | "profile.loading"
  | "profile.title"
  | "profile.userFallback"
  | "profile.joinedOn"
  | "profile.companion"
  | "profile.companionFallbackTitle"
  | "profile.logout"
  | "profile.version"
  | "profile.settings.notification"
  | "profile.settings.language"
  | "profile.settings.theme"
  | "profile.settings.privacy"
  | "profile.settings.help"
  | "profile.edit.title"
  | "profile.edit.label"
  | "profile.edit.placeholder"
  | "profile.edit.loading"
  | "profile.edit.errorLoad"
  | "profile.edit.errorEmpty"
  | "profile.edit.errorTooShort"
  | "profile.edit.errorTooLong"
  | "profile.edit.errorUserNotFound"
  | "profile.edit.successBody"
  | "profile.edit.errorSave"
  | "profile.edit.cancel"
  | "companion.tag.gentle"
  | "companion.tag.insightful"
  | "companion.tag.calming"
  | "companion.title"
  | "companion.subtitle"
  | "companion.loading"
  | "companion.errorLoad"
  | "companion.updatedBody"
  | "companion.errorUpdate"
  | "companion.customTitle"
  | "companion.customBody"
  | "companion.customButton"
  | "settings.notification.title"
  | "settings.language.title"
  | "settings.theme.title"
  | "settings.privacy.title"
  | "settings.help.title"
  | "tabs.today"
  | "tabs.journal"
  | "tabs.insights"
  | "language.title"
  | "language.subtitle"
  | "language.option.en.title"
  | "language.option.en.desc"
  | "language.option.zh.title"
  | "language.option.zh.desc";

const STRINGS: Record<I18nKey, { en: string; zh: string }> = {
  "common.loading": {
    en: "Loading...",
    zh: "加载中...",
  },
  "common.errorTitle": {
    en: "Error",
    zh: "出错了",
  },
  "common.successTitle": {
    en: "Success",
    zh: "成功",
  },
  "common.updatedTitle": {
    en: "Updated",
    zh: "已更新",
  },
  "common.retry": {
    en: "Retry",
    zh: "重试",
  },
  "common.cancel": {
    en: "Cancel",
    zh: "取消",
  },
  "common.delete": {
    en: "Delete",
    zh: "删除",
  },
  "common.saveChanges": {
    en: "Save changes",
    zh: "保存修改",
  },
  "common.comingSoon": {
    en: "Coming soon.",
    zh: "敬请期待。",
  },
  "common.back": {
    en: "Back",
    zh: "返回",
  },
  "common.continue": {
    en: "Continue",
    zh: "继续",
  },
  "common.ok": {
    en: "OK",
    zh: "确定",
  },
  "common.share": {
    en: "Share",
    zh: "分享",
  },
  "welcome.title": {
    en: "CapyDiary",
    zh: "CapyDiary",
  },
  "welcome.subtitle": {
    en: "Slow down.\nLet your thoughts float.",
    zh: "慢一点。\n让思绪漂一会儿。",
  },
  "welcome.button": {
    en: "Get Started",
    zh: "开始使用",
  },
  "login.title": {
    en: "Welcome back!",
    zh: "欢迎回来！",
  },
  "login.emailLabel": {
    en: "Email",
    zh: "邮箱",
  },
  "login.passwordLabel": {
    en: "Password",
    zh: "密码",
  },
  "login.emailPlaceholder": {
    en: "your@email.com",
    zh: "邮箱地址",
  },
  "login.passwordPlaceholder": {
    en: "********",
    zh: "********",
  },
  "login.button": {
    en: "Log In",
    zh: "登录",
  },
  "login.errorMissing": {
    en: "Please fill in both fields.",
    zh: "请填写邮箱和密码。",
  },
  "login.errorUnable": {
    en: "Unable to connect.",
    zh: "连接失败，请稍后再试。",
  },
  "login.footerPrompt": {
    en: "Don't have an account?",
    zh: "还没有账号？",
  },
  "login.footerAction": {
    en: "Sign Up",
    zh: "注册",
  },
  "signup.title": {
    en: "Let's get cozy.",
    zh: "一起慢下来。",
  },
  "signup.emailLabel": {
    en: "Email",
    zh: "邮箱",
  },
  "signup.passwordLabel": {
    en: "Password",
    zh: "密码",
  },
  "signup.confirmLabel": {
    en: "Confirm Password",
    zh: "确认密码",
  },
  "signup.emailPlaceholder": {
    en: "your@email.com",
    zh: "邮箱地址",
  },
  "signup.passwordPlaceholder": {
    en: "********",
    zh: "********",
  },
  "signup.confirmPlaceholder": {
    en: "********",
    zh: "********",
  },
  "signup.button": {
    en: "Sign Up",
    zh: "注册",
  },
  "signup.footerPrompt": {
    en: "Already have an account?",
    zh: "已有账号？",
  },
  "signup.footerAction": {
    en: "Log In",
    zh: "登录",
  },
  "signup.errorMissing": {
    en: "Please fill in email and password.",
    zh: "请填写邮箱和密码。",
  },
  "signup.errorMinLength": {
    en: "Password must be at least {min} characters.",
    zh: "密码至少需要 {min} 位。",
  },
  "signup.errorMismatch": {
    en: "Passwords do not match.",
    zh: "两次输入的密码不一致。",
  },
  "nickname.title": {
    en: "What should we\ncall you?",
    zh: "该怎么称呼你？",
  },
  "nickname.subtitle": {
    en: "Your nickname makes this space feel\nmore like home.",
    zh: "一个昵称会让这里更像你的空间。",
  },
  "nickname.label": {
    en: "Nickname",
    zh: "昵称",
  },
  "nickname.placeholder": {
    en: "How should we call you?",
    zh: "输入你的昵称",
  },
  "nickname.button": {
    en: "Continue",
    zh: "继续",
  },
  "nickname.footer": {
    en: "You can always change this later.",
    zh: "之后随时可以修改。",
  },
  "nickname.errorEmpty": {
    en: "Please enter a nickname.",
    zh: "请输入昵称。",
  },
  "nickname.notLoggedTitle": {
    en: "Not logged in",
    zh: "未登录",
  },
  "nickname.notLoggedBody": {
    en: "Please log in again.",
    zh: "请重新登录。",
  },
  "nickname.successBody": {
    en: "Nickname set successfully!",
    zh: "昵称设置成功！",
  },
  "nickname.errorUpdate": {
    en: "Unable to update nickname.",
    zh: "昵称更新失败。",
  },
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
  "promptLibrary.title": {
    en: "All Prompts",
    zh: "全部提示",
  },
  "promptLibrary.hint": {
    en: "Tap a prompt to start writing.",
    zh: "点一下提示就可以开始写。",
  },
  "prompt.capture_joy.title": {
    en: "Capture Joy",
    zh: "捕捉快乐",
  },
  "prompt.capture_joy.desc": {
    en: "What little moment brought you joy today?",
    zh: "今天哪一个小小的瞬间让你感到快乐？",
  },
  "prompt.let_it_out.title": {
    en: "Let It Out",
    zh: "把它说出来",
  },
  "prompt.let_it_out.desc": {
    en: "What feelings have been quietly rising inside you?",
    zh: "有哪些情绪一直在你心里悄悄升起？",
  },
  "prompt.warm_moments.title": {
    en: "Warm Moments",
    zh: "温暖瞬间",
  },
  "prompt.warm_moments.desc": {
    en: "What made you feel warm, safe, or comforted today?",
    zh: "今天是什么让你感到温暖、安心或被安慰？",
  },
  "prompt.steps_forward.title": {
    en: "Steps Forward",
    zh: "向前一步",
  },
  "prompt.steps_forward.desc": {
    en: "What small step did you take toward something important?",
    zh: "你今天朝重要的事情迈出了哪一步？",
  },
  "prompt.reflect_grow.title": {
    en: "Reflect & Grow",
    zh: "反思与成长",
  },
  "prompt.reflect_grow.desc": {
    en: "What did you learn about yourself today?",
    zh: "今天你对自己有什么新的认识？",
  },
  "prompt.rest_gently.title": {
    en: "Rest Gently",
    zh: "轻轻休息",
  },
  "prompt.rest_gently.desc": {
    en: "What helped your body or mind rest today?",
    zh: "今天是什么让你的身心放松下来？",
  },
  "write.aiFeedback": {
    en: "AI Feedback",
    zh: "AI 反馈",
  },
  "write.placeholder": {
    en: "Write about your day...",
    zh: "写下你的今天...",
  },
  "write.alertEmpty": {
    en: "Please write something first.",
    zh: "先写点内容吧。",
  },
  "write.alertSaveError": {
    en: "Failed to save entry.",
    zh: "保存失败，请稍后再试。",
  },
  "write.done": {
    en: "Done",
    zh: "完成",
  },
  "write.saving": {
    en: "Saving...",
    zh: "保存中...",
  },
  "entry.moodSummary": {
    en: "Mood Summary",
    zh: "心情摘要",
  },
  "entry.noEmotion": {
    en: "No emotion detected yet",
    zh: "暂无情绪识别",
  },
  "entry.intensity.low": {
    en: "low",
    zh: "低",
  },
  "entry.intensity.medium": {
    en: "medium",
    zh: "中",
  },
  "entry.intensity.high": {
    en: "high",
    zh: "高",
  },
  "entry.comment.placeholder": {
    en: "Leave a note to yourself...",
    zh: "给自己写一句话...",
  },
  "entry.comment.you": {
    en: "You",
    zh: "我",
  },
  "entry.comment.deleteTitle": {
    en: "Delete note",
    zh: "删除评论",
  },
  "entry.comment.deleteBody": {
    en: "Are you sure you want to delete this note?",
    zh: "确定要删除这条评论吗？",
  },
  "entry.comment.addError": {
    en: "Failed to add your note.",
    zh: "评论发布失败。",
  },
  "entry.comment.deleteError": {
    en: "Failed to delete note.",
    zh: "删除失败。",
  },
  "entry.entry.shareTitle": {
    en: "Share",
    zh: "分享",
  },
  "entry.entry.shareBody": {
    en: "Sharing will be available in a later version.",
    zh: "分享功能将在后续版本提供。",
  },
  "entry.entry.deleteTitle": {
    en: "Delete entry",
    zh: "删除日记",
  },
  "entry.entry.deleteBody": {
    en: "Are you sure you want to delete this entry?",
    zh: "确定要删除这篇日记吗？",
  },
  "entry.entry.deleteError": {
    en: "Failed to delete entry.",
    zh: "删除失败。",
  },
  "entry.entry.optionsTitle": {
    en: "Entry options",
    zh: "更多操作",
  },
  "entry.entry.optionsShare": {
    en: "Share",
    zh: "分享",
  },
  "entry.entry.optionsDelete": {
    en: "Delete",
    zh: "删除",
  },
  "entry.entry.optionsCancel": {
    en: "Cancel",
    zh: "取消",
  },
  "entry.loadError": {
    en: "Failed to load entry.",
    zh: "日记加载失败。",
  },
  "journal.title": {
    en: "Journal List",
    zh: "日记列表",
  },
  "journal.monthNone": {
    en: "NO ENTRIES YET",
    zh: "还没有日记",
  },
  "journal.timeCapsule.title": {
    en: "Time Capsule",
    zh: "时光胶囊",
  },
  "journal.timeCapsule.emptyTitle": {
    en: "Empty Capsule",
    zh: "空胶囊",
  },
  "journal.timeCapsule.from": {
    en: "From {date}",
    zh: "来自 {date}",
  },
  "journal.timeCapsule.loading": {
    en: "Loading your time capsule...",
    zh: "正在打开时光胶囊...",
  },
  "journal.timeCapsule.quoteFallback": {
    en: "A special moment from your past.",
    zh: "来自过去的一段特别时光。",
  },
  "journal.timeCapsule.emptyBody": {
    en: "Your time capsule is waiting to be filled.",
    zh: "你的时光胶囊还在等待被填满。",
  },
  "journal.helpText": {
    en: "Revisit a past moment to see your growth and reflect on your journey.",
    zh: "回看过去，看看你走过的路。",
  },
  "insights.title": {
    en: "Insights",
    zh: "洞察",
  },
  "insights.loading": {
    en: "Loading insights...",
    zh: "正在加载洞察...",
  },
  "insights.error": {
    en: "Failed to load insights",
    zh: "洞察加载失败",
  },
  "insights.retry": {
    en: "Retry",
    zh: "重试",
  },
  "insights.week": {
    en: "This Week",
    zh: "本周",
  },
  "insights.month": {
    en: "This Month",
    zh: "本月",
  },
  "insights.noteAuthorFallback": {
    en: "Companion",
    zh: "伙伴",
  },
  "insights.noteFallback": {
    en: "Hi, I'm {name}. I'm here and ready to listen whenever you write your first entry.",
    zh: "你好，我是{name}。当你写下第一篇日记时，我会在这里听你分享。",
  },
  "stats.journalEntries": {
    en: "Journal entries",
    zh: "日记篇数",
  },
  "stats.wordsWritten": {
    en: "Words written",
    zh: "写下的字数",
  },
  "stats.daysActive": {
    en: "Days active",
    zh: "活跃天数",
  },
  "calendar.title": {
    en: "Paw Calendar",
    zh: "爪印日历",
  },
  "feelings.title": {
    en: "Top Feelings",
    zh: "主要情绪",
  },
  "feelings.empty": {
    en: "Write an entry to see your emotions.",
    zh: "写下第一篇日记，就能看到情绪。",
  },
  "emotion.joy": {
    en: "Joy",
    zh: "快乐",
  },
  "emotion.calm": {
    en: "Calm",
    zh: "平静",
  },
  "emotion.anxiety": {
    en: "Anxiety",
    zh: "焦虑",
  },
  "emotion.sadness": {
    en: "Sadness",
    zh: "难过",
  },
  "emotion.anger": {
    en: "Anger",
    zh: "生气",
  },
  "emotion.tired": {
    en: "Tired",
    zh: "疲惫",
  },
  "theme.title": {
    en: "Your Inner Landscape",
    zh: "内心风景",
  },
  "theme.work": {
    en: "Work",
    zh: "工作",
  },
  "theme.hobbies": {
    en: "Hobbies",
    zh: "兴趣",
  },
  "theme.social": {
    en: "Social",
    zh: "社交",
  },
  "theme.other": {
    en: "Other",
    zh: "其他",
  },
  "theme.empty": {
    en: "Write an entry to see your inner landscape.",
    zh: "写下日记，就能看到你的内心风景。",
  },
  "valence.title": {
    en: "Emotion Trend",
    zh: "情绪趋势",
  },
  "valence.empty": {
    en: "Write an entry to see valence changes.",
    zh: "写日记后可查看情绪变化。",
  },
  "valence.positive": {
    en: "Positive",
    zh: "积极",
  },
  "valence.negative": {
    en: "negative",
    zh: "低落",
  },
  "day.mon": {
    en: "Mon",
    zh: "周一",
  },
  "day.tue": {
    en: "Tue",
    zh: "周二",
  },
  "day.wed": {
    en: "Wed",
    zh: "周三",
  },
  "day.thu": {
    en: "Thu",
    zh: "周四",
  },
  "day.fri": {
    en: "Fri",
    zh: "周五",
  },
  "day.sat": {
    en: "Sat",
    zh: "周六",
  },
  "day.sun": {
    en: "Sun",
    zh: "周日",
  },
  "week.one": {
    en: "Week1",
    zh: "第1周",
  },
  "week.two": {
    en: "Week2",
    zh: "第2周",
  },
  "week.three": {
    en: "Week3",
    zh: "第3周",
  },
  "week.four": {
    en: "Week4",
    zh: "第4周",
  },
  "note.title": {
    en: "AI Companion Note",
    zh: "AI 伙伴留言",
  },
  "profile.loading": {
    en: "Loading...",
    zh: "加载中...",
  },
  "profile.title": {
    en: "My Space",
    zh: "我的空间",
  },
  "profile.userFallback": {
    en: "User",
    zh: "用户",
  },
  "profile.joinedOn": {
    en: "Joined on {date}",
    zh: "加入于 {date}",
  },
  "profile.companion": {
    en: "My AI Companion",
    zh: "我的 AI 伙伴",
  },
  "profile.companionFallbackTitle": {
    en: "Your Gentle Companion",
    zh: "温柔的陪伴者",
  },
  "profile.logout": {
    en: "Log Out",
    zh: "退出登录",
  },
  "profile.version": {
    en: "CapyDiary v1.0.1",
    zh: "CapyDiary v1.0.1",
  },
  "profile.settings.notification": {
    en: "Notification",
    zh: "通知",
  },
  "profile.settings.language": {
    en: "Language",
    zh: "语言",
  },
  "profile.settings.theme": {
    en: "Theme",
    zh: "主题",
  },
  "profile.settings.privacy": {
    en: "Privacy & Security",
    zh: "隐私与安全",
  },
  "profile.settings.help": {
    en: "Help & Support",
    zh: "帮助与支持",
  },
  "profile.edit.title": {
    en: "Edit Profile",
    zh: "编辑资料",
  },
  "profile.edit.label": {
    en: "Nickname",
    zh: "昵称",
  },
  "profile.edit.placeholder": {
    en: "Enter your nickname",
    zh: "输入昵称",
  },
  "profile.edit.loading": {
    en: "Loading profile...",
    zh: "正在加载资料...",
  },
  "profile.edit.errorLoad": {
    en: "Unable to load your profile. Please try again later.",
    zh: "资料加载失败，请稍后再试。",
  },
  "profile.edit.errorEmpty": {
    en: "Nickname cannot be empty.",
    zh: "昵称不能为空。",
  },
  "profile.edit.errorTooShort": {
    en: "Nickname must be at least 2 characters.",
    zh: "昵称至少需要 2 个字符。",
  },
  "profile.edit.errorTooLong": {
    en: "Nickname cannot exceed 30 characters.",
    zh: "昵称最多 30 个字符。",
  },
  "profile.edit.errorUserNotFound": {
    en: "User not found.",
    zh: "未找到用户。",
  },
  "profile.edit.successBody": {
    en: "Your nickname has been updated.",
    zh: "昵称已更新。",
  },
  "profile.edit.errorSave": {
    en: "Failed to save changes. Please try again.",
    zh: "保存失败，请稍后再试。",
  },
  "profile.edit.cancel": {
    en: "Cancel",
    zh: "取消",
  },
  "companion.tag.gentle": {
    en: "Gentle",
    zh: "温柔",
  },
  "companion.tag.insightful": {
    en: "Insightful",
    zh: "有洞察",
  },
  "companion.tag.calming": {
    en: "Calming",
    zh: "安抚",
  },
  "companion.title": {
    en: "My AI Companion",
    zh: "我的 AI 伙伴",
  },
  "companion.subtitle": {
    en: "Connect with the listener who understands you best.",
    zh: "选择最懂你的倾听者。",
  },
  "companion.loading": {
    en: "Loading companions...",
    zh: "正在加载伙伴...",
  },
  "companion.errorLoad": {
    en: "Failed to load AI companions.",
    zh: "加载 AI 伙伴失败。",
  },
  "companion.updatedBody": {
    en: "Your AI Companion has been updated.",
    zh: "AI 伙伴已更新。",
  },
  "companion.errorUpdate": {
    en: "Failed to update your AI Companion.",
    zh: "更新失败。",
  },
  "companion.customTitle": {
    en: "Coming soon",
    zh: "敬请期待",
  },
  "companion.customBody": {
    en: "Custom listeners will be available in a future update.",
    zh: "自定义倾听者将在后续版本提供。",
  },
  "companion.customButton": {
    en: "Customize Your Listener",
    zh: "定制你的倾听者",
  },
  "settings.notification.title": {
    en: "Notification",
    zh: "通知",
  },
  "settings.language.title": {
    en: "Language",
    zh: "语言",
  },
  "settings.theme.title": {
    en: "Theme",
    zh: "主题",
  },
  "settings.privacy.title": {
    en: "Privacy & Security",
    zh: "隐私与安全",
  },
  "settings.help.title": {
    en: "Help & Support",
    zh: "帮助与支持",
  },
  "tabs.today": {
    en: "Today",
    zh: "今天",
  },
  "tabs.journal": {
    en: "Journal",
    zh: "日记",
  },
  "tabs.insights": {
    en: "Insights",
    zh: "洞察",
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
