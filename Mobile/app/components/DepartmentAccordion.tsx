import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function DepartmentAccordion({
  department,
  courses,
  selectedCourses,
  toggleCourse,
}: any) {
  const [open, setOpen] = useState(false);

  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  // simple header background that works in both modes
  const headerBg = scheme === "dark" ? "#1f2022" : "#eee";

  return (
    <View
      style={[
        styles.card,
        { borderColor: theme.icon, backgroundColor: theme.background },
      ]}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={[styles.header, { backgroundColor: headerBg }]}
      >
        <Text style={[styles.headerText, { color: theme.text }]}>
          {department} ({courses?.length ?? 0})
        </Text>

        <Text style={{ color: theme.text }}>
          {open ? "−" : "+"}
        </Text>
      </TouchableOpacity>

      {open &&
        (courses ?? []).map((c: any) => (
          <View key={c.name} style={styles.row}>
            <Switch
              value={selectedCourses.has(c.name)}
              onValueChange={() => toggleCourse(c.name)}
              trackColor={{ false: theme.icon, true: theme.tint }}
              thumbColor={scheme === "dark" ? "#fff" : "#fff"}
            />
            <Text style={[styles.text, { color: theme.text }]}>
              {c.name} — {c.long_name} ({c.hours})
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { fontWeight: "bold" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
  },
  text: { flex: 1, fontSize: 13 },
});