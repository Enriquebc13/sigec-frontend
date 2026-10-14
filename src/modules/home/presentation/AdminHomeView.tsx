import { GradientScreen } from "@/components/ui/GradientScreen";
import { OptionCard } from "@/components/ui/OptionCard";
import { useAuth } from "@/modules/auth/presentation/context/AuthProvider";
import { router } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function AdminHomeView() {
  const { user } = useAuth();

  const options = [
    {
      title: "Usuarios",
      description: "Administrar las cuentas registradas",
      icon: "👥",
      route: "/(admin)/users" as const,
    },
    {
      title: "Propiedades",
      description: "Consultar y administrar propiedades",
      icon: "🏢",
      route: "/(admin)/properties" as const,
    },
    {
      title: "Solicitudes",
      description: "Revisar las solicitudes de los clientes",
      icon: "📋",
      route: "/(admin)/requests" as const,
    },

  ];

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Text style={styles.subtitle}>SIGEC</Text>
        <Text style={styles.title}>Panel de administración</Text>
        <Text style={styles.welcome}>¡Bienvenido, administrador!</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Panel general</Text>
        <Text style={styles.summaryText}>
          Administra los usuarios, las propiedades, los espacios comerciales
          y las solicitudes desde un solo lugar.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Gestión del sistema</Text>
      {/* TARJETAS */}
      {options.map((option) => (
        <OptionCard key={option.title} {...option} />
      ))}
      {/* key funciona como un identificador único para que React
       pueda distinguir cada elemento de una lista. */}

      <TouchableOpacity
        style={styles.profileButton}
        activeOpacity={0.8}
        onPress={() => router.replace('/(admin)/profile')}

      >
        <Text style={styles.profileButtonText}>Mi perfil  →</Text>
      </TouchableOpacity>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  subtitle: {
    color: "#C7B5FF",
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "bold",
  },
  welcome: {
    color: "#E0D7FF",
    fontSize: 17,
    marginTop: 14,
  },
  email: {
    color: "#BDBDBD",
    fontSize: 13,
    marginTop: 6,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 28,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    color: "#D6D0E3",
    fontSize: 14,
    lineHeight: 22,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
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
  profileButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "rgba(94, 53, 177, 0.45)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  profileButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
