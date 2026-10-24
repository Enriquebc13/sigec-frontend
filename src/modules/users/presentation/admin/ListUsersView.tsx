import { GradientScreen } from "@/components/ui/GradientScreen";
import { UserChanges } from "@/modules/users/domain/entities/user-changes.entity";
import { User } from "@/modules/users/domain/entities/user.entity";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { UserDetailModal } from "./components/UserDetailModal";
import { useUsers } from "./hooks/use-users";

const roleLabel = { ADMIN: "Administrador", CLIENT: "Cliente" };

export default function ListUsersView() {
  const { users, loading, refreshing, refresh, error, deleteUser, updateUser } =
    useUsers();

  // Se guarda el id (no el objeto) y el usuario se busca en la lista:
  // así, después de editar, el modal muestra los datos nuevos
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  // Si el borrado sale bien, el hook actualiza la lista y aquí se cierra el modal.
  // Si falla, se muestra el motivo y el modal se queda abierto.
  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user.id);
      setSelectedId(null);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo eliminar el usuario. Intenta de nuevo.");
    }
  };

  // Devuelve true/false para que el modal sepa si salir del modo edición
  const handleUpdate = async (user: User, changes: UserChanges): Promise<boolean> => {
    try {
      await updateUser(user.id, changes);
      return true;
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo actualizar el usuario.");
      return false;
    }
  };

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor="#FFFFFF"    // iOS
          colors={["#5E35B1"]}   // Android
        />
      }>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Consulta los usuarios registrados en SIGEC
        </Text>

        {loading && <ActivityIndicator color="#FFFFFF" />}
        {error && <Text style={styles.email}>{error}</Text>}

        {!loading && !error && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{users.length}</Text>
              <Text style={styles.summaryText}>Usuarios registrados</Text>
            </View>

            <Text style={styles.sectionTitle}>Lista de usuarios</Text>

            {users.map((user) => (
              // Pressable hace tocable la tarjeta: al tocarla se abre el modal con ese usuario
              <Pressable
                key={user.id}
                style={styles.userCard}
                onPress={() => setSelectedId(user.id)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.fullName.charAt(0)}</Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                  <Text style={styles.email}>
                    Miembro desde:{" "}
                    {user.createdAt.toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>

                  <View style={styles.details}>
                    <Text style={styles.role}>{roleLabel[user.role]}</Text>
                    <Text
                      style={[
                        styles.status,
                        user.active ? styles.active : styles.inactive,
                      ]}
                    >
                      {user.active ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </View>

      {/* El modal solo se muestra cuando hay un usuario seleccionado */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 6,
    marginBottom: 22,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  summaryText: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5E35B1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 12,
    color: "#C8C2D2",
    marginTop: 4,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    gap: 8,
  },
  role: {
    fontSize: 11,
    color: "#D7C9FF",
    backgroundColor: "rgba(94,53,177,0.45)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  active: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  inactive: {
    color: "#FCA5A5",
    backgroundColor: "rgba(239,68,68,0.15)",
  },
});