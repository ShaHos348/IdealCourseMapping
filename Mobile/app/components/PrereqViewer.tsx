import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type PrereqData = Record<string, Record<string, any>>;

export default function PrereqViewer({
  course,
  prereqData,
}: {
  course: string;
  prereqData: PrereqData;
}) {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const prereqs = useMemo(() => {
    // prereqData is nested by dept
    for (const dept of Object.keys(prereqData || {})) {
      const hit = prereqData[dept]?.[course];
      if (hit !== undefined) return hit;
    }
    return null;
  }, [course, prereqData]);

  const text =
    prereqs == null
      ? "No prerequisites found."
      : Array.isArray(prereqs)
        ? prereqs.join(" | ")
        : String(prereqs);

  return (
    <View style={[styles.card, { borderColor: theme.icon }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Prereqs: {course}
      </Text>
      <View style={[styles.box, { borderColor: theme.icon }]}>
        <Text style={{ color: theme.text }}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  box: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 56,
    justifyContent: "center",
  },
});
