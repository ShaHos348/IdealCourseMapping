// app/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import PrimaryButton from "@/app/components/ui/PrimaryButton";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import collegeData from "../assets/data/college_data.json";
import { storeData } from "../util/storage";

export default function Index() {
  const router = useRouter();

  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];
  const surfaceBg = scheme === "dark" ? "#1f2022" : "#f0f0f0";

  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");

  const [selectedThread1, setSelectedThread1] = useState<string>("");
  const [selectedThread2, setSelectedThread2] = useState<string>("");
  const [selectedConcentration, setSelectedConcentration] =
    useState<string>("");

  // derive major object
  const majorObj: any = useMemo(() => {
    if (!selectedCollege || !selectedMajor) return null;
    return (
      (collegeData as any)?.[selectedCollege]?.majors?.[selectedMajor] ?? null
    );
  }, [selectedCollege, selectedMajor]);

  const threads: any[] = Array.isArray(majorObj?.threads)
    ? majorObj.threads
    : [];
  const concentrations: any[] = Array.isArray(majorObj?.concentrations)
    ? majorObj.concentrations
    : [];

  const hasThreads = threads.length > 0;
  const hasConcentration = concentrations.length > 0;

  // reset when college changes
  useEffect(() => {
    setSelectedMajor("");
    setSelectedThread1("");
    setSelectedThread2("");
    setSelectedConcentration("");
  }, [selectedCollege]);

  // reset when major changes
  useEffect(() => {
    setSelectedThread1("");
    setSelectedThread2("");
    setSelectedConcentration("");
  }, [selectedMajor]);

  // IMPORTANT: filter per-picker, do not remove its own selection
  const threadOptionsFor1 = useMemo(() => {
    return threads.filter((t) => t.value !== selectedThread2);
  }, [threads, selectedThread2]);

  const threadOptionsFor2 = useMemo(() => {
    return threads.filter((t) => t.value !== selectedThread1);
  }, [threads, selectedThread1]);

  const concentrationOptions = useMemo(() => concentrations, [concentrations]);

  const canContinue = () => {
    if (!selectedCollege || !selectedMajor) return false;
    if (hasThreads) return selectedThread1 !== "" && selectedThread2 !== "";
    if (hasConcentration) return selectedConcentration !== "";
    return true;
  };

  const handleContinue = async () => {
    if (!majorObj) return;

    const selections = {
      college: (collegeData as any)[selectedCollege].name,
      major: [selectedMajor, majorObj.name],
      thread1: hasThreads
        ? threads.find((t: any) => t.value === selectedThread1)
        : null,
      thread2: hasThreads
        ? threads.find((t: any) => t.value === selectedThread2)
        : null,
      concentration: hasConcentration
        ? concentrations.find((c: any) => c.value === selectedConcentration)
        : null,
    };

    await storeData("gtCourseSelections", selections);
    router.push("/(course-selection)/requirements");
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: theme.text }]}>
        Ideal Course Mapping
      </Text>

      {/* College */}
      <Text style={[styles.label, { color: theme.text }]}>Select College</Text>
      <View
        style={[
          styles.pickerBox,
          { backgroundColor: surfaceBg, borderColor: theme.icon },
        ]}
      >
        <Picker
          selectedValue={selectedCollege}
          onValueChange={(val) => setSelectedCollege(String(val))}
          dropdownIconColor={theme.text}
          style={[styles.picker, { color: theme.text }]}
        >
          <Picker.Item label="-- Select a college --" value="" />
          {Object.entries(collegeData as any).map(([key, college]: any) => (
            <Picker.Item key={key} label={college.name} value={key} />
          ))}
        </Picker>
      </View>

      {/* Major */}
      {selectedCollege !== "" && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>
            Select Major
          </Text>
          <View
            style={[
              styles.pickerBox,
              { backgroundColor: surfaceBg, borderColor: theme.icon },
            ]}
          >
            <Picker
              selectedValue={selectedMajor}
              onValueChange={(val) => setSelectedMajor(String(val))}
              dropdownIconColor={theme.text}
              style={[styles.picker, { color: theme.text }]}
            >
              <Picker.Item label="-- Select a major --" value="" />
              {Object.entries((collegeData as any)[selectedCollege].majors).map(
                ([key, major]: any) => (
                  <Picker.Item key={key} label={major.name} value={key} />
                ),
              )}
            </Picker>
          </View>
        </>
      )}

      {/* Threads */}
      {selectedMajor !== "" && hasThreads && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>Thread 1</Text>
          <View
            style={[
              styles.pickerBox,
              { backgroundColor: surfaceBg, borderColor: theme.icon },
            ]}
          >
            <Picker
              selectedValue={selectedThread1}
              onValueChange={(val) => setSelectedThread1(String(val))}
              dropdownIconColor={theme.text}
              style={[styles.picker, { color: theme.text }]}
            >
              <Picker.Item label="-- Select Thread 1 --" value="" />
              {threadOptionsFor1.map((t: any) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>Thread 2</Text>
          <View
            style={[
              styles.pickerBox,
              { backgroundColor: surfaceBg, borderColor: theme.icon },
            ]}
          >
            <Picker
              selectedValue={selectedThread2}
              onValueChange={(val) => setSelectedThread2(String(val))}
              dropdownIconColor={theme.text}
              style={[styles.picker, { color: theme.text }]}
            >
              <Picker.Item label="-- Select Thread 2 --" value="" />
              {threadOptionsFor2.map((t: any) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Concentration (show when major has concentrations AND no threads) */}
      {selectedMajor !== "" && hasConcentration && !hasThreads && (
        <>
          <Text style={[styles.label, { color: theme.text }]}>
            Concentration
          </Text>
          <View
            style={[
              styles.pickerBox,
              { backgroundColor: surfaceBg, borderColor: theme.icon },
            ]}
          >
            <Picker
              selectedValue={selectedConcentration}
              onValueChange={(val) => setSelectedConcentration(String(val))}
              dropdownIconColor={theme.text}
              style={[styles.picker, { color: theme.text }]}
            >
              <Picker.Item label="-- Select Concentration --" value="" />
              {concentrationOptions.map((c: any) => (
                <Picker.Item key={c.value} label={c.label} value={c.value} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: { marginTop: 15, marginBottom: 6, fontWeight: "600" },
  pickerBox: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  picker: { width: "100%" },
  buttonContainer: { marginTop: 30 },
});
