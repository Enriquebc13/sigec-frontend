import { Request } from "@/modules/request/domain/entities/request.entity";
import { StyleSheet, Text, View } from "react-native";

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

export default function RequestCard({ request, showClient = true }: { request: Request; showClient?: boolean }) {
  return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.requestNumber}>Solicitud #{request.id.slice(-6)}</Text>
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

      {showClient && (
        <>
          <Text style={styles.clientName}>{request.userName}</Text>
          <Text style={styles.clientLabel}>Cliente</Text>
          <View style={styles.divider} />
        </>
      )}

      <Text style={styles.detailLabel}>Propiedad solicitada</Text>
      <Text style={styles.detailText}>{request.propertyName}</Text>

      <Text style={styles.detailLabel}>Teléfono de contacto</Text>
      <Text style={styles.detailText}>{request.telefono}</Text>

      <Text style={styles.detailLabel}>Fecha de registro</Text>
      <Text style={styles.detailText}>
        {request.createdAt.toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Text>

      {request.history.length > 0 && (
        <>
          <Text style={styles.detailLabel}>Historial de acciones</Text>
          <View style={styles.historyContainer}>
            {request.history.map((action, index) => (
              <View key={`${action}-${index}`} style={styles.historyItem}>
                <Text style={styles.historyDot}>•</Text>
                <Text style={styles.historyText}>{actionLabels[action] ?? action}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  requestNumber: { fontSize: 13, fontWeight: "bold", color: "#C7B5FF" },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pending: { color: "#FCD34D", backgroundColor: "rgba(245,158,11,0.15)" },
  approved: { color: "#86EFAC", backgroundColor: "rgba(34,197,94,0.15)" },
  rejected: { color: "#FCA5A5", backgroundColor: "rgba(239,68,68,0.15)" },
  clientName: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  clientLabel: { fontSize: 12, color: "#C8C2D2", marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.10)", marginVertical: 12 },
  detailLabel: { fontSize: 12, color: "#C8C2D2", marginTop: 8 },
  detailText: { fontSize: 14, color: "#FFFFFF", marginTop: 2 },
  historyContainer: { marginTop: 6 },
  historyItem: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  historyDot: { color: "#C7B5FF", marginRight: 6 },
  historyText: { fontSize: 13, color: "#D0C6E5" },
});