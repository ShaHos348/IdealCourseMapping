import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary" | "danger";
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
  variant = "primary",
}: Props) {
  const scheme = useColorScheme() ?? "light";
  const theme = Colors[scheme];

  const bg =
    variant === "primary"
      ? theme.tint
      : variant === "secondary"
        ? scheme === "dark"
          ? "#2b2d30"
          : "#e9eaec"
        : "#d9534f";

  const textColor =
    variant === "primary"
      ? // your tint is white in dark mode → use black text so it stays readable
        scheme === "dark"
        ? "#000"
        : "#fff"
      : theme.text;

  const borderColor = scheme === "dark" ? "#3a3d41" : "#cfd2d6";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled
            ? scheme === "dark"
              ? "#3a3d41"
              : "#d8dbe0"
            : bg,
          borderColor: variant === "primary" ? "transparent" : borderColor,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: disabled ? (scheme === "dark" ? "#aaa" : "#666") : textColor,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minHeight: 44,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
