import React, { useMemo, useState } from "react";
import { View, TextInput, ScrollView, StyleSheet } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import PrimaryButton from "@/app/components/ui/PrimaryButton";
import DepartmentAccordion from "@/app/components/DepartmentAccordion";
import fullCourseData from "@/assets/data/full_program_courses.json";
import { getData } from "@/util/storage";
import { useCourseMap } from "../../util/_context";

export default function CoursesTab() {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];
  const inputBg = scheme === "dark" ? "#1f2022" : "#fff";

  const { selectedCourses, toggleCourse, addMany } = useCourseMap();
  const [searchQuery, setSearchQuery] = useState("");

  const addAllProgramCourses = async () => {
    const needed = await getData("neededCourses");
    if (!needed || typeof needed !== "object") return;

    const codes: string[] = [];
    Object.values(needed as any).forEach((rows: any) => {
      if (!Array.isArray(rows)) return;
      rows.forEach((row: any) => {
        if (!Array.isArray(row)) return;

        let raw = row[0];
        if (!raw) return;

        let s = String(raw).trim();
        const lower = s.toLowerCase();

        if (
          lower.includes("elective") ||
          lower.includes("option") ||
          lower.includes("select") ||
          lower.includes("total")
        ) {
          return;
        }

        if (lower.startsWith("or")) s = s.slice(2).trim();

        // normalize "CS1301" or "CS 1301" -> "CS 1301"
        const formatted = s
          .replace(/([a-zA-Z]+)\s*(\d+)/, "$1 $2")
          .toUpperCase();
        codes.push(formatted);
      });
    });

    addMany(codes);
  };

  const filteredDepartments = useMemo(() => {
    return Object.entries(fullCourseData as any)
      .map(([dept, courses]: any) => ({
        department: dept,
        courses: courses.filter((c: any) =>
          `${c.name} ${c.long_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((d) => d.courses.length > 0);
  }, [searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.controls}>
        <PrimaryButton
          title="Add All Program Courses"
          onPress={addAllProgramCourses}
        />
        <TextInput
          placeholder="Search courses (e.g. CS 1301)"
          placeholderTextColor={theme.icon}
          style={[
            styles.input,
            {
              borderColor: theme.icon,
              color: theme.text,
              backgroundColor: inputBg,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView>
        {filteredDepartments.map(({ department, courses }) => (
          <DepartmentAccordion
            key={department}
            department={department}
            courses={courses}
            selectedCourses={selectedCourses}
            toggleCourse={toggleCourse}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  controls: { gap: 10, marginBottom: 12 },
  input: { borderWidth: 1, padding: 10, borderRadius: 10, fontSize: 14 },
});
