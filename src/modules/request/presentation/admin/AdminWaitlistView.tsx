import { GradientScreen } from "@/components/ui/GradientScreen";
import { useReloadOnFocus } from "@/hooks/use-reload-on-focus";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import {
  goToAdminProperty,
  goToPropertyRequests,
} from "@/modules/property/presentation/property-navigation";
import {
  AdminPropertyRequest,
  DecisionStatus,
} from "@/modules/request/domain/entities/request.entity";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { REQUEST_STATUS_LABELS } from "../request-labels";
import { AdminRequestCard } from "./components/AdminRequestCard";
import { EditRequestStatusModal } from "./components/EditRequestStatusModal";
import { useAdminRequests } from "./hooks/use-admin-requests";
import { buildQueues, emptyQueue } from "./waitlist-utils";

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

/**
 * Listas de espera del admin: una propiedad a la vez, con sus solicitudes
 * pendientes ordenadas por lugar y la solicitud aprobada (trato en curso).
 * Acepta el parámetro `property` para abrir una propiedad concreta.
 */
export default function AdminWaitlistView() {
  const { property: paramId } = useLocalSearchParams<{ property?: string }>();

  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
    reload: reloadRequests,
  } = useAdminRequests();
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();

  const [selectedId, setSelectedId] = useState<string | undefined>(paramId);
  const [editing, setEditing] = useState<AdminPropertyRequest | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // El drawer mantiene la pantalla montada: si llega otra propiedad por parámetro, cámbiala
  useEffect(() => {
    if (paramId) setSelectedId(paramId);
  }, [paramId]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);

  const reloadAll = async () => {
    await Promise.all([reloadRequests(), reloadProperties()]);
  };

  // Los estados de propiedad cambian en otras pantallas
  useReloadOnFocus(reloadProperties);

  const queues = useMemo(() => buildQueues(requests), [requests]);

  // Propiedades con más gente esperando primero
  const sortedProperties = useMemo(
    () =>
      [...properties].sort(
        (a, b) =>
          (queues.get(b.id)?.pending.length ?? 0) -
            (queues.get(a.id)?.pending.length ?? 0) ||
          a.title.localeCompare(b.title, "es"),
      ),
    [properties, queues],
  );

  const selected =
    sortedProperties.find((p) => p.id === selectedId) ?? sortedProperties[0];
  const queue = (selected && queues.get(selected.id)) ?? emptyQueue();
  const rejectedOnly = queue.rejectedCount - queue.cancelledCount;

  const firstLoad =
    (requestsLoading && requests.length === 0) ||
    (propertiesLoading && properties.length === 0);
  const error = requestsError ?? propertiesError;

  const handleSaved = (status: DecisionStatus) => {
    setEditing(null);
    setNotice(`Solicitud ${REQUEST_STATUS_LABELS[status].toLowerCase()} correctamente`);
    // Aprobar o rechazar también cambia el estado de la propiedad
    reloadAll();
  };

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await reloadAll();
            setRefreshing(false);
          }}
          tintColor="#FFFFFF"
          colors={["#5E35B1"]}
        />
      }
    >
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Quién espera cada propiedad y a quién contactar primero
        </Text>

        {notice && <Text style={styles.notice}>{notice}</Text>}

        {firstLoad && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando listas de espera...</Text>
          </View>
        )}

        {!firstLoad && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reloadAll}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!firstLoad && !error && sortedProperties.length === 0 && (
          <Text style={styles.empty}>Todavía no hay propiedades registradas.</Text>
        )}

        {!firstLoad && !error && selected && (
          <>
            {/* ---------- Selector de propiedad ---------- */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.propsRow}
              style={styles.propsScroll}
            >
              {sortedProperties.map((property) => {
                const count = queues.get(property.id)?.pending.length ?? 0;
                const active = property.id === selected.id;
                return (
                  <Pressable
                    key={property.id}
                    onPress={() => setSelectedId(property.id)}
                    style={[styles.propChip, active && styles.propChipActive]}
                  >
                    <Text
                      style={[styles.propChipText, active && styles.propChipTextActive]}
                      numberOfLines={1}
                    >
                      {property.title}
                    </Text>
                    <Text style={[styles.badge, count > 0 && styles.badgeActive]}>
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ---------- Detalle ---------- */}
            <View style={styles.detailHead}>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <Text style={styles.detailStatus}>
                {PROPERTY_STATUS_LABELS[selected.status] ?? selected.status}
              </Text>
            </View>
            <Text style={styles.summary}>
              {queue.pending.length} en espera ·{" "}
              {queue.approved ? "1 aprobada" : "0 aprobadas"} · {rejectedOnly}{" "}
              {rejectedOnly === 1 ? "rechazada" : "rechazadas"} ·{" "}
              {queue.cancelledCount}{" "}
              {queue.cancelledCount === 1 ? "cancelada" : "canceladas"}
            </Text>

            <View style={styles.links}>
              <Pressable style={styles.linkBtn} onPress={() => goToAdminProperty(selected.id)}>
                <Text style={styles.linkBtnText}>Ver propiedad</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => goToPropertyRequests(selected.id)}>
                <Text style={styles.linkBtnText}>Solicitudes recibidas</Text>
              </Pressable>
            </View>

            {queue.approved && (
              <>
                <Text style={styles.section}>Trato en curso</Text>
                <AdminRequestCard request={queue.approved} onManage={setEditing} />
                <Text style={styles.hint}>
                  {selected.status === "RENTED"
                    ? "La propiedad ya está rentada a este solicitante. Si pide cancelar el contrato y ya hablaron, cambia la propiedad a «Disponible» desde Propiedades."
                    : "Si el trato se cae, rechaza esta solicitud y la propiedad volverá a «Disponible». Cuando se firme el contrato, cambia la propiedad a «Rentada» desde Propiedades y las demás solicitudes en espera se rechazarán solas."}
                </Text>
              </>
            )}

            <Text style={styles.section}>Lista de espera</Text>
            {queue.pending.length === 0 ? (
              <Text style={styles.empty}>
                No hay solicitudes en espera para esta propiedad.
              </Text>
            ) : (
              <>
                {queue.pending.map((request, index) => (
                  <AdminRequestCard
                    key={request.id}
                    request={request}
                    onManage={setEditing}
                    highlight={index === 0}
                  />
                ))}
                <Text style={styles.hint}>
                  El lugar #1 es el siguiente a contactar. Al rechazarlo, el
                  lugar #2 pasa a ser el primero.
                </Text>
              </>
            )}
          </>
        )}
      </View>

      {editing && (
        <EditRequestStatusModal
          key={editing.id}
          requestId={editing.id}
          currentStatus={editing.status}
          applicant={`${editing.applicant.name} ${editing.applicant.lastname}`.trim()}
          telefono={editing.telefono}
          propertyTitle={editing.property.title}
          position={editing.posicionListaEspera}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: { fontSize: 14, color: "#D0C6E5", marginTop: 6, marginBottom: 18 },
  notice: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginBottom: 16,
    overflow: "hidden",
  },
  center: { paddingVertical: 50, alignItems: "center" },
  loadingText: { color: "#D0C6E5", fontSize: 14, marginTop: 12 },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  errorText: { color: "#FCA5A5", fontSize: 14, textAlign: "center", marginBottom: 10 },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  empty: { fontSize: 14, color: "#D0C6E5", textAlign: "center", marginVertical: 18 },
  propsScroll: { flexGrow: 0, marginBottom: 18 },
  propsRow: { gap: 8, paddingRight: 8 },
  propChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 220,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  propChipActive: { backgroundColor: "#5E35B1", borderColor: "#7C4DFF" },
  propChipText: { fontSize: 13, color: "#D0C6E5", flexShrink: 1 },
  propChipTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  badge: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#D0C6E5",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
  },
  badgeActive: { color: "#FCD34D", backgroundColor: "rgba(245,158,11,0.25)" },
  detailHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  detailTitle: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  detailStatus: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#C7B5FF",
    backgroundColor: "rgba(139,92,246,0.20)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  summary: { fontSize: 12, color: "#AFA3C8", marginTop: 8, marginBottom: 6, lineHeight: 17 },
  section: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF", marginTop: 16, marginBottom: 12 },
  hint: { fontSize: 12, color: "#AFA3C8", lineHeight: 17, marginBottom: 6 },
  links: { flexDirection: "row", gap: 8, marginTop: 4 },
  linkBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtnText: { color: "#C7B5FF", fontWeight: "bold", fontSize: 13 },
});
