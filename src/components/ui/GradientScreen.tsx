import { LinearGradient } from "expo-linear-gradient";
import { ReactElement, ReactNode } from "react";
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native";

type Props = {
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
};

export function GradientScreen({ children, refreshControl }: Props) {
  return (
    <LinearGradient
      colors={["#5E35B1", "#1A0B2E", "#000000"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 35 },
});