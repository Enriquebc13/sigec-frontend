import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import {
  AdminPropertyRequest,
  DecisionStatus,
} from "@/modules/request/domain/entities/request.entity";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RequestFilterChips } from "../components/RequestFilterChips";
import {
  matchesRequestFilter,
  normalizeText,
  RequestFilter,
} from "../request-filters";
import { AdminRequestCard } from "./components/AdminRequestCard";
import { EditRequestStatusModal } from "./components/EditRequestStatusModal";
import { useAdminRequests } from "./hooks/use-admin-requests";
import { useRequestHistory } from "./hooks/use-request-history";
import { REQUEST_STATUS_LABELS } from "../request-labels";

export default function ListRequestsView() {
  const {
    requests,
    loading,
    refreshing,
    error,
    refresh: refreshRequests,
    reload: reloadRequests,
  } = useAdminRequests();
  const { byRequest, reload: reloadHistory } = useRequestHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<RequestFilter>("ALL");
  const [editing, setEditing] = useState<AdminPropertyRequest | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // El aviso de éxito se quita solo a los 3 s
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);

  const refresh = async () => {
    await Promise.all([refreshRequests(), reloadHistory()]);
  };

  const handleSaved = (status: DecisionStatus) => {
    setEditing(null);
    setNotice(`Solicitud ${REQUEST_STATUS_LABELS[status].toLowerCase()} correctamente`);
    // El cambio aparece como un evento nuevo en el historial
    reloadRequests();
    reloadHistory();
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "PENDING").length,
    [requests],
  );

  const filteredRequests = useMemo(() => {
    const query = normalizeText(searchQuery.trim());
    return requests.filter((req) => {
      if (!matchesRequestFilter(req, selectedFilter)) return false;
      if (!query) return true;
      const searchable = [
        req.applicant.name,
        req.applicant.lastname,
        req.applicant.email,
        req.property.title,
        req.telefono,
        req.id,
      ].join(" ");
      return normalizeText(searchable).includes(query);
    });
  }, [requests, searchQuery, selectedFilter]);

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
          Consulta las solicitudes de espacios comerciales
        </Text>

        {notice && <Text style={styles.notice}>{notice}</Text>}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {loading ? "..." : requests.length}
            </Text>
            <Text style={styles.summaryText}>Registradas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {loading ? "..." : pendingCount}
            </Text>
            <Text style={styles.summaryText}>Pendientes</Text>
          </View>
        </View>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por cliente, propiedad o teléfono..."
        />

        <RequestFilterChips value={selectedFilter} onChange={setSelectedFilter} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lista de solicitudes</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshText}>Actualizar ↻</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando solicitudes...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin solicitudes</Text>
            <Text style={styles.emptySubtitle}>
              Cuando un cliente solicite una propiedad aparecerá aquí.
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          requests.length > 0 &&
          filteredRequests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Sin coincidencias</Text>
              <Text style={styles.emptySubtitle}>
                No se encontraron solicitudes con esa búsqueda o filtro.
              </Text>
            </View>
          )}

        {!loading &&
          !error &&
          filteredRequests.map((request) => (
            <AdminRequestCard
              key={request.id}
              request={request}
              history={byRequest.get(request.id)}
              onManage={setEditing}
            />
          ))}
      </View>

      {/* key reinicia la selección al abrir otra solicitud */}
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
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 6,
    marginBottom: 22,
  },
  notice: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    marginBottom: 16,
    overflow: "hidden",
  },
  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  summaryNumber: { fontSize: 30, fontWeight: "bold", color: "#FFFFFF" },
  summaryText: { fontSize: 13, color: "#D0C6E5", marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(94,53,177,0.35)",
  },
  refreshText: { color: "#C7B5FF", fontSize: 13, fontWeight: "600" },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
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
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#AFA3C8",
    textAlign: "center",
    lineHeight: 20,
  },
});
