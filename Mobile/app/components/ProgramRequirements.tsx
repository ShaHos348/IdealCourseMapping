import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type AnyObj = Record<string, any>;

function isPlainObject(v: any): v is AnyObj {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export default function ProgramRequirements({
  program,
  tableData,
}: {
  program: string;
  tableData: any;
}) {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  // themed styles (computed once per render)
  const cardStyle = [
    styles.card,
    { borderColor: theme.icon, backgroundColor: theme.background },
  ];

  const headerRowStyle = [
    styles.row,
    styles.headerRow,
    { borderBottomColor: theme.icon },
  ];

  const rowStyle = [styles.row, { borderBottomColor: theme.icon }];

  const textStyle = { color: theme.text };
  const mutedStyle = { color: theme.icon };

  function renderRow(row: any, key: string) {
    if (Array.isArray(row)) {
      const code = row[0] ?? "";
      const title = row[1] ?? "";
      const credits = row[2] ?? "";

      if (row.length === 2) {
        return (
          <View key={key} style={rowStyle}>
            <Text style={[styles.cell, styles.code, textStyle]}>{String(code)}</Text>
            <Text style={[styles.cell, styles.titleCell, textStyle]}>{String(title)}</Text>
            <Text style={[styles.cell, styles.credits, textStyle]} />
          </View>
        );
      }

      return (
        <View key={key} style={rowStyle}>
          <Text style={[styles.cell, styles.code, textStyle]}>{String(code)}</Text>
          <Text style={[styles.cell, styles.titleCell, textStyle]}>{String(title)}</Text>
          <Text style={[styles.cell, styles.credits, textStyle]}>
            {credits === "" || credits === null || credits === undefined ? "" : String(credits)}
          </Text>
        </View>
      );
    }

    if (row === null || row === undefined) return null;

    if (typeof row === "string" || typeof row === "number" || typeof row === "boolean") {
      return (
        <Text key={key} style={[styles.primitiveLine, textStyle]}>
          {String(row)}
        </Text>
      );
    }

    if (isPlainObject(row)) {
      return (
        <View key={key} style={styles.objectBox}>
          {Object.entries(row).map(([k, v]) => (
            <Text key={`${key}-${k}`} style={[styles.objectLine, textStyle]}>
              {k}: {String(v)}
            </Text>
          ))}
        </View>
      );
    }

    return (
      <Text key={key} style={[styles.primitiveLine, textStyle]}>
        {String(row)}
      </Text>
    );
  }

  function renderSectionValue(value: any, sectionKey: string) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <Text style={[styles.primitiveLine, mutedStyle]}>No items.</Text>;
      }
      return value.map((row, idx) => renderRow(row, `${sectionKey}-${idx}`));
    }

    if (isPlainObject(value)) {
      return Object.entries(value).map(([k, v]) =>
        renderRow(`${k}: ${String(v)}`, `${sectionKey}-${k}`)
      );
    }

    return renderRow(value, `${sectionKey}-value`);
  }

  if (!tableData || (typeof tableData !== "object" && !Array.isArray(tableData))) {
    return (
      <View style={cardStyle}>
        <Text style={[styles.title, textStyle]}>{program || "Program Requirements"}</Text>
        <Text style={[textStyle]}>No program requirements available.</Text>
      </View>
    );
  }

  const entries = isPlainObject(tableData)
    ? Object.entries(tableData)
    : [["Requirements", tableData]];

  return (
    <View style={cardStyle}>
      <Text style={[styles.title, textStyle]}>{program || "Program Requirements"}</Text>

      {/* header */}
      <View style={headerRowStyle}>
        <Text style={[styles.cell, styles.code, styles.headerText, textStyle]}>Code</Text>
        <Text style={[styles.cell, styles.titleCell, styles.headerText, textStyle]}>Title</Text>
        <Text style={[styles.cell, styles.credits, styles.headerText, textStyle]}>Credits</Text>
      </View>

      <ScrollView>
        {entries.map(([section, value]) => (
          <View key={String(section)} style={styles.section}>
            <Text style={[styles.sectionTitle, textStyle]}>{String(section)}</Text>
            {renderSectionValue(value, String(section))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },

  section: { marginBottom: 10 },
  sectionTitle: { fontWeight: "bold", fontSize: 15, marginBottom: 6 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
  },
  headerRow: { borderBottomWidth: 1, paddingBottom: 6 },
  headerText: { fontWeight: "bold" },

  cell: { fontSize: 13 },
  code: { width: 90 },
  titleCell: { flex: 1, paddingHorizontal: 6 },
  credits: { width: 60, textAlign: "right" },

  primitiveLine: { fontSize: 13, paddingVertical: 2, paddingLeft: 6 },
  objectBox: { paddingLeft: 6, paddingVertical: 2 },
  objectLine: { fontSize: 13, paddingVertical: 1 },
});