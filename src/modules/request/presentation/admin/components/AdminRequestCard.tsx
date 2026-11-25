import { goToAdminProperty } from "@/modules/property/presentation/property-navigation";
import { RequestHistory } from "@/modules/request/domain/entities/request-history.entity";
import {
  AdminPropertyRequest,
  allowedDecisions,
} from "@/modules/request/domain/entities/request.entity";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RequestCard from "../../components/RequestCard";
import { actionLabel } from "../../request-labels";
import { buildContactMessage, isWhatsAppReachable, openWhatsApp } from "../whatsapp";

const formatDateTime = (date: Date) =>
  isNaN(date.getTime())
    ? "Fecha no disponible"
    : date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

type Props = {
  request: AdminPropertyRequest;
  /** Eventos de esta solicitud, el más reciente primero. Sin esto no hay historial. */
  history?: RequestHistory[];
  onManage: (request: AdminPropertyRequest) => void;
  /** Resalta la tarjeta (el "siguiente a contactar" en la lista de espera). */
  highlight?: boolean;
};

/**
 * Tarjeta de solicitud para el admin: datos, historial desplegable y botón de
 * acción según lo que la API permite desde el estado actual.
 */
export function AdminRequestCard({ request, history, onManage, highlight }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  const rented =
    request.status === "APPROVED" && request.property.status === "RENTED";
  const canManage = allowedDecisions(request.status).length > 0;
  const applicantName = `${request.applicant.name} ${request.applicant.lastname}`.trim();

  return (
    <View style={highlight ? styles.highlight : undefined}>
      <RequestCard
        request={request}
        propertyTitle={request.property.title}
        applicant={{
          name: `${request.applicant.name} ${request.applicant.lastname}`.trim(),
          email: request.applicant.email,
        }}
      >
        {rented && <Text style={styles.rented}>🏠 Propiedad rentada a este solicitante</Text>}

        {history && history.length > 0 && (
          <>
            <Pressable onPress={() => setShowHistory((v) => !v)} style={styles.historyToggle}>
              <Text style={styles.historyToggleText}>
                {showHistory ? "Ocultar historial ▲" : `Ver historial (${history.length}) ▼`}
              </Text>
            </Pressable>

            {showHistory &&
              history.map((event) => {
                const byApplicant =
                  event.action === "REJECTED" && event.userId === request.userId;
                return (
                  <View key={event.id} style={styles.event}>
                    <Text style={styles.eventDot}>•</Text>
                    <View style={styles.eventBody}>
                      <Text style={styles.eventAction}>
                        {byApplicant
                          ? "Cancelada por el solicitante"
                          : actionLabel(event.action)}
                      </Text>
                      <Text style={styles.eventMeta}>
                        {formatDateTime(event.changedAt)} · {event.authorName}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </>
        )}

        {isWhatsAppReachable(request.telefono) && (
          <Pressable
            style={styles.whatsapp}
            accessibilityLabel={`Escribir por WhatsApp a ${applicantName}`}
            onPress={() =>
              openWhatsApp(
                request.telefono,
                buildContactMessage({
                  applicant: request.applicant.name,
                  propertyTitle: request.property.title,
                  status: request.status,
                  position: request.posicionListaEspera,
                }),
              )
            }
          >
            <Text style={styles.whatsappText}>Escribir por WhatsApp</Text>
          </Pressable>
        )}

        {rented ? (
          <>
            <Pressable
              style={styles.button}
              onPress={() => goToAdminProperty(request.propertyId)}
            >
              <Text style={styles.buttonText}>Ver propiedad</Text>
            </Pressable>
            <Text style={styles.hint}>
              Para terminar el contrato, abre la propiedad y cámbiala a
              «Disponible».
            </Text>
          </>
        ) : canManage ? (
          <Pressable style={styles.button} onPress={() => onManage(request)}>
            <Text style={styles.buttonText}>Gestionar</Text>
          </Pressable>
        ) : (
          <Text style={styles.hint}>
            Una solicitud rechazada no se puede reabrir.
          </Text>
        )}
      </RequestCard>
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#7C4DFF",
    marginBottom: 14,
    overflow: "hidden",
  },
  rented: { fontSize: 12, color: "#C7B5FF", marginTop: 10, fontWeight: "600" },
  historyToggle: { marginTop: 12 },
  historyToggleText: { fontSize: 13, color: "#C7B5FF", fontWeight: "600" },
  event: { flexDirection: "row", marginTop: 8 },
  eventDot: { color: "#C7B5FF", marginRight: 8, fontSize: 16, lineHeight: 18 },
  eventBody: { flex: 1 },
  eventAction: { fontSize: 13, color: "#FFFFFF" },
  eventMeta: { fontSize: 11, color: "#AFA3C8", marginTop: 1 },
  button: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#C7B5FF", fontWeight: "bold", fontSize: 14 },
  whatsapp: {
    marginTop: 14,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "rgba(34,197,94,0.19)",
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappText: { color: "#86EFAC", fontWeight: "bold", fontSize: 14 },
  hint: { fontSize: 12, color: "#AFA3C8", marginTop: 12, lineHeight: 17 },
});
