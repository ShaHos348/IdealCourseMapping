// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)", // not used now, safe to leave
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="index"
          options={{ title: "Select College & Major" }}
        />
        <Stack.Screen
          name="course-selection"
          options={{ title: "Courses Selection" }}
        />
        <Stack.Screen name="course-map" options={{ title: "Course Map" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
