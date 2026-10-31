import AntDesign from "@expo/vector-icons/AntDesign";
import { StyleSheet, TextInput, View } from "react-native";

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Buscar...",
}: SearchInputProps) {
  return (
    <View style={styles.container}>
      <AntDesign name="search" size={20} color="#C8C2D2" />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A99CBD"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 12,
    marginLeft: 10,
  },
});
