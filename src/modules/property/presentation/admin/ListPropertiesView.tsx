import { GradientScreen } from "@/components/ui/GradientScreen";
import { SearchInput } from "@/components/ui/SearchInput";
import { goToPropertyRequests, goToPropertyWaitlist } from "@/modules/property/presentation/property-navigation";
import { buildQueues } from "@/modules/request/presentation/admin/waitlist-utils";
import { useAdminRequests } from "@/modules/request/presentation/admin/hooks/use-admin-requests";
import { PropertyImageCarousel } from "@/modules/users/presentation/admin/components/PropertyImageCarousel";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AutoRejectedNotice } from "@/modules/request/presentation/admin/components/AutoRejectedNotice";
import { clearAutoRejected, useAutoRejected } from "./auto-rejected-store";
import { useProperties } from "./hooks/use-properties";


const typeLabels: Record<string, string> = {
  LOCAL: "Local comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

export default function ListPropertiesView() {

  const { properties, loading, error, remove, reload } = useProperties();

  // Solicitudes de todas las propiedades: cuántas esperan en cada una y quién la rentó
  const {
    requests,
    loading: requestsLoading,
    error: requestsError,
  } = useAdminRequests();
  const queues = useMemo(() => buildQueues(requests), [requests]);
  const showCount = !requestsLoading && !requestsError;

  // Solicitudes que la API rechazó sola al guardar una propiedad (ej. pasó a rentada)
  const autoRejected = useAutoRejected();

  const [searchText, setSearchText] = useState("");
  //Para filtrar propiedades
  // Quita acentos y mayúsculas
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();


  const filteredProperties = properties.filter((property) => {
    const query = normalize(searchText.trim());
    if (!query) return true;

    const searchable = [
      property.title,
      property.address?.street,
      property.address?.city,
    ]
      .filter(Boolean)
      .join(" ");

    return normalize(searchable).includes(query);
  });

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      "Eliminar propiedad",
      `¿Seguro que quieres eliminar "${title}"? También se borrarán sus fotos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(id);
            } catch (e) {
              Alert.alert(
                "Error",
                e instanceof Error ? e.message : "No se pudo eliminar la propiedad."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <GradientScreen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C7B5FF" />
        </View>
      </GradientScreen>
    );
  }

  if (error) {
    return (
      <GradientScreen>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </GradientScreen>
    );
  }

  return (
    <GradientScreen>
      <View style={styles.container}>

        <AutoRejectedNotice rejected={autoRejected} onDismiss={clearAutoRejected} />

        <Text style={styles.subtitle}>
          Consulta y administra los espacios comerciales registrados
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {properties.length}
          </Text>
          <Text style={styles.summaryText}>
            Propiedades registradas
          </Text>
        </View>

        <Pressable
          style={styles.newButton}
          onPress={() => router.navigate("/createProperty")}
        >
          <Text style={styles.newButtonText}>+ Nueva propiedad</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>
          Lista de propiedades
        </Text>
        <SearchInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por título, calle o ciudad..."
        />

        {filteredProperties.map((property) => (


          <View key={property.id} style={styles.propertyCard}>
            <PropertyImageCarousel images={property.images} />

            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  {property.type === "LOCAL"
                    ? "🏪"
                    : property.type === "OFFICE"
                      ? "🏢"
                      : "📦"}
                </Text>
              </View>

              <View style={styles.propertyInfo}>
                <Text style={styles.propertyName}>
                  {property.title}
                </Text>
                <Text style={styles.type}>
                  {typeLabels[property.type]}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              {property.description}
            </Text>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Renta mensual</Text>
              <Text style={styles.price}>
                ${property.price.toLocaleString("es-MX")} MXN
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mantenimiento</Text>
              <Text style={styles.detailValue}>
                {property.maintenanceCost !== null
                  ? `$${property.maintenanceCost.toLocaleString("es-MX")} MXN`
                  : "No especificado"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dimensiones</Text>
              <Text style={styles.detailValue}>
                {property.dimensions ?? "No especificadas"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Piso</Text>
              <Text style={styles.detailValue}>
                {property.floor ?? "No especificado"}
              </Text>
            </View>

            <Text style={styles.detailLabel}>Servicios y amenidades</Text>
            <Text style={styles.detailValue}>
              {property.amenities ?? "No especificados"}
            </Text>

            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.status,
                  property.status === "AVAILABLE"
                    ? styles.available
                    : property.status === "RESERVED"
                      ? styles.reserved
                      : property.status === "RENTED"
                        ? styles.rented
                        : styles.unavailable,
                ]}
              >
                {statusLabels[property.status]}
              </Text>
            </View>

            {property.status === "RENTED" && queues.get(property.id)?.approved && (
              <Text style={styles.renterText}>
                🏠 Rentada por {queues.get(property.id)!.approved!.applicant.name}{" "}
                {queues.get(property.id)!.approved!.applicant.lastname}
              </Text>
            )}

            <Pressable
              style={styles.waitlistButton}
              onPress={() => goToPropertyWaitlist(property.id)}
            >
              <Text style={styles.waitlistText}>
                Lista de espera
                {showCount
                  ? ` · ${queues.get(property.id)?.pending.length ?? 0} en espera`
                  : ""}
              </Text>
            </Pressable>

            <Pressable
              style={styles.waitlistButton}
              onPress={() => goToPropertyRequests(property.id)}
            >
              <Text style={styles.waitlistText}>Solicitudes recibidas</Text>
            </Pressable>

            <View style={styles.actions}>
              <Pressable
                style={styles.editButton}
                onPress={() =>
                  router.navigate({
                    pathname: "/editProperty",
                    params: { id: property.id },
                  })
                }
              >
                <Text style={styles.editText}>Editar</Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(property.id, property.title)}
              >
                <Text style={styles.deleteText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>


        ))}
        {filteredProperties.length === 0 && (
          <Text style={styles.emptyMessage}>
            {searchText.trim()
              ? "No se encontraron propiedades con esa búsqueda."
              : "No hay propiedades registradas."}
          </Text>
        )}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 6,
    marginBottom: 22,
  },
  newButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  newButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
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
  propertyCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cover: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(94,53,177,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 23,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  type: {
    fontSize: 12,
    color: "#C7B5FF",
    marginTop: 5,
  },
  description: {
    fontSize: 13,
    color: "#D0C6E5",
    marginTop: 12,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#AFA3C8",
    marginTop: 7,
  },
  detailValue: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "right",
    flexShrink: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#86EFAC",
    textAlign: "right",
  },
  statusContainer: {
    marginTop: 12,
    alignItems: "flex-start",
  },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  available: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.15)",
  },
  reserved: {
    color: "#FCD34D",
    backgroundColor: "rgba(234,179,8,0.15)",
  },
  rented: {
    color: "#C7B5FF",
    backgroundColor: "rgba(139,92,246,0.20)",
  },
  unavailable: {
    color: "#FCA5A5",
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  renterText: {
    fontSize: 12,
    color: "#C7B5FF",
    fontWeight: "600",
    marginTop: 12,
  },
  waitlistButton: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(94,53,177,0.35)",
  },
  waitlistText: {
    color: "#C7B5FF",
    fontWeight: "bold",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(139,92,246,0.20)",
  },
  editText: {
    color: "#C7B5FF",
    fontWeight: "bold",
    fontSize: 13,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.15)",
  },
  deleteText: {
    color: "#FCA5A5",
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#D0C6E5",
    textAlign: "center",
    marginTop: 15,
  },
});
