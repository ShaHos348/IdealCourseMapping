import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import axios from "axios";
import { File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function GraphCard({
  backendUrl,
  selectedCourses,
}: {
  backendUrl: string; // e.g. http://10.0.0.80:5000
  selectedCourses?: string[];
}) {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const theme = Colors[scheme];

  const [loadingGraph, setLoadingGraph] = useState(false);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const courses = Array.isArray(selectedCourses) ? selectedCourses : [];
  const canRun = courses.length > 0;

  const makeOrRemoveGraph = async () => {
    if (!canRun) {
      Alert.alert("No courses selected", "Select at least one course first.");
      return;
    }

    // Toggle off if already showing
    if (imageSrc) {
      setImageSrc(null);
      return;
    }

    try {
      setLoadingGraph(true);

      const resp = await axios.post(`${backendUrl}/generate-graph/`, {
        selected_courses: courses,
      });

      if (resp.data?.image) {
        setImageSrc(`data:image/png;base64,${resp.data.image}`);
      } else {
        Alert.alert("Error", "Server did not return an image.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate graph.");
    } finally {
      setLoadingGraph(false);
    }
  };

  const exportCSV = async () => {
    if (!canRun) {
      Alert.alert("No courses selected", "Select at least one course first.");
      return;
    }

    try {
      setLoadingCsv(true);

      const res = await fetch(`${backendUrl}/make-csv/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/csv" },
        body: JSON.stringify({ courses }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Server error ${res.status}: ${text || res.statusText}`,
        );
      }

      const cd = res.headers.get("content-disposition") || "";
      const match = cd.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || "courses.csv";

      const bytes = new Uint8Array(await res.arrayBuffer());

      // Write a temp file in app storage (new API)
      const temp = new File(Paths.document, filename);
      if (temp.exists) temp.delete();
      temp.create();
      temp.write(bytes);

      // ---- iOS: user must "Save to Files" (no true Downloads folder) ----
      if (Platform.OS === "ios") {
        await Sharing.shareAsync(temp.uri, {
          mimeType: "text/csv",
          dialogTitle: `Save ${filename}`,
          UTI: "public.comma-separated-values-text",
        });
        return;
      }

      // ---- Android: actually save to a folder (Downloads etc.) via SAF ----
      const { StorageAccessFramework } = FileSystemLegacy;

      const perm =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Pick a folder to save the CSV.");
        return;
      }

      const destUri = await StorageAccessFramework.createFileAsync(
        perm.directoryUri,
        filename,
        "text/csv",
      );

      // SAF legacy writes strings, so decode bytes -> text
      const csvText = new TextDecoder("utf-8").decode(bytes);

      await StorageAccessFramework.writeAsStringAsync(destUri, csvText);

      Alert.alert("Saved", `Saved ${filename}`);
    } catch (e: any) {
      console.error(e);
      Alert.alert("CSV Export failed", e?.message ?? "Unknown error");
    } finally {
      setLoadingCsv(false);
    }
  };

  const openCurricularAnalytics = async () => {
    const url = "https://curricularanalytics.org/home";
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert("Can't open link", url);
      return;
    }
    Linking.openURL(url);
  };

  const bg = scheme === "dark" ? "#1f2022" : "#f3f4f6";
  const border = theme.icon;

  return (
    <View
      style={[
        styles.card,
        { borderColor: border, backgroundColor: theme.background },
      ]}
    >
      <View style={styles.header}>
        {/* Row 1: Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          Course Prerequisites Graph
        </Text>

        {/* Row 2: Buttons */}
        <View style={styles.actions}>
          <SmallButton
            label={loadingCsv ? "Generating CSV..." : "Download CSV"}
            onPress={exportCSV}
            disabled={!canRun || loadingCsv}
            scheme={scheme}
            theme={theme}
          />
          <SmallButton
            label="Curricular Analytics"
            onPress={openCurricularAnalytics}
            scheme={scheme}
            theme={theme}
          />
          <SmallButton
            label={imageSrc ? "Remove" : loadingGraph ? "..." : "Make Graph"}
            onPress={makeOrRemoveGraph}
            disabled={!canRun || loadingGraph}
            primary
            scheme={scheme}
            theme={theme}
          />
        </View>
      </View>

      <View
        style={[styles.graphBox, { backgroundColor: bg, borderColor: border }]}
      >
        {loadingGraph ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.tint} />
            <Text style={{ color: theme.icon, marginTop: 8 }}>Generating…</Text>
          </View>
        ) : imageSrc ? (
          <Image
            source={{ uri: imageSrc }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.center}>
            <Text style={{ color: theme.icon, textAlign: "center" }}>
              Graph will display here.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ------------------ small button ------------------ */

function SmallButton({
  label,
  onPress,
  disabled,
  primary,
  scheme,
  theme,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  scheme: "light" | "dark";
  theme: any;
}) {
  const bg = primary ? theme.tint : "transparent";
  const border = theme.icon;

  // If tint is white in dark mode, make text black on primary
  const textColor = primary
    ? scheme === "dark"
      ? "#000"
      : "#fff"
    : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={{ color: textColor, fontWeight: "700", fontSize: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------ styles ------------------ */

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },
  header: {
    flexDirection: "column", // two rows
    gap: 8,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "800", flex: 1 },

  btn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },

  graphBox: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 220,
    overflow: "hidden",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  image: { width: "100%", height: 320 },
});
