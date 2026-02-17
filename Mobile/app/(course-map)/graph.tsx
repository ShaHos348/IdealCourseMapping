import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import { useCourseMap } from "../../util/_context";
import GraphCard from "@/app/components/GraphCard";
import SelectedCourses from "@/app/components/SelectedCourses";
import PrereqViewer from "@/app/components/PrereqViewer";

import prereqData from "@/assets/data/prereqs.json";

const BACKEND_URL = "http://10.0.0.80:5000";

export default function GraphTab() {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const { selectedCourses, toggleCourse, clearAll } = useCourseMap();

  const selectedList = useMemo(() => Array.from(selectedCourses), [selectedCourses]);

  const [pickedCourse, setPickedCourse] = useState<string>("");

  const handleTogglePrereq = (course: string) => {
    setPickedCourse((prev) => (prev === course ? "" : course));
  };

  const handleRemove = (course: string) => {
    if (selectedCourses.has(course)) toggleCourse(course);
    setPickedCourse((prev) => (prev === course ? "" : prev));
  };

  const handleClearAll = () => {
    clearAll();
    setPickedCourse("");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
        <GraphCard backendUrl={BACKEND_URL} selectedCourses={selectedList} />

        <SelectedCourses
          courses={selectedList}
          pickedCourse={pickedCourse}
          onTogglePrereq={handleTogglePrereq}
          onRemove={handleRemove}
          onClearAll={handleClearAll}
        />

        {pickedCourse ? (
          <PrereqViewer course={pickedCourse} prereqData={prereqData as any} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
