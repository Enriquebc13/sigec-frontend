import { GradientScreen } from "@/components/ui/GradientScreen";
import { StyleSheet, Text, View } from "react-native";

const users = [
  {
    id: "1",
    name: "Carlos Hernández",
    email: "carlos@gmail.com",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: "2",
    name: "María López",
    email: "maria@gmail.com",
    role: "Cliente",
    status: "Activo",
  },
  {
    id: "3",
    name: "José Martínez",
    email: "jose@gmail.com",
    role: "Cliente",
    status: "Inactivo",
  },
  {
    id: "4",
    name: "Ana García",
    email: "ana@gmail.com",
    role: "Cliente",
    status: "Activo",
  },
];

export default function ListUsersView() {
  return (
    <GradientScreen>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Consulta los usuarios registrados en SIGEC
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{users.length}</Text>
          <Text style={styles.summaryText}>Usuarios registrados</Text>
        </View>

        <Text style={styles.sectionTitle}>Lista de usuarios</Text>

        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0)}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>

              <View style={styles.details}>
                <Text style={styles.role}>{user.role}</Text>
                <Text
                  style={[
                    styles.status,
                    user.status === "Activo"
                      ? styles.active
                      : styles.inactive,
                  ]}
                >
                  {user.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
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
