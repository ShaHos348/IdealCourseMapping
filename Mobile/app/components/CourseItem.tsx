// app/components/CourseItem.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  course: any;
  selected: boolean;
  toggleCourse: (course: string) => void;
}

export default function CourseItem({ course, selected, toggleCourse }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={() => toggleCourse(course.name)}
    >
      <Text style={styles.text}>
        {course.name} - {course.long_name} ({course.hours} hrs)
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  selected: { backgroundColor: "#cce5ff" },
  text: { fontSize: 14 },
});