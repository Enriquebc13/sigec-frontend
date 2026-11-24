import { PropertyImageCarousel } from "@/modules/users/presentation/admin/components/PropertyImageCarousel";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Property } from "../../../domain/entities/property.entity";
import { CatalogAction, CatalogActionVariant } from "../catalog-action";

export const TYPE_LABELS: Record<string, string> = {
  LOCAL: "Local comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
};

export const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

const typeIcon = (type: string) =>
  type === "LOCAL" ? "🏪" : type === "OFFICE" ? "🏢" : "📦";

type Props = {
  property: Property;
  action: CatalogAction;
  onPressAction: () => void;
};

export function ClientPropertyCard({ property, action, onPressAction }: Props) {
  const address = [property.address?.street, property.address?.city]
    .filter(Boolean)
    .join(", ");

  const statusStyle =
    property.status === "AVAILABLE"
      ? styles.available
      : property.status === "RESERVED"
        ? styles.reserved
        : property.status === "RENTED"
          ? styles.rented
          : styles.unavailable;

  return (
    <View style={styles.card}>
      <PropertyImageCarousel images={property.images} />

      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{typeIcon(property.type)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{property.title}</Text>
          <Text style={styles.type}>
            {TYPE_LABELS[property.type] ?? property.type}
          </Text>
        </View>
        <Text style={[styles.status, statusStyle]}>
          {STATUS_LABELS[property.status] ?? property.status}
        </Text>
      </View>

      {address !== "" && <Text style={styles.address}>📍 {address}</Text>}

      {property.description !== "" && (
        <Text style={styles.description} numberOfLines={3}>
          {property.description}
        </Text>
      )}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Renta mensual</Text>
        <Text style={styles.price}>
          ${property.price.toLocaleString("es-MX")} MXN
        </Text>
      </View>

      {property.maintenanceCost !== null && (
        <View style={styles.row}>
          <Text style={styles.label}>Mantenimiento</Text>
          <Text style={styles.value}>
            ${property.maintenanceCost.toLocaleString("es-MX")} MXN
          </Text>
        </View>
      )}

      {property.dimensions && (
        <View style={styles.row}>
          <Text style={styles.label}>Dimensiones</Text>
          <Text style={styles.value}>{property.dimensions}</Text>
        </View>
      )}

      {property.floor !== null && (
        <View style={styles.row}>
          <Text style={styles.label}>Piso</Text>
          <Text style={styles.value}>{property.floor}</Text>
        </View>
      )}

      {property.amenities && (
        <>
          <Text style={[styles.label, styles.amenitiesLabel]}>
            Servicios y amenidades
          </Text>
          <Text style={styles.amenities}>{property.amenities}</Text>
        </>
      )}

      <Pressable
        style={[styles.button, buttonVariantStyle[action.variant]]}
        onPress={onPressAction}
        disabled={!action.interactive}
      >
        <Text style={[styles.buttonText, textVariantStyle[action.variant]]}>
          {action.label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  header: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(94,53,177,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 23 },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  type: { fontSize: 12, color: "#C7B5FF", marginTop: 5 },
  status: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  available: { color: "#86EFAC", backgroundColor: "rgba(34,197,94,0.15)" },
  reserved: { color: "#FCD34D", backgroundColor: "rgba(234,179,8,0.15)" },
  rented: { color: "#C7B5FF", backgroundColor: "rgba(139,92,246,0.20)" },
  unavailable: { color: "#FCA5A5", backgroundColor: "rgba(239,68,68,0.15)" },
  address: { fontSize: 12, color: "#C8C2D2", marginTop: 12 },
  description: {
    fontSize: 13,
    color: "#D0C6E5",
    marginTop: 10,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  label: { fontSize: 12, color: "#AFA3C8" },
  value: { fontSize: 12, color: "#FFFFFF", textAlign: "right", flexShrink: 1 },
  price: { fontSize: 14, fontWeight: "bold", color: "#86EFAC", textAlign: "right" },
  amenitiesLabel: { marginTop: 4 },
  amenities: { fontSize: 12, color: "#FFFFFF", marginTop: 4, lineHeight: 17 },
  button: {
    marginTop: 16,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  buttonText: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
});

const buttonVariantStyle: Record<CatalogActionVariant, object> = {
  primary: { backgroundColor: "#7C4DFF" },
  pending: { backgroundColor: "rgba(245,158,11,0.15)" },
  done: { backgroundColor: "rgba(34,197,94,0.15)" },
  retry: { backgroundColor: "rgba(139,92,246,0.25)" },
  disabled: { backgroundColor: "rgba(255,255,255,0.08)" },
};

const textVariantStyle: Record<CatalogActionVariant, object> = {
  primary: { color: "#FFFFFF" },
  pending: { color: "#FCD34D" },
  done: { color: "#86EFAC" },
  retry: { color: "#C7B5FF" },
  disabled: { color: "#AFA3C8" },
};
