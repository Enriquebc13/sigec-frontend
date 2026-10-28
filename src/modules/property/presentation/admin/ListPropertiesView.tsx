import { GradientScreen } from "@/components/ui/GradientScreen";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
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

  const { properties, loading, error } = useProperties();

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

        <Text style={styles.sectionTitle}>
          Lista de propiedades
        </Text>

        {properties.map((property) => (
          <View key={property.id} style={styles.propertyCard}>
            {property.images.length > 0 && (
              <Image
                source={{ uri: property.images[0].url }}
                style={styles.cover}
                resizeMode="cover"
              />
            )}

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
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 6,
    marginBottom: 22,
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
});
