import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

import fullCourseData from "../assets/data/full_program_courses.json";
import { getData, storeData } from "../util/storage";
import ProgramRequirements from "./components/ProgramRequirements";
import DepartmentAccordion from "./components/DepartmentAccordion";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const BACKEND_URL = "http://10.0.0.80:5000";

export default function CourseSelection() {
  const router = useRouter();

  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];
  const inputBg = scheme === "dark" ? "#1f2022" : "#fff";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [selectionData, setSelectionData] = useState<any>(null);
  const [programName, setProgramName] = useState("");
  const [programTable, setProgramTable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD PROGRAM SELECTION ---------------- */
  useEffect(() => {
    const loadSelection = async () => {
      const stored = await getData("gtCourseSelections");
      if (!stored) {
        Alert.alert("Error", "No program selection found.");
        return;
      }

      setSelectionData({
        major: stored.major,
        focus: [stored.thread1 || stored.concentration, stored.thread2],
      });
    };

    loadSelection();
  }, []);

  /* ---------------- FETCH PROGRAM TABLE ---------------- */
  useEffect(() => {
    if (!selectionData) return;

    const loadProgramTable = async () => {
      try {
        const focus1 = selectionData.focus[0];
        const focus2 = selectionData.focus[1];

        let label = selectionData.major[1];
        if (focus1 && focus2) label += `: ${focus1.label} & ${focus2.label}`;
        else if (focus1) label += `: ${focus1.label}`;
        else if (focus2) label += `: ${focus2.label}`;

        setProgramName(label);

        const selected_program = [
          selectionData.major[0],
          focus1?.value || "",
          focus2?.value || "",
        ];

        const response = await axios.post(`${BACKEND_URL}/get-program-table/`, {
          selected_program,
        });

        const parsed =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        setProgramTable(parsed);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load program requirements.");
        setProgramTable(null);
      } finally {
        setLoading(false);
      }
    };

    loadProgramTable();
  }, [selectionData]);

  /* ---------------- COURSE TOGGLE ---------------- */
  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      next.has(course) ? next.delete(course) : next.add(course);
      return next;
    });
  };

  const handleContinue = async () => {
    await storeData("takenCourses", Array.from(selectedCourses));
    await storeData("neededCourses", programTable);
    router.push("/course-map");
  };

  /* ---------------- FILTER COURSES ---------------- */
  const filteredDepartments = Object.entries(fullCourseData)
    .map(([dept, courses]: any) => ({
      department: dept,
      courses: courses.filter((c: any) =>
        `${c.name} ${c.long_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((d) => d.courses.length > 0);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ color: theme.text, marginTop: 8 }}>
          Loading program requirements...
        </Text>
      </View>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ProgramRequirements program={programName} tableData={programTable} />

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search courses (e.g. CS 1301)"
          placeholderTextColor={theme.icon}
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: theme.icon,
              backgroundColor: inputBg,
            },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Button
          title={`Continue (${selectedCourses.size})`}
          onPress={handleContinue}
          color={theme.tint}
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

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
    borderRadius: 6,
  },
});
