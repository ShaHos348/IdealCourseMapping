import React, { useMemo, useState } from "react";
import { View, TextInput, ScrollView, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import fullCourseData from "@/assets/data/full_program_courses.json";
import { storeData } from "@/util/storage";
import DepartmentAccordion from "@/app/components/DepartmentAccordion";

export default function CoursesTab() {
  const router = useRouter();

  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];
  const inputBg = scheme === "dark" ? "#1f2022" : "#fff";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(),
  );

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      next.has(course) ? next.delete(course) : next.add(course);
      return next;
    });
  };

  const handleContinue = async () => {
    await storeData("takenCourses", Array.from(selectedCourses));
    router.push("/(course-map)/graph");
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
      <View style={styles.searchRow}>
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
        <PrimaryButton
          title={`Continue (${selectedCourses.size})`}
          onPress={handleContinue}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 10 },
});
