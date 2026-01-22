import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function SelectedCourses({
  courses,
  pickedCourse,
  onTogglePrereq,
  onRemove,
  onClearAll,
}: {
  courses: string[];
  pickedCourse: string;
  onTogglePrereq: (course: string) => void;
  onRemove: (course: string) => void;
  onClearAll: () => void;
}) {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const [openCourse, setOpenCourse] = useState<string>("");

  const isOpen = !!openCourse;
  const isPicked = openCourse && pickedCourse === openCourse;

  const prereqLabel = isPicked ? "Hide prereq" : "Show prereq";

  const close = () => setOpenCourse("");

  const sortedCourses = useMemo(() => [...courses].sort(), [courses]);

  return (
    <View style={[styles.card, { borderColor: theme.icon }]}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Selected Courses ({sortedCourses.length})
        </Text>

        <Pressable
          onPress={onClearAll}
          disabled={sortedCourses.length === 0}
          style={[
            styles.clearBtn,
            {
              borderColor: theme.icon,
              opacity: sortedCourses.length === 0 ? 0.5 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.text, fontWeight: "600" }}>Clear</Text>
        </Pressable>
      </View>

      {/* Pills */}
      <View style={styles.wrap}>
        {sortedCourses.map((c) => {
          const active = c === pickedCourse;
          return (
            <Pressable
              key={c}
              onPress={() => setOpenCourse(c)}
              style={[
                styles.pill,
                {
                  borderColor: active ? theme.tint : theme.icon,
                  backgroundColor: active ? theme.tint : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  color: active ? (scheme === "dark" ? "#000" : "#fff") : theme.text,
                }}
              >
                {c}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tap-outside-to-close popup */}
      <Modal
        transparent
        visible={isOpen}
        animationType="fade"
        onRequestClose={close}
      >
        {/* Outside overlay */}
        <Pressable style={styles.overlay} onPress={close}>
          {/* Stop propagation so tapping inside doesn't close */}
          <Pressable
            onPress={() => {}}
            style={[
              styles.popup,
              { backgroundColor: theme.background, borderColor: theme.icon },
            ]}
          >
            <Text style={[styles.popupTitle, { color: theme.text }]}>
              {openCourse}
            </Text>

            <Pressable
              onPress={() => {
                onTogglePrereq(openCourse);
                close();
              }}
              style={[styles.popupBtn, { borderColor: theme.icon }]}
            >
              <Text style={{ color: theme.text, fontWeight: "600" }}>
                {prereqLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onRemove(openCourse);
                close();
              }}
              style={[styles.popupBtn, { borderColor: theme.icon }]}
            >
              <Text style={{ color: "#ff3b30", fontWeight: "700" }}>
                Delete
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: { fontSize: 16, fontWeight: "700" },

  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
  },

  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  popup: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },

  popupTitle: { fontSize: 16, fontWeight: "700" },

  popupBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
});
