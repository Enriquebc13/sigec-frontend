import { SIGEC_CONTACT } from "@/core/config/contact";
import { useReloadOnFocus } from "@/hooks/use-reload-on-focus";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import { goToClientProperty } from "@/modules/property/presentation/property-navigation";
import { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useMyRequests } from "../hooks/use-my-requests";

/**
 * Propiedades que el cliente tiene rentadas: su solicitud fue aprobada y el
 * admin ya marcó la propiedad como rentada. Incluye cómo cancelar el contrato.
 * No muestra nada si no tiene ninguna.
 */
export function RentedPropertiesSection() {
  const { requests, error } = useMyRequests();
  const { properties, reload: reloadProperties } = useProperties();

  // El admin cambia el estado de la propiedad fuera de esta pantalla
  useReloadOnFocus(reloadProperties);

  const rented = useMemo(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return requests
      .filter((r) => r.status === "APPROVED")
      .map((request) => ({ request, property: byId.get(request.propertyId) }))
      .filter(({ property }) => property?.status === "RENTED");
  }, [requests, properties]);

  // No se oculta mientras recarga: se conserva lo ya cargado para que no parpadee
  if (error || rented.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {rented.length === 1 ? "Mi propiedad rentada" : "Mis propiedades rentadas"}
      </Text>

      {rented.map(({ request, property }) => {
        const address = [property?.address?.street, property?.address?.city]
          .filter(Boolean)
          .join(", ");
        return (
          <View key={request.id} style={styles.item}>
            <View style={styles.head}>
              <Text style={styles.name} numberOfLines={2}>
                {property?.title}
              </Text>
              <Text style={styles.badge}>🏠 Rentada por ti</Text>
            </View>
            {!!address && <Text style={styles.address}>{address}</Text>}
            <Pressable onPress={() => goToClientProperty(request.propertyId)}>
              <Text style={styles.link}>Ver en el catálogo ›</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          <Text style={styles.bold}>¿Quieres cancelar el contrato?</Text> Contáctanos y
          un administrador lo gestionará. Mientras no se cancele, la propiedad seguirá
          marcada como rentada por ti.
        </Text>
        <Text style={styles.noteText}>
          Correo:{" "}
          <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${SIGEC_CONTACT.email}`)}>
            {SIGEC_CONTACT.email}
          </Text>
          {"\n"}Teléfono:{" "}
          <Text style={styles.link} onPress={() => Linking.openURL(`tel:${SIGEC_CONTACT.phoneHref}`)}>
            {SIGEC_CONTACT.phone}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(34,197,94,0.10)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.28)",
    marginBottom: 28,
    gap: 12,
  },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  item: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  badge: {
    color: "#86EFAC",
    backgroundColor: "rgba(34,197,94,0.19)",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  address: { color: "#C8C2D2", fontSize: 12 },
  link: { color: "#C7B5FF", fontSize: 13, fontWeight: "bold", textDecorationLine: "underline" },
  note: { gap: 6 },
  noteText: { color: "#D0C6E5", fontSize: 12, lineHeight: 18 },
  bold: { fontWeight: "bold", color: "#FFFFFF" },
});
