import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  loading: boolean;
  /** Error de la API para mostrarlo dentro del diálogo (como en la web). */
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Diálogo de confirmación para acciones destructivas (cancelar / eliminar). */
export function ConfirmRequestModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  loading,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const handleCancel = () => {
    if (!loading) onCancel();
  };
  return (
    <Modal transparent animationType="fade" visible onRequestClose={handleCancel}>
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, styles.ghost]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.ghostText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.danger, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  message: { fontSize: 14, color: "#D0C6E5", lineHeight: 20 },
  error: { fontSize: 13, color: "#FCA5A5", marginTop: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  btn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  danger: { backgroundColor: "#DC2626" },
  btnText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14, textAlign: "center" },
  ghost: { backgroundColor: "rgba(255,255,255,0.10)" },
  ghostText: { color: "#D0C6E5", fontWeight: "bold", fontSize: 14 },
  disabled: { opacity: 0.6 },
});
