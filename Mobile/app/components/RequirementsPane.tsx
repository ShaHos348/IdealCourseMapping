import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import axios from "axios";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { getData, storeData } from "@/util/storage";
import ProgramRequirements from "@/app/components/ProgramRequirements";

const BACKEND_URL = "http://10.0.0.80:5000";

export default function RequirementsPane() {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const [loading, setLoading] = useState(true);
  const [programName, setProgramName] = useState("");
  const [programTable, setProgramTable] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const stored = await getData("gtCourseSelections");
        if (!stored) {
          Alert.alert(
            "Error",
            "No program selection found. Go back to Page 1.",
          );
          setLoading(false);
          return;
        }

        const focus1 = stored.thread1 || stored.concentration;
        const focus2 = stored.thread2;

        let label = stored.major?.[1] ?? "Program";
        if (focus1 && focus2) label += `: ${focus1.label} & ${focus2.label}`;
        else if (focus1) label += `: ${focus1.label}`;
        else if (focus2) label += `: ${focus2.label}`;
        setProgramName(label);

        const selected_program = [
          stored.major?.[0] ?? "",
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

        // store for page 3 use
        await storeData("neededCourses", parsed);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to load program requirements.");
        setProgramTable(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={{ color: theme.text, marginTop: 8 }}>
          Loading requirements...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 28 }}>
      <ProgramRequirements program={programName} tableData={programTable} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
