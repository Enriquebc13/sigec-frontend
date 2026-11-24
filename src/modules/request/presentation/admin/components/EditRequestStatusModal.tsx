import {
  allowedDecisions,
  DecisionStatus,
  RequestStatus,
} from "@/modules/request/domain/entities/request.entity";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { REQUEST_STATUS_LABELS } from "../../request-labels";
import { useUpdateRequestStatus } from "../hooks/use-update-request-status";

type Props = {
  requestId: string;
  currentStatus: RequestStatus;
  applicant: string;
  telefono: string;
  propertyTitle: string;
  onClose: () => void;
  onSaved: (status: DecisionStatus) => void;
};

const OPTIONS: { value: DecisionStatus; title: string; description: string }[] = [
  {
    value: "APPROVED",
    title: "Aprobar",
    description:
      "Se acepta la solicitud y la propiedad pasa a «Reservada». Las demás solicitudes siguen en la lista de espera.",
  },
  {
    value: "REJECTED",
    title: "Rechazar",
    description:
      "Se descarta la solicitud. El siguiente de la fila pasa a ser el primero. Si estaba aprobada, la propiedad vuelve a «Disponible».",
  },
];

/** El padre lo monta con key={requestId} para reiniciar la selección. */
export function EditRequestStatusModal({
  requestId,
  currentStatus,
  applicant,
  telefono,
  propertyTitle,
  onClose,
  onSaved,
}: Props) {
  const { update, loading, error } = useUpdateRequestStatus();
  const [selected, setSelected] = useState<DecisionStatus | null>(null);

  // La API solo permite ciertos cambios desde cada estado (una rechazada no se reabre)
  const allowed = allowedDecisions(currentStatus);
  const options = OPTIONS.filter((o) => allowed.includes(o.value));

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSave = async () => {
    if (!selected || loading) return;
    const ok = await update(requestId, selected);
    if (ok) onSaved(selected);
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Cambiar estado</Text>

              <View style={styles.summary}>
                <Row label="Solicitante" value={applicant} />
                <Row label="Teléfono" value={telefono} />
                <Row label="Propiedad" value={propertyTitle} />
                <Row
                  label="Estado actual"
                  value={REQUEST_STATUS_LABELS[currentStatus]}
                />
              </View>

              {currentStatus === "APPROVED" && (
                <Text style={styles.hint}>
                  Esta solicitud está aprobada. Si el trato no se concreta,
                  puedes rechazarla y la propiedad volverá a estar disponible.
                </Text>
              )}
              {currentStatus === "REJECTED" && (
                <Text style={styles.hint}>
                  Esta solicitud ya fue rechazada y no se puede reabrir. El
                  cliente puede enviar una nueva solicitud.
                </Text>
              )}

              {options.length > 0 && (
                <>
                  <Text style={styles.legend}>Nuevo estado</Text>
                  {options.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        disabled={loading}
                        onPress={() => setSelected(option.value)}
                        style={[
                          styles.option,
                          option.value === "APPROVED"
                            ? styles.optionApprove
                            : styles.optionReject,
                          isSelected && styles.optionSelected,
                        ]}
                      >
                        <View style={styles.radio}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <View style={styles.flex}>
                          <Text style={styles.optionTitle}>{option.title}</Text>
                          <Text style={styles.optionText}>
                            {option.description}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </>
              )}

              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.actions}>
                <Pressable
                  style={[styles.btn, styles.btnGhost]}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.btnGhostText}>
                    {options.length === 0 ? "Cerrar" : "Cancelar"}
                  </Text>
                </Pressable>
                {options.length > 0 && (
                  <Pressable
                    style={[styles.btn, (!selected || loading) && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={!selected || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.btnText}>Guardar cambio</Text>
                    )}
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    backgroundColor: "#0d0818",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 14 },
  summary: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  rowLabel: { fontSize: 12, color: "#AFA3C8" },
  rowValue: { fontSize: 13, color: "#FFFFFF", flexShrink: 1, textAlign: "right" },
  hint: { fontSize: 12, color: "#D0C6E5", marginTop: 12, lineHeight: 17 },
  legend: { fontSize: 13, color: "#D0C6E5", marginTop: 18, marginBottom: 8 },
  option: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  optionApprove: { borderColor: "rgba(34,197,94,0.35)" },
  optionReject: { borderColor: "rgba(239,68,68,0.35)" },
  optionSelected: { backgroundColor: "rgba(124,77,255,0.25)", borderColor: "#7C4DFF" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C7B5FF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#C7B5FF" },
  optionTitle: { fontSize: 14, fontWeight: "bold", color: "#FFFFFF" },
  optionText: { fontSize: 12, color: "#D0C6E5", marginTop: 3, lineHeight: 17 },
  error: {
    color: "#FCA5A5",
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginTop: 4,
    overflow: "hidden",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#7C4DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.08)" },
  btnGhostText: { color: "#D0C6E5", fontWeight: "600", fontSize: 14 },
});
