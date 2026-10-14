import { GradientScreen } from "@/components/ui/GradientScreen";
import { StyleSheet, Text, View } from "react-native";

const requests = [
  {
    id: "1",
    telefono: "2221234567",
    status: "PENDING",
    createdAt: "10/10/2026",
    user: "María López",
    property: "Local Comercial Centro",
    history: ["CREATED"],
  },
  {
    id: "2",
    telefono: "2229876543",
    status: "APPROVED",
    createdAt: "08/10/2026",
    user: "Carlos Hernández",
    property: "Oficina Ejecutiva",
    history: ["CREATED", "APPROVED"],
  },
  {
    id: "3",
    telefono: "2214567890",
    status: "REJECTED",
    createdAt: "05/10/2026",
    user: "Ana García",
    property: "Bodega Industrial",
    history: ["CREATED", "REJECTED"],
  },
  {
    id: "4",
    telefono: "2227654321",
    status: "PENDING",
    createdAt: "09/10/2026",
    user: "José Martínez",
    property: "Local Plaza Norte",
    history: ["CREATED", "UPDATED"],
  },
];

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
};

const actionLabels: Record<string, string> = {
  CREATED: "Creada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  UPDATED: "Actualizada",
};

export default function ListRequestsView() {
  return (
    <GradientScreen>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Consulta las solicitudes de espacios comerciales
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {requests.length}
          </Text>
          <Text style={styles.summaryText}>
            Solicitudes registradas
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          Lista de solicitudes
        </Text>

        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.requestNumber}>
                Solicitud #{request.id}
              </Text>

              <Text
                style={[
                  styles.status,
                  request.status === "PENDING"
                    ? styles.pending
                    : request.status === "APPROVED"
                    ? styles.approved
                    : styles.rejected,
                ]}
              >
                {statusLabels[request.status] ?? request.status}
              </Text>
            </View>

            <Text style={styles.clientName}>
              {request.user}
            </Text>
            <Text style={styles.clientLabel}>Cliente</Text>

            <View style={styles.divider} />

            <Text style={styles.detailLabel}>Propiedad solicitada</Text>
            <Text style={styles.detailText}>
              {request.property}
            </Text>

            <Text style={styles.detailLabel}>Teléfono de contacto</Text>
            <Text style={styles.detailText}>
              {request.telefono}
            </Text>

            <Text style={styles.detailLabel}>Fecha de registro</Text>
            <Text style={styles.detailText}>
              {request.createdAt}
            </Text>

            <Text style={styles.detailLabel}>Historial de acciones</Text>
            <View style={styles.historyContainer}>
              {request.history.map((action, index) => (
                <View key={`${action}-${index}`} style={styles.historyItem}>
                  <Text style={styles.historyDot}>•</Text>
                  <Text style={styles.historyText}>
                    {actionLabels[action] ?? action}
                  </Text>
                </View>
              ))}
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
  requestCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  requestNumber: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#C7B5FF",
  },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  pending: {
    color: "#FCD34D",
    backgroundColor: "rgba(234,179,8,0.15)",
  },
  approved: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  rejected: {
    color: "#FCA5A5",
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  clientName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  clientLabel: {
    fontSize: 12,
    color: "#AFA3C8",
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: "#AFA3C8",
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
  },
  historyContainer: {
    marginTop: 5,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  historyDot: {
    color: "#C7B5FF",
    fontSize: 18,
    marginRight: 8,
  },
  historyText: {
    color: "#D0C6E5",
    fontSize: 13,
  },
});

