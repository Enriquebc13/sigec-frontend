import { useCreateRequest } from "@/modules/request/presentation/client/hooks/use-create-request";
import { displayStatusLabel } from "@/modules/request/presentation/request-labels";
import { router } from "expo-router";
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
  TextInput,
  View,
} from "react-native";

type Props = {
  propertyId: string;
  propertyTitle: string;
  /** La propiedad está reservada: la solicitud entra a la lista de espera */
  joinsWaitlist?: boolean;
  onClose: () => void;
  /** Se llama en cuanto la solicitud se envió, para actualizar las tarjetas */
  onSent: () => void;
};

/**
 * Formulario "Me interesa". El padre lo monta con key={propertyId} para que el
 * estado se reinicie al abrir otra propiedad.
 */
export function RequestFormModal({
  propertyId,
  propertyTitle,
  joinsWaitlist = false,
  onClose,
  onSent,
}: Props) {
  const { create, loading, error, created } = useCreateRequest();
  const [telefono, setTelefono] = useState("");

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;
    const ok = await create({ telefono, propertyId });
    if (ok) onSent();
  };

  const goToRequests = () => {
    onClose();
    router.navigate("/(client)/requests");
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          {/* Pressable interno: evita que tocar la tarjeta cierre el modal */}
          <Pressable style={styles.card} onPress={() => {}}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {created ? (
                <>
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                  <Text style={[styles.title, styles.center]}>
                    ¡Solicitud enviada!
                  </Text>
                  <Text style={[styles.text, styles.center]}>
                    Un administrador revisará tu solicitud y se pondrá en
                    contacto contigo.
                  </Text>

                  <View style={styles.summary}>
                    <SummaryRow label="Propiedad" value={propertyTitle} />
                    <SummaryRow label="Teléfono" value={created.telefono} />
                    <SummaryRow
                      label="Estado"
                      value={displayStatusLabel(
                        created.status,
                        created.cancelledByApplicant,
                      )}
                    />
                    {created.posicionListaEspera !== null && (
                      <SummaryRow
                        label="Lista de espera"
                        value={`Lugar #${created.posicionListaEspera}`}
                      />
                    )}
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.btn, styles.btnGhost]}
                      onPress={onClose}
                    >
                      <Text style={styles.btnGhostText}>Seguir viendo</Text>
                    </Pressable>
                    <Pressable style={styles.btn} onPress={goToRequests}>
                      <Text style={styles.btnText}>Ver mis solicitudes</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Me interesa</Text>
                  <Text style={styles.text}>
                    Vas a enviar una solicitud para{" "}
                    <Text style={styles.bold}>{propertyTitle}</Text>.
                  </Text>
                  {joinsWaitlist && (
                    <Text style={styles.hint}>
                      Esta propiedad está reservada por el momento. Tu solicitud
                      entrará a la lista de espera.
                    </Text>
                  )}

                  <Text style={styles.label}>Teléfono de contacto</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10 dígitos"
                    placeholderTextColor="#A99CBD"
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    maxLength={16}
                    value={telefono}
                    onChangeText={setTelefono}
                    editable={!loading}
                    returnKeyType="send"
                    onSubmitEditing={handleSubmit}
                  />
                  <Text style={styles.hint}>
                    Un administrador te contactará a este número.
                  </Text>

                  {error && <Text style={styles.error}>{error}</Text>}

                  <View style={styles.actions}>
                    <Pressable
                      style={[styles.btn, styles.btnGhost]}
                      onPress={handleClose}
                      disabled={loading}
                    >
                      <Text style={styles.btnGhostText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, loading && styles.btnDisabled]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.btnText}>Enviar solicitud</Text>
                      )}
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
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
    maxWidth: 400,
    maxHeight: "90%",
    backgroundColor: "#0d0818",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10 },
  center: { textAlign: "center" },
  text: { fontSize: 14, color: "#D0C6E5", lineHeight: 20 },
  bold: { fontWeight: "bold", color: "#FFFFFF" },
  hint: { fontSize: 12, color: "#AFA3C8", marginTop: 8, lineHeight: 17 },
  label: { fontSize: 13, color: "#D0C6E5", marginTop: 18, marginBottom: 6 },
  input: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 15,
  },
  error: {
    color: "#FCA5A5",
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginTop: 12,
    overflow: "hidden",
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#7C4DFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14, textAlign: "center" },
  btnGhost: { backgroundColor: "rgba(255,255,255,0.08)" },
  btnGhostText: { color: "#D0C6E5", fontWeight: "600", fontSize: 14 },
  check: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(34,197,94,0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  checkText: { color: "#86EFAC", fontSize: 28, fontWeight: "bold" },
  summary: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: { fontSize: 12, color: "#AFA3C8" },
  summaryValue: {
    fontSize: 13,
    color: "#FFFFFF",
    flexShrink: 1,
    textAlign: "right",
  },
});
