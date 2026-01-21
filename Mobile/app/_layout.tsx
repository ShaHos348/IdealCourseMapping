import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Select College & Major" }}
        />

        <Stack.Screen
          name="(course-selection)"
          options={{ title: "Course Selection" }}
        />

        <Stack.Screen name="course-map" options={{ title: "Course Map" }} />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
