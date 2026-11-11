import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import { RequestStatus } from "@/modules/request/domain/entities/request.entity";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RequestCard from "../components/RequestCard";
import { useMyRequests } from "./hooks/use-my-requests";

type StatusFilter = "ALL" | RequestStatus;

const filterOptions: { label: string; value: StatusFilter }[] = [
  { label: "Todas", value: "ALL" },
  { label: "Pendientes", value: "PENDING" },
  { label: "Aprobadas", value: "APPROVED" },
  { label: "Rechazadas", value: "REJECTED" },
];

export default function MyRequestsView() {
  const { requests, loading, refreshing, error, refresh } = useMyRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>("ALL");

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesFilter =
        selectedFilter === "ALL" || req.status === selectedFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        req.propertyName.toLowerCase().includes(query) ||
        req.id.toLowerCase().includes(query) ||
        req.telefono.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
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
          Consulta el estado y seguimiento de tus solicitudes
        </Text>

        {/* Resumen de solicitudes */}
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

        {/* Campo de búsqueda */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por propiedad o teléfono..."
        />

        {/* Filtros por estado */}
        <View style={styles.filtersContainer}>
          {filterOptions.map((opt) => {
            const isSelected = selectedFilter === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSelectedFilter(opt.value)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Encabezado de la lista */}
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

        {/* Estado de carga */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando tus solicitudes...</Text>
          </View>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sin solicitudes registradas */}
        {!loading && !error && requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin solicitudes activas</Text>
            <Text style={styles.emptySubtitle}>
              Aún no has solicitado ningún espacio comercial. Explora las
              propiedades disponibles y solicita la que más te interese.
            </Text>
          </View>
        )}

        {/* Sin resultados tras filtrar */}
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

        {/* Lista de solicitudes */}
        {!loading &&
          !error &&
          filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              showClient={false}
            />
          ))}
      </View>
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
  filtersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  filterChipActive: {
    backgroundColor: "#5E35B1",
    borderColor: "#7C4DFF",
  },
  filterChipText: {
    fontSize: 13,
    color: "#D0C6E5",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(94,53,177,0.35)",
  },
  refreshText: {
    color: "#C7B5FF",
    fontSize: 13,
    fontWeight: "600",
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#D0C6E5",
    fontSize: 14,
    marginTop: 12,
  },
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
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
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
