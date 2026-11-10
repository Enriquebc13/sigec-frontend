import { GradientScreen } from "@/components/ui/GradientScreen";
import { OptionCard } from "@/components/ui/OptionCard";
import { Slice, StatsPieCard } from "@/components/ui/StatsPieCard";
import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import { useUsers } from "@/modules/users/presentation/admin/hooks/use-users";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PROPERTY_STATUSES = [
  {
    key: "AVAILABLE",
    label: "Disponibles",
    color: "#22C55E",
    icon: "check-circle" as const,
  },
  {
    key: "RESERVED",
    label: "Reservados",
    color: "#FBBF24",
    icon: "clock-circle" as const,
  },
  {
    key: "RENTED",
    label: "Rentados",
    color: "#60A5FA",
    icon: "key" as const,
  },
  {
    key: "UNAVAILABLE",
    label: "No disponibles",
    color: "#F87171",
    icon: "close-circle" as const,
  },
];

export default function AdminHomeView() {
  const { session } = useApiAuth();
  const {
    users,
    loading: loadingUsers,
    error: usersError,
    refresh: refreshUsers,
  } = useUsers();
  const {
    properties,
    loading: loadingProperties,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();

  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh: recarga las dos fuentes de datos a la vez
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshUsers(), reloadProperties()]);
    setRefreshing(false);
  }, [refreshUsers, reloadProperties]);

  // Usuarios por rol
  const userSlices: Slice[] = useMemo(
    () => [
      {
        label: "Administradores",
        value: users.filter((u) => u.role === "ADMIN").length,
        color: "#8B5CF6",
        icon: "idcard" as const,
      },
      {
        label: "Clientes",
        value: users.filter((u) => u.role === "CLIENT").length,
        color: "#60A5FA",
        icon: "user" as const,
      },
    ],
    [users],
  );

  // Propiedades por estado
  const propertySlices: Slice[] = useMemo(
    () =>
      PROPERTY_STATUSES.map((s) => ({
        label: s.label,
        value: properties.filter((p) => String(p.status) === s.key).length,
        color: s.color,
        icon: s.icon,
      })),
    [properties],
  );


  const options = [
    {
      title: "Usuarios",
      description: "Administrar las cuentas registradas",
      icon: <AntDesign name="team" size={24} color="#D7C9FF" />,
      route: "/(admin)/users" as const,
    },
    {
      title: "Propiedades",
      description: "Consultar y administrar propiedades",
      icon: <AntDesign name="home" size={24} color="#D7C9FF" />,
      route: "/(admin)/properties" as const,
    },
    {
      title: "Solicitudes",
      description: "Revisar las solicitudes de los clientes",
      icon: <AntDesign name="ordered-list" size={24} color="#D7C9FF" />,
      route: "/(admin)/requests" as const,
    },
  ];

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"    // iOS
          colors={["#5E35B1"]}   // Android
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.subtitle}>SIGEC</Text>
        <Text style={styles.title}>Panel de administración</Text>
        <Text style={styles.welcome}>¡Bienvenido, administrador!</Text>
        <Text style={styles.email}>{session?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Gestión del sistema</Text>
      {options.map((option) => (
        <OptionCard key={option.title} {...option} />
      ))}

      <Text style={[styles.sectionTitle, styles.statsTitle]}>
        Resumen del sistema
      </Text>

      <StatsPieCard
        title="Usuarios"
        subtitle="Distribución por rol"
        icon={<AntDesign name="team" size={20} color="#D7C9FF" />}
        slices={userSlices}
        loading={loadingUsers && users.length === 0}
        error={usersError}
      />

      <StatsPieCard
        title="Espacios"
        subtitle="Distribución por estado"
        icon={<AntDesign name="home" size={20} color="#D7C9FF" />}
        slices={propertySlices}
        loading={loadingProperties && properties.length === 0}
        error={propertiesError}
      />

      <TouchableOpacity
        style={styles.profileButton}
        activeOpacity={0.8}
        onPress={() => router.replace("/(admin)/profile")}
      >
        <Text style={styles.profileButtonText}>Mi perfil  →</Text>
      </TouchableOpacity>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsTitle: {
    marginTop: 18,
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