
import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider";
import { UserChanges } from "@/modules/users/domain/entities/user-changes.entity";
import { User } from "@/modules/users/domain/entities/user.entity";
import AntDesign from "@expo/vector-icons/AntDesign";
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
import { EditUserModal } from "./components/EditUserModal";
import { useUsers } from "./hooks/use-users";

const roleLabel = {
  ADMIN: "Administrador",
  CLIENT: "Cliente",
};

export default function ListUsersView() {
  const {
    users,
    loading,
    refreshing,
    refresh,
    error,
    deleteUser,
    updateUser,
  } = useUsers();

  const { session } = useApiAuth();

  // Estado del buscador
  const [searchName, setSearchName] = useState("");

  // Guarda el ID del usuario que se está editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingUser = users.find((u) => u.id === editingId) ?? null;

  // ID del usuario que se está eliminando
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtra los usuarios por nombre, ignorando mayúsculas y minúsculas
  const filteredUsers = users.filter((user) =>
    user.fullName
      .toLowerCase()
      .includes(searchName.trim().toLowerCase())
  );

  // Confirma antes de eliminar
  const confirmDelete = (user: User) => {
    Alert.alert(
      "Eliminar usuario",
      `¿Seguro que quieres eliminar a ${user.fullName}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(user.id);
              await deleteUser(user.id);
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.message ??
                  "No se pudo eliminar el usuario. Intenta de nuevo."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Actualiza el usuario y cierra el modal si todo sale bien
  const handleUpdate = async (
    user: User,
    changes: UserChanges
  ) => {
    try {
      await updateUser(user.id, changes);
      setEditingId(null);
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message ?? "No se pudo actualizar el usuario."
      );
    }
  };

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor="#FFFFFF"
          colors={["#5E35B1"]}
        />
      }
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Consulta los usuarios registrados en SIGEC
        </Text>

        <SearchInput
          value={searchName}
          onChangeText={setSearchName}
          placeholder="Buscar usuario por nombre..."
        />

        {loading && <ActivityIndicator color="#FFFFFF" />}

        {error && <Text style={styles.email}>{error}</Text>}

        {!loading && !error && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {users.length}
              </Text>
              <Text style={styles.summaryText}>
                Usuarios registrados
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Lista de usuarios
            </Text>

            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.fullName.charAt(0)}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.fullName}
                  </Text>

                  <Text style={styles.email}>
                    {user.email}
                  </Text>

                  <Text style={styles.email}>
                    Miembro desde:{" "}
                    {user.createdAt.toLocaleDateString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>

                  <View style={styles.details}>
                    <Text style={styles.role}>
                      {roleLabel[user.role]}
                    </Text>

                    <Text
                      style={[
                        styles.status,
                        user.active
                          ? styles.active
                          : styles.inactive,
                      ]}
                    >
                      {user.active ? "Activo" : "Inactivo"}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => setEditingId(user.id)}
                    hitSlop={10}
                    accessibilityLabel={`Editar a ${user.fullName}`}
                  >
                    <AntDesign
                      name="edit"
                      size={24}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  {/* El administrador no puede eliminarse a sí mismo */}
                  {user.id !== session?.userId && (
                    <Pressable
                      onPress={() => confirmDelete(user)}
                      disabled={deletingId === user.id}
                      hitSlop={10}
                      accessibilityLabel={`Eliminar a ${user.fullName}`}
                    >
                      {deletingId === user.id ? (
                        <ActivityIndicator color="#F13C3C" />
                      ) : (
                        <AntDesign
                          name="delete"
                          size={24}
                          color="#E64141"
                        />
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {/* Mensaje cuando la búsqueda no encuentra coincidencias */}
            {filteredUsers.length === 0 && (
              <Text style={styles.emptyMessage}>
                {searchName.trim()
                  ? "No se encontraron usuarios con ese nombre."
                  : "No hay usuarios registrados."}
              </Text>
            )}
          </>
        )}
      </View>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingId(null)}
        onSave={handleUpdate}
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
  actions: {
    marginLeft: 10,
    gap: 20,
    alignItems: "center",
  },
  emptyMessage: {
    fontSize: 14,
    color: "#D0C6E5",
    textAlign: "center",
    marginTop: 15,
  },
});
