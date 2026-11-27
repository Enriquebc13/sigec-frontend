import { AutoRejectedRequest } from "@/modules/property/domain/entities/property.entity";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  buildContactMessage,
  isWhatsAppReachable,
  openWhatsApp,
} from "../whatsapp";

type Props = {
  rejected: AutoRejectedRequest[];
  onDismiss: () => void;
};

/**
 * Aviso para el admin cuando la API rechazó solicitudes por sí sola
 * (propiedad marcada como rentada o reserva liberada). Cada una trae un botón
 * para avisar por WhatsApp.
 */
export function AutoRejectedNotice({ rejected, onDismiss }: Props) {
  if (rejected.length === 0) return null;
  const n = rejected.length;

  return (
    <View style={styles.card} accessibilityRole="alert">
      <View style={styles.head}>
        <Text style={styles.title}>
          Se {n === 1 ? "rechazó" : "rechazaron"} automáticamente {n}{" "}
          {n === 1 ? "solicitud" : "solicitudes"}
        </Text>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={styles.close}>Cerrar</Text>
        </Pressable>
      </View>
      <Text style={styles.text}>
        Avísales por WhatsApp para que no se queden esperando:
      </Text>

      {rejected.map((request) => {
        const fullName = `${request.applicant.name} ${request.applicant.lastname}`.trim();
        const wasApproved = request.previousStatus === "APPROVED";
        return (
          <View key={request.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.who}>{fullName}</Text>
              <Text style={styles.small}>
                {request.propertyTitle} ·{" "}
                {wasApproved ? "estaba aprobada" : "estaba pendiente"}
              </Text>
            </View>

            {isWhatsAppReachable(request.telefono) ? (
              <Pressable
                style={styles.send}
                onPress={() =>
                  openWhatsApp(
                    request.telefono,
                    buildContactMessage({
                      applicant: fullName,
                      propertyTitle: request.propertyTitle,
                      // Si estaba aprobada, el contrato se cancela de común
                      // acuerdo: mensaje neutro en vez del texto de rechazo
                      status: wasApproved ? "PENDING" : "REJECTED",
                    }),
                  )
                }
              >
                <Text style={styles.sendText}>
                  💬 {wasApproved ? "Contactar" : "Avisar"}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.small}>Sin WhatsApp: {request.telefono}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(245,158,11,0.13)",
    borderWidth: 1,
    borderColor: "rgba(252,211,77,0.35)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  title: { flex: 1, color: "#FCD34D", fontSize: 14, fontWeight: "bold" },
  close: { color: "#D0C6E5", fontSize: 12, fontWeight: "bold" },
  text: { color: "#D0C6E5", fontSize: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  who: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  small: { color: "#C8C2D2", fontSize: 11, marginTop: 2 },
  send: {
    backgroundColor: "rgba(34,197,94,0.19)",
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.3)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendText: { color: "#86EFAC", fontSize: 12, fontWeight: "bold" },
});
