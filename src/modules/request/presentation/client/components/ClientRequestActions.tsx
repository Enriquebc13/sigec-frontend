import { SIGEC_CONTACT } from "@/core/config/contact";
import { PropertyRequest } from "@/modules/request/domain/entities/request.entity";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  request: PropertyRequest;
  /** Aprobada y la propiedad ya está rentada: el contrato es de este cliente. */
  rentedByMe: boolean;
  onEditPhone: (request: PropertyRequest) => void;
  onCancel: (request: PropertyRequest) => void;
  onDelete: (request: PropertyRequest) => void;
};

/**
 * Acciones del cliente sobre su solicitud (mismas reglas que la web):
 * - Editar teléfono: pendiente o aprobada.
 * - Cancelar: solo pendiente (sale de la lista de espera).
 * - Eliminar: solo rechazada o cancelada.
 * - Aprobada: se cancela con el administrador (datos de contacto).
 */
export function ClientRequestActions({
  request,
  rentedByMe,
  onEditPhone,
  onCancel,
  onDelete,
}: Props) {
  const { status } = request;
  const canEditPhone = status === "PENDING" || status === "APPROVED";

  return (
    <View style={styles.wrap}>
      {rentedByMe && <Text style={styles.rented}>🏠 Rentada por ti</Text>}

      {canEditPhone && (
        <Pressable style={styles.editBtn} onPress={() => onEditPhone(request)}>
          <Text style={styles.editText}>Editar teléfono</Text>
        </Pressable>
      )}

      {status === "PENDING" && (
        <>
          <Pressable style={styles.danger} onPress={() => onCancel(request)}>
            <Text style={styles.dangerText}>Cancelar solicitud</Text>
          </Pressable>
          <Text style={styles.hint}>
            Saldrás de la lista de espera y quienes estén detrás de ti avanzarán
            un lugar.
          </Text>
        </>
      )}

      {status === "REJECTED" && (
        <Pressable style={styles.danger} onPress={() => onDelete(request)}>
          <Text style={styles.dangerText}>Eliminar solicitud</Text>
        </Pressable>
      )}

      {status === "APPROVED" && (
        <Text style={styles.hint}>
          {rentedByMe
            ? "Para cancelar el contrato, contáctanos: "
            : "Una solicitud aprobada se cancela con el administrador: "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`mailto:${SIGEC_CONTACT.email}`)}
          >
            {SIGEC_CONTACT.email}
          </Text>{" "}
          o{" "}
          <Text
            style={styles.link}
            onPress={() => Linking.openURL(`tel:${SIGEC_CONTACT.phoneHref}`)}
          >
            {SIGEC_CONTACT.phone}
          </Text>
          .
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    paddingTop: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },
  rented: { color: "#86EFAC", fontSize: 13, fontWeight: "bold" },
  editBtn: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "rgba(139,92,246,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  editText: { color: "#C7B5FF", fontWeight: "bold", fontSize: 14 },
  danger: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerText: { color: "#FCA5A5", fontWeight: "bold", fontSize: 14 },
  hint: { fontSize: 12, color: "#AFA3C8", lineHeight: 17 },
  link: { color: "#C7B5FF", textDecorationLine: "underline" },
});
