import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RequestCard from "../components/RequestCard";
import { RequestFilterChips } from "../components/RequestFilterChips";
import {
  matchesRequestFilter,
  normalizeText,
  RequestFilter,
} from "../request-filters";
import { useMyRequests } from "./hooks/use-my-requests";

export default function MyRequestsView() {
  const {
    requests,
    loading: requestsLoading,
    refreshing,
    error,
    refresh,
  } = useMyRequests();
  // /my-requests solo trae propertyId: el nombre sale del catálogo de propiedades
  const { properties, loading: propertiesLoading } = useProperties();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<RequestFilter>("ALL");

  const loading = requestsLoading || propertiesLoading;

  const titleById = useMemo(
    () => new Map(properties.map((p) => [p.id, p.title])),
    [properties],
  );
  const titleOf = (propertyId: string) =>
    titleById.get(propertyId) ?? "Propiedad no disponible";

  const filteredRequests = useMemo(() => {
    const query = normalizeText(searchQuery.trim());
    return requests.filter((req) => {
      if (!matchesRequestFilter(req, selectedFilter)) return false;
      if (!query) return true;
      const searchable = [
        titleById.get(req.propertyId) ?? "",
        req.id,
        req.telefono,
      ].join(" ");
      return normalizeText(searchable).includes(query);
    });
  }, [requests, titleById, searchQuery, selectedFilter]);

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
          Consulta el estado y seguimiento de tus solicitudes
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {loading ? "..." : requests.length}
          </Text>
          <Text style={styles.summaryText}>
            {requests.length === 1
              ? "Solicitud registrada"
              : "Solicitudes registradas"}
          </Text>
        </View>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por propiedad o teléfono..."
        />

        <RequestFilterChips value={selectedFilter} onChange={setSelectedFilter} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus solicitudes</Text>
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
            <Text style={styles.loadingText}>Cargando tus solicitudes...</Text>
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
            <Text style={styles.emptyTitle}>Sin solicitudes activas</Text>
            <Text style={styles.emptySubtitle}>
              Aún no has solicitado ningún espacio comercial. Explora las
              propiedades disponibles y toca «Me interesa» en la que más te
              guste.
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
                No se encontraron solicitudes que coincidan con tu búsqueda o
                filtro seleccionado.
              </Text>
            </View>
          )}

        {!loading &&
          !error &&
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              propertyTitle={titleOf(request.propertyId)}
            />
          ))}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 6,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  summaryNumber: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF" },
  summaryText: { fontSize: 14, color: "#D0C6E5", marginTop: 4 },
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
