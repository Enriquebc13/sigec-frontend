import { GradientScreen } from "@/components/ui/GradientScreen";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import {
  goToAdminProperty,
  goToPropertyWaitlist,
} from "@/modules/property/presentation/property-navigation";
import { getDealState, dealLabel } from "@/modules/request/domain/deal-state";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  matchesRequestFilter,
  REQUEST_FILTER_OPTIONS,
  RequestFilter,
} from "../request-filters";
import { REQUEST_STATUS_LABELS } from "../request-labels";
import { AdminRequestCard } from "./components/AdminRequestCard";
import { EditRequestStatusModal } from "./components/EditRequestStatusModal";
import { useAdminRequests } from "./hooks/use-admin-requests";

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

/**
 * "Solicitudes recibidas" de UNA propiedad (admin). Usa
 * GET /requests?propertyId=<id> (JWT + rol ADMIN) y filtra por estado en el
 * dispositivo para poder mostrar también "Canceladas" (la API no tiene ese
 * estado: es REJECTED con cancelledByApplicant) y el conteo de cada chip.
 */
export default function PropertyRequestsView() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const propertyId = Array.isArray(id) ? id[0] : id;

  if (!propertyId) {
    return (
      <GradientScreen>
        <Text style={styles.empty}>
          No se indicó de qué propiedad ver las solicitudes. Entra desde
          Propiedades o Listas de espera.
        </Text>
      </GradientScreen>
    );
  }
  return <Content propertyId={propertyId} />;
}

function Content({ propertyId }: { propertyId: string }) {
  const {
    requests,
    loading,
    error,
    reload: reloadRequests,
  } = useAdminRequests({ propertyId });
  const { properties, reload: reloadProperties } = useProperties();

  const property = properties.find((p) => p.id === propertyId);

  const [filter, setFilter] = useState<RequestFilter>("ALL");
  const [editing, setEditing] = useState<AdminPropertyRequest | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // El drawer mantiene la pantalla montada: al cambiar de propiedad, filtro limpio
  useEffect(() => setFilter("ALL"), [propertyId]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  const counts = useMemo(() => {
    const map = {} as Record<RequestFilter, number>;
    for (const opt of REQUEST_FILTER_OPTIONS) {
      map[opt.value] = requests.filter((r) =>
        matchesRequestFilter(r, opt.value),
      ).length;
    }
    return map;
  }, [requests]);

  const visible = useMemo(
    () => requests.filter((r) => matchesRequestFilter(r, filter)),
    [requests, filter],
  );

  const deal = property
    ? getDealState(
        property.status,
        requests.find((r) => r.status === "APPROVED") ?? null,
      )
    : null;
  const dealText = deal ? dealLabel(deal) : null;

  const reloadAll = async () => {
    await Promise.all([reloadRequests(), reloadProperties()]);
  };

  const handleSaved = (status: DecisionStatus) => {
    setEditing(null);
    setNotice(
      `Solicitud ${REQUEST_STATUS_LABELS[status].toLowerCase()} correctamente`,
    );
    // Aprobar o rechazar también cambia el estado de la propiedad
    reloadAll();
  };

  const title = property?.title ?? requests[0]?.property.title ?? "Propiedad";
  const status = property?.status ?? requests[0]?.property.status;

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
        <Text style={styles.subtitle}>Solicitudes recibidas</Text>
        <View style={styles.head}>
          <Text style={styles.title}>{title}</Text>
          {status && (
            <Text style={styles.status}>
              {PROPERTY_STATUS_LABELS[status] ?? status}
            </Text>
          )}
        </View>

        {dealText && (
          <Text style={[styles.deal, deal?.inconsistent && styles.dealWarn]}>
            {status === "RENTED" ? "🏠" : deal?.inconsistent ? "⚠️" : "🤝"}{" "}
            {dealText}
          </Text>
        )}

        <View style={styles.links}>
          <Pressable
            style={styles.linkBtn}
            onPress={() => goToAdminProperty(propertyId)}
          >
            <Text style={styles.linkBtnText}>Ver propiedad</Text>
          </Pressable>
          <Pressable
            style={styles.linkBtn}
            onPress={() => goToPropertyWaitlist(propertyId)}
          >
            <Text style={styles.linkBtnText}>Lista de espera</Text>
          </Pressable>
        </View>

        {notice && <Text style={styles.notice}>{notice}</Text>}

        <View style={styles.chips}>
          {REQUEST_FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setFilter(opt.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label} · {counts[opt.value]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando solicitudes...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={reloadAll}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && requests.length === 0 && (
          <Text style={styles.empty}>
            Esta propiedad todavía no ha recibido solicitudes.
          </Text>
        )}

        {!loading && !error && requests.length > 0 && visible.length === 0 && (
          <Text style={styles.empty}>
            No hay solicitudes con este estado.
          </Text>
        )}

        {!loading &&
          !error &&
          visible.map((request, index) => (
            <AdminRequestCard
              key={request.id}
              request={request}
              onManage={setEditing}
              highlight={
                request.status === "PENDING" &&
                request.posicionListaEspera === 1 &&
                filter !== "REJECTED" &&
                index === visible.findIndex((r) => r.posicionListaEspera === 1)
              }
            />
          ))}
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
  subtitle: { fontSize: 13, color: "#AFA3C8", marginTop: 6 },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  title: { flex: 1, fontSize: 20, fontWeight: "bold", color: "#FFFFFF" },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#C7B5FF",
    backgroundColor: "rgba(139,92,246,0.20)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  deal: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#E4DAFF",
    backgroundColor: "rgba(139,92,246,0.16)",
    borderRadius: 10,
    padding: 10,
    overflow: "hidden",
  },
  dealWarn: { color: "#FCD34D", backgroundColor: "rgba(245,158,11,0.15)" },
  links: { flexDirection: "row", gap: 8, marginTop: 14, marginBottom: 16 },
  linkBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtnText: { color: "#C7B5FF", fontWeight: "bold", fontSize: 13 },
  notice: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginBottom: 16,
    overflow: "hidden",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipActive: { backgroundColor: "#5E35B1", borderColor: "#7C4DFF" },
  chipText: { fontSize: 12, color: "#D0C6E5", fontWeight: "500" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  center: { paddingVertical: 40, alignItems: "center" },
  loadingText: { color: "#D0C6E5", fontSize: 14, marginTop: 12 },
  errorCard: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
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
  empty: { fontSize: 14, color: "#D0C6E5", textAlign: "center", marginVertical: 18, lineHeight: 20 },
});
