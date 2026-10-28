import { GradientScreen } from "@/components/ui/GradientScreen";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMyRequests } from "./hooks/use-my-requests";
import RequestCard from "../components/RequestCard";

export default function MyRequestsView() {
  const { requests, loading, refreshing, error, refresh } = useMyRequests();

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor="#8B5CF6"
          colors={["#8B5CF6"]}
        />
      }
    >
      <View style={styles.container}>
        <Text style={styles.title}>Mis solicitudes</Text>
        <Text style={styles.subtitle}>
          Consulta el estado y seguimiento de tus solicitudes
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>
            {loading ? "..." : requests.length}
          </Text>
          <Text style={styles.summaryText}>Tus solicitudes registradas</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historial de tus solicitudes</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refresh}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshText}>Actualizar ↻</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Cargando tus solicitudes...</Text>
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

        {!loading && !error && requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin solicitudes activas</Text>
            <Text style={styles.emptySubtitle}>
              Aún no has solicitado ningún espacio comercial. Explora las
              propiedades disponibles y solicita la que más te guste.
            </Text>
          </View>
        )}

        {!loading &&
          !error &&
          requests.map((request) => (
            <RequestCard key={request.id} request={request} showClient={false} />
          ))}
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.25)",
  },
  refreshText: {
    color: "#C7B5FF",
    fontSize: 13,
    fontWeight: "600",
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#D0C6E5",
    fontSize: 14,
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#AFA3C8",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
