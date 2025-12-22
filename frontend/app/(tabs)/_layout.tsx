// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Unified config for three tabs (icons & labels)
const TAB_CONFIG: Record<
  string,
  { label: string; icon: string }
> = {
  today: {
    label: "Today",
    icon: "sun.max", // Sun
  },
  journal: {
    label: "Journal",
    icon: "book.closed", // Notebook
  },
  insights: {
    label: "Insights",
    icon: "waveform.path.ecg", // ECG waveform
  },
};

export default function TabLayout() {
  return (
    <Tabs
      // Use custom tab bar
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
 * Custom bottom navigation bar
 * Style close to the screenshot: white bg + thin top divider + green active state
 */
function MyCustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeColor = "#6FA77A"; // Green (like Journal)
  const inactiveColor = "#B0AAA0"; // Warm gray
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
            {/* Icon */}
            <IconSymbol
              name={config.icon as any}
              size={22}
              color={isFocused ? activeColor : inactiveColor}
            />
            {/* Label */}
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
    borderTopColor: "#E4DED5", // Very light divider line
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
