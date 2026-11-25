import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import { normalizeText } from "@/modules/request/presentation/request-filters";
import { useMyRequests } from "@/modules/request/presentation/client/hooks/use-my-requests";
import { router, useLocalSearchParams } from "expo-router";
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
import { Property } from "../../domain/entities/property.entity";
import { useProperties } from "../admin/hooks/use-properties";
import { getCatalogAction, latestRequestByProperty } from "./catalog-action";
import { ClientPropertyCard } from "./components/ClientPropertyCard";
import { RequestFormModal } from "./components/RequestFormModal";

type Option = { label: string; value: string };

const TYPE_OPTIONS: Option[] = [
  { label: "Todos", value: "ALL" },
  { label: "Local", value: "LOCAL" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Bodega", value: "WAREHOUSE" },
];

const STATUS_OPTIONS: Option[] = [
  { label: "Todos", value: "ALL" },
  { label: "Disponible", value: "AVAILABLE" },
  { label: "Reservada", value: "RESERVED" },
  { label: "Rentada", value: "RENTED" },
];

export default function PropertyCatalogView() {
  const { properties, loading, error, reload } = useProperties();
  // Al ganar foco recarga las solicitudes: el botón de cada tarjeta siempre
  // refleja el estado real (pendiente, aprobada, rechazada...)
  const { requests, reload: reloadRequests } = useMyRequests();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Property | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ?property=<id>: llegó desde "Ver propiedad"; muestra solo esa propiedad
  // (con opción de volver al catálogo completo).
  const { property: propertyParam } = useLocalSearchParams<{
    property?: string | string[];
  }>();
  const focusId = Array.isArray(propertyParam) ? propertyParam[0] : propertyParam;

  const requestByProperty = useMemo(
    () => latestRequestByProperty(requests),
    [requests],
  );

  const filtered = useMemo(() => {
    const query = normalizeText(search.trim());
    return properties.filter((p) => {
      if (focusId && p.id !== focusId) return false;
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (!query) return true;
      const searchable = [p.title, p.address?.street, p.address?.city]
        .filter(Boolean)
        .join(" ");
      return normalizeText(searchable).includes(query);
    });
  }, [properties, search, typeFilter, statusFilter, focusId]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([reload(), reloadRequests()]);
    setRefreshing(false);
  };

  // Spinner a pantalla completa solo la primera vez; después la lista se queda visible
  const firstLoad = loading && properties.length === 0;

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
          Explora los espacios comerciales y solicita el que te interese
        </Text>

        {focusId && (
          <View style={styles.focusBanner}>
            <Text style={styles.focusText}>Mostrando una propiedad</Text>
            <Pressable onPress={() => router.setParams({ property: undefined })}>
              <Text style={styles.focusLink}>Ver todas ›</Text>
            </Pressable>
          </View>
        )}

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título, calle o ciudad..."
        />

        <FilterRow
          title="Tipo"
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <FilterRow
          title="Estado"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {!firstLoad && !error && (
          <Text style={styles.count}>
            {filtered.length === 1
              ? "1 propiedad"
              : `${filtered.length} propiedades`}
          </Text>
        )}

        {firstLoad && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando propiedades...</Text>
          </View>
        )}

        {error && properties.length === 0 && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!firstLoad && !error && properties.length === 0 && (
          <Text style={styles.emptyMessage}>
            Por ahora no hay propiedades en el catálogo.
          </Text>
        )}

        {!firstLoad &&
          properties.length > 0 &&
          filtered.length === 0 && (
            <Text style={styles.emptyMessage}>
              No se encontraron propiedades con esa búsqueda o filtros.
            </Text>
          )}

        {filtered.map((property) => (
          <ClientPropertyCard
            key={property.id}
            property={property}
            action={getCatalogAction(
              property,
              requestByProperty.get(property.id),
            )}
            onPressAction={() => setSelected(property)}
          />
        ))}
      </View>

      {/* key reinicia el formulario al abrir otra propiedad */}
      {selected && (
        <RequestFormModal
          key={selected.id}
          propertyId={selected.id}
          propertyTitle={selected.title}
          joinsWaitlist={selected.status === "RESERVED"}
          onClose={() => setSelected(null)}
          onSent={() => {
            reloadRequests();
          }}
        />
      )}
    </GradientScreen>
  );
}

function FilterRow({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <View style={styles.chips}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  focusBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(139,92,246,0.20)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  focusText: { color: "#E4DAFF", fontSize: 13, fontWeight: "600" },
  focusLink: { color: "#C7B5FF", fontSize: 13, fontWeight: "bold" },
  filterBlock: { marginBottom: 14 },
  filterTitle: { fontSize: 12, color: "#AFA3C8", marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipActive: { backgroundColor: "#5E35B1", borderColor: "#7C4DFF" },
  chipText: { fontSize: 13, color: "#D0C6E5", fontWeight: "500" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "bold" },
  count: { fontSize: 13, color: "#D0C6E5", marginTop: 6, marginBottom: 14 },
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
  emptyMessage: {
    fontSize: 14,
    color: "#D0C6E5",
    textAlign: "center",
    marginTop: 15,
  },
});
