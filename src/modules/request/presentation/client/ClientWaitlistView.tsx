import { GradientScreen } from "@/components/ui/GradientScreen";
import { useReloadOnFocus } from "@/hooks/use-reload-on-focus";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import { Href, router } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMyRequests } from "./hooks/use-my-requests";

const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

const shortDate = (date: Date) =>
  date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });

/**
 * "Lista de espera" del cliente: su lugar en la fila de cada propiedad donde
 * tiene una solicitud pendiente. Solo ve su propio lugar, nunca a los demás.
 */
export default function ClientWaitlistView() {
  const { requests, loading, refreshing, error, refresh } = useMyRequests();
  const {
    properties,
    loading: propertiesLoading,
    reload: reloadProperties,
  } = useProperties();

  // El estado de la propiedad (reservada, rentada...) cambia fuera de esta pantalla
  useReloadOnFocus(reloadProperties);

  const propertiesById = useMemo(
    () => new Map(properties.map((p) => [p.id, p])),
    [properties],
  );

  // Solo las pendientes están en la fila; el lugar 1 va primero
  const waiting = useMemo(
    () =>
      requests
        .filter((r) => r.status === "PENDING" && r.posicionListaEspera !== null)
        .sort((a, b) => (a.posicionListaEspera ?? 0) - (b.posicionListaEspera ?? 0)),
    [requests],
  );

  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;

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
          Consulta el lugar que ocupas en la fila de cada propiedad que te interesa
        </Text>

        <Text style={styles.intro}>
          Si una persona que está delante de ti no continúa con el proceso,
          avanzarás automáticamente. Si la propiedad se renta antes de que
          llegue tu turno, recibirás una notificación mediante los datos de
          contacto que proporcionaste.{"\n\n"}Por privacidad, solamente puedes
          consultar tu propia posición.
        </Text>

        {approvedCount > 0 && (
          <Pressable
            style={styles.notice}
            onPress={() => router.navigate("/(client)/requests" as Href)}
          >
            <Text style={styles.noticeText}>
              Tienes {approvedCount}{" "}
              {approvedCount === 1 ? "solicitud aprobada" : "solicitudes aprobadas"}.
              Revísalas en «Solicitudes» ›
            </Text>
          </Pressable>
        )}

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#C7B5FF" />
            <Text style={styles.loadingText}>Cargando tu lista de espera...</Text>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && waiting.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏳</Text>
            <Text style={styles.emptyTitle}>
              No estás en ninguna lista de espera por ahora
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.navigate("/(client)/properties" as Href)}
            >
              <Text style={styles.ctaText}>Ver el catálogo</Text>
            </Pressable>
          </View>
        )}

        {!loading &&
          !error &&
          waiting.map((request) => {
            const property = propertiesById.get(request.propertyId);
            const position = request.posicionListaEspera ?? 0;
            const ahead = position - 1;
            const title = property
              ? property.title
              : propertiesLoading
                ? "…"
                : "Propiedad no disponible";

            return (
              <View key={request.id} style={styles.card}>
                <View style={styles.position}>
                  <Text style={styles.positionLabel}>Tu lugar</Text>
                  <Text style={styles.positionNumber}>#{position}</Text>
                </View>

                <View style={styles.info}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.meta}>
                    {position === 1
                      ? "¡Eres el siguiente! Un administrador te contactará."
                      : `${ahead} ${ahead === 1 ? "persona está" : "personas están"} antes que tú.`}
                  </Text>
                  <Text style={styles.muted}>
                    {property
                      ? `${PROPERTY_STATUS_LABELS[property.status] ?? property.status} · `
                      : ""}
                    Enviada el {shortDate(request.createdAt)}
                  </Text>
                  {property?.status === "RESERVED" && (
                    <Text style={styles.muted}>
                      Hay un trato en curso. Si no se concreta, avanzarás en la fila.
                    </Text>
                  )}
                  <Pressable
                    style={styles.link}
                    onPress={() => router.navigate("/(client)/properties" as Href)}
                  >
                    <Text style={styles.linkText}>Ver propiedad ›</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: { fontSize: 14, color: "#D0C6E5", marginTop: 6, marginBottom: 14 },
  intro: { fontSize: 13, color: "#AFA3C8", lineHeight: 19, marginBottom: 18 },
  notice: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: { color: "#86EFAC", fontSize: 13, lineHeight: 18 },
  center: { paddingVertical: 40, alignItems: "center" },
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
  errorText: { color: "#FCA5A5", fontSize: 14, textAlign: "center", marginBottom: 10 },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 13 },
  emptyContainer: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  cta: {
    backgroundColor: "#7C4DFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 14 },
  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  position: {
    width: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(94,53,177,0.45)",
    paddingVertical: 10,
  },
  positionLabel: { fontSize: 11, color: "#D0C6E5" },
  positionNumber: { fontSize: 26, fontWeight: "bold", color: "#FFFFFF" },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  meta: { fontSize: 13, color: "#D0C6E5", marginTop: 6, lineHeight: 18 },
  muted: { fontSize: 12, color: "#AFA3C8", marginTop: 6, lineHeight: 17 },
  link: { marginTop: 10, alignSelf: "flex-start" },
  linkText: { color: "#C7B5FF", fontWeight: "600", fontSize: 13 },
});
