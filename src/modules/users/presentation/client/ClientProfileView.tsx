import { GradientScreen } from "@/components/ui/GradientScreen";
import { InfoRow } from "@/components/ui/InfoRow";
import { Avatar } from "@/components/ui/avatar";
import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUserById } from "../admin/hooks/use-user-by-id";

const roleLabel = { ADMIN: "Administrador", CLIENT: "Cliente" };

export default function ClientProfileView() {
  const { session, logout } = useApiAuth();
  const { user, loading, error } = useUserById(session?.userId);

  // Datos mostrados: los de la API y, mientras no lleguen, los de la sesión
  const displayName = user?.fullName || session?.email || "Usuario";
  const role = user?.role ?? session?.role;

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/login");
          } catch (e) {
            console.error("Error al cerrar sesión:", e);
            Alert.alert("Error", "No se pudo cerrar la sesión. Inténtalo de nuevo.");
          }
        },
      },
    ]);
  };

  return (
    <GradientScreen>
      {/* Encabezado: avatar, nombre y rol */}
      <View style={styles.header}>
        <Avatar />
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        {role && <Text style={styles.roleBadge}>{roleLabel[role]}</Text>}
      </View>

      {/* Datos de la cuenta */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Información de la cuenta</Text>

        {loading && <ActivityIndicator color="#FFFFFF" />}
        {error && <Text style={styles.error}>{error}</Text>}

        <InfoRow
          icon="mail"
          label="Correo electrónico"
          value={user?.email ?? session?.email ?? "-"}
        />
        <InfoRow
          icon="calendar"
          label="Miembro desde"
          value={
            user
              ? user.createdAt.toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "-"
          }
        />
        <InfoRow
          icon="user"
          label="Sesión válida hasta"
          value={
            session
              ? session.expiresAt.toLocaleString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"
          }
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <AntDesign name="logout" size={20} color="#FCA5A5" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 25,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  roleBadge: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "bold",
    color: "#D7C9FF",
    backgroundColor: "rgba(94,53,177,0.45)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 28,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  error: {
    color: "#FCA5A5",
    fontSize: 12,
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
  },
  logoutText: {
    color: "#FCA5A5",
    fontSize: 16,
    fontWeight: "bold",
  },
});