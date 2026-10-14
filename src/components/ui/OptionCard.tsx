import { Href, router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: string;
  title: string;
  description: string;
  route?: Href;
  onPress?: () => void;
};

export function OptionCard({ icon, title, description, route, onPress }: Props) {
  const handlePress = () => {
    if (onPress) return onPress();
    if (route) router.replace(route);
  };

  return (
    <TouchableOpacity
      style={styles.optionCard}
      activeOpacity={0.75}
      onPress={handlePress}
      disabled={!route && !onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.optionInfo}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(94, 53, 177, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  icon: {
    fontSize: 23,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  optionDescription: {
    color: "#C8C2D2",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },
  arrow: {
    color: "#C7B5FF",
    fontSize: 28,
    marginLeft: 8,
  },
});