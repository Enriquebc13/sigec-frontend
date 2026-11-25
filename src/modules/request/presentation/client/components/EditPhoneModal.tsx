import { PropertyRequest } from "@/modules/request/domain/entities/request.entity";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useUpdateRequestPhone } from "../hooks/use-update-request-phone";

type Props = {
  request: PropertyRequest;
  propertyTitle: string;
  onClose: () => void;
  /** Se llama en cuanto el teléfono quedó guardado. */
  onSaved: () => void;
};

const normalize = (v: string) => v.replace(/[\s()-]/g, "");

/** Permite corregir el teléfono de una solicitud pendiente o aprobada. El padre lo monta con key={request.id}. */
export function EditPhoneModal({ request, propertyTitle, onClose, onSaved }: Props) {
  const { updatePhone, loading, error } = useUpdateRequestPhone();
  const [telefono, setTelefono] = useState(request.telefono);
  const unchanged = normalize(telefono) === request.telefono;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSave = async () => {
    if (loading || unchanged) return;
    const ok = await updatePhone(request.id, request.status, telefono);
    if (ok) onSaved();
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <Pressable style={styles.card} onPress={() => {}}>
            <Text style={styles.title}>Editar teléfono</Text>
            <Text style={styles.text}>
              Solicitud para <Text style={styles.bold}>{propertyTitle}</Text>.
              Tu lugar en la lista de espera no cambia.
            </Text>

            <Text style={styles.label}>Teléfono de contacto</Text>
            <TextInput
              value={telefono}
              onChangeText={setTelefono}
              placeholder="10 dígitos"
              placeholderTextColor="#8E83A8"
              keyboardType="phone-pad"
              autoComplete="tel"
              autoFocus
              editable={!loading}
              onSubmitEditing={handleSave}
              style={styles.input}
            />
            <Text style={styles.hint}>
              Un administrador te contactará a este número.
            </Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.actions}>
              <Pressable
                style={[styles.btn, styles.ghost]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.ghostText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, (loading || unchanged) && styles.disabled]}
                onPress={handleSave}
                disabled={loading || unchanged}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnText}>Guardar teléfono</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#2A1B4A",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  title: { fontSize: 19, fontWeight: "bold", color: "#FFFFFF", marginBottom: 8 },
  text: { fontSize: 13, color: "#D0C6E5", lineHeight: 19, marginBottom: 14 },
  bold: { fontWeight: "bold", color: "#FFFFFF" },
  label: { fontSize: 12, color: "#C8C2D2", marginBottom: 6 },
  input: {
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  hint: { fontSize: 12, color: "#AFA3C8", marginTop: 8 },
  error: { fontSize: 13, color: "#FCA5A5", marginTop: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#6846A8",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  ghost: { backgroundColor: "rgba(255,255,255,0.10)" },
  ghostText: { color: "#D0C6E5", fontWeight: "bold", fontSize: 14 },
  disabled: { opacity: 0.45 },
});
