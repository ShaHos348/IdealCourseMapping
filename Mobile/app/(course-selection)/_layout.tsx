import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function CourseSelectionLayout() {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Stack owns header
        tabBarStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.icon,
      }}
    >
      <Tabs.Screen
        name="requirements"
        options={{
          title: "Requirements",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}