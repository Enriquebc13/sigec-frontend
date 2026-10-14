import { GradientScreen } from "@/components/ui/GradientScreen";
import { OptionCard } from "@/components/ui/OptionCard";
import { useAuth } from "@/modules/auth/presentation/context/AuthProvider";
import {
  StyleSheet,
  Text,
  View
} from "react-native";

export default function ClientHomeView() {
  const { user } = useAuth();

  const options = [
    {
      icon: "🏢",
      title: "Espacios disponibles",
      description: "Explora los espacios comerciales disponibles",
      route: "/(client)/properties" as const,
    },
    {
      icon: "🔔",
      title: "Novedades",
      description: "Consulta información y novedades del sistema",
      route: "/(client)/home" as const,
    },
    {
      icon: "📋",
      title: "Mis solicitudes",
      description: "Revisa el estado de tus solicitudes",
      route: "/(client)/requests" as const,
    },
  ];

  return (
    <GradientScreen>
      <View style={styles.header}>
        <Text style={styles.subtitle}>SIGEC</Text>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.description}>
          Encuentra el espacio comercial ideal para ti.
        </Text>
      </View>

      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() ?? "U"}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Sesión iniciada como</Text>
          <Text style={styles.infoUser} numberOfLines={2}>
            {user?.email ?? "Usuario"}
          </Text>
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>
          Tu próximo espacio comienza aquí
        </Text>
        <Text style={styles.welcomeText}>
          Consulta los espacios disponibles y administra tus solicitudes
          desde esta sección.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>¿Qué deseas hacer?</Text>

      {/* TARJETAS */}
      {options.map((option) => (
        <OptionCard key={option.title} {...option} />
      ))} 
      {/* key funciona como un identificador único para que React pueda distinguir cada elemento de una lista. */}

      <Text style={styles.footer}>
        Sistema Integral de Gestión de Espacios Comerciales
      </Text>
    </GradientScreen>

  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    marginTop: 5,
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
    fontSize: 32,
    fontWeight: "bold",
  },
  description: {
    color: "#D6D0E3",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#5E35B1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    color: "#C7B5FF",
    fontSize: 13,
    marginBottom: 5,
  },
  infoUser: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  welcomeCard: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    marginBottom: 28,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 10,
  },
  welcomeText: {
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
  footer: {
    color: "#9E94B0",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
});
