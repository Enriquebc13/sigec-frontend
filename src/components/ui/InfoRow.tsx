import AntDesign from "@expo/vector-icons/AntDesign";
import { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: ComponentProps<typeof AntDesign>["name"];
  label: string;
  value: string;
};

// Fila de información con icono, etiqueta y valor
export function InfoRow({ icon, label, value }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <AntDesign name={icon} size={18} color="#D7C9FF" />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(94,53,177,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    color: "#C7B5FF",
    fontSize: 12,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
});