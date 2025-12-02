// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

// 统一配置三个 Tab 对应的图标 & 文本
const TAB_CONFIG: Record<
  string,
  { label: string; icon: string }
> = {
  today: {
    label: "Today",
    icon: "sun.max", // 小太阳
  },
  journal: {
    label: "Journal",
    icon: "book.closed", // 小本子
  },
  insights: {
    label: "Insights",
    icon: "waveform.path.ecg", // 心电/波形
  },
};

export default function TabLayout() {
  return (
    <Tabs
      // ⭐ 用自定义底栏
      tabBar={(props) => <MyCustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
        }}
      />
    </Tabs>
  );
}

/**
 * 自定义底部导航栏
 * 样式尽量贴你截图：白色背景 + 顶部细分割线 + 绿色选中态
 */
function MyCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeColor = "#6FA77A"; // 绿色（Journal 那种）
  const inactiveColor = "#B0AAA0"; // 灰棕色
  const backgroundColor = "#FFFFFF";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const config = TAB_CONFIG[route.name] ?? {
          label: route.name,
          icon: "circle",
        };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
          >
            {/* 图标 */}
            <IconSymbol
              name={config.icon as any}
              size={22}
              color={isFocused ? activeColor : inactiveColor}
            />
            {/* 文本 */}
            <Text
              style={[
                styles.label,
                { color: isFocused ? activeColor : inactiveColor },
              ]}
            >
              {config.label}
            </Text>

            
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E4DED5", // 很淡的分割线
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
  dot: {
    marginTop: 3,
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#6FA77A",
  },
});
