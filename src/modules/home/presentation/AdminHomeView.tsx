import { PressableScale } from "@/components/animation/PressableScale";
import { Reveal } from "@/components/animation/Reveal";
import { GradientScreen } from "@/components/ui/GradientScreen";
import type { Slice } from "@/components/ui/StatsPieCard";
import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider";
import { useProperties } from "@/modules/property/presentation/admin/hooks/use-properties";
import { useUserById } from "@/modules/users/presentation/admin/hooks/use-user-by-id";
import { useUsers } from "@/modules/users/presentation/admin/hooks/use-users";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PROPERTY_STATUSES = [
  {
    key: "AVAILABLE",
    label: "Disponibles",
    color: "#22C55E",
    icon: "check-circle" as const,
  },
  {
    key: "RESERVED",
    label: "Reservados",
    color: "#FBBF24",
    icon: "clock-circle" as const,
  },
  {
    key: "RENTED",
    label: "Rentados",
    color: "#60A5FA",
    icon: "key" as const,
  },
  {
    key: "UNAVAILABLE",
    label: "No disponibles",
    color: "#F87171",
    icon: "close-circle" as const,
  },
];

// Tarjetas claras de gestión (2 por fila)
const MENU_CARDS = [
  {
    title: "Usuarios",
    description: "Cuentas registradas",
    icon: "team" as const,
    color: "#7C4DDB",
    route: "/(admin)/users" as const,
  },
  {
    title: "Propiedades",
    description: "Administrar espacios",
    icon: "home" as const,
    color: "#3B82F6",
    route: "/(admin)/properties" as const,
  },
  {
    title: "Solicitudes",
    description: "Revisar pendientes",
    icon: "ordered-list" as const,
    color: "#D97706",
    route: "/(admin)/requests" as const,
  },
  {
    title: "Mi perfil",
    description: "Datos de tu cuenta",
    icon: "user" as const,
    color: "#DB2777",
    route: "/(admin)/profile" as const,
  },
];

// Medidas de la gráfica
const CHART_HEIGHT = 150;
const TOOLTIP_SPACE = 56; // espacio libre arriba para la burbuja
const GRID_LINES = 4;

type BarStatsCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  slices: Slice[];
  loading: boolean;
  error?: unknown;
};

function BarStatsCard({
  title,
  subtitle,
  icon,
  slices,
  loading,
  error,
}: BarStatsCardProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const highest = Math.max(0, ...slices.map((slice) => slice.value));

  // Escala con números enteros: 4 divisiones iguales
  const step = Math.max(1, Math.ceil(highest / GRID_LINES));
  const axisMax = step * GRID_LINES;
  const ticks = Array.from(
    { length: GRID_LINES + 1 },
    (_, i) => axisMax - step * i,
  );

  // Si no se ha tocado ninguna barra, se resalta la más alta
  const active =
    selected ?? slices.findIndex((slice) => slice.value === highest);

  const message = loading
    ? "Cargando datos..."
    : total > 0
      ? null
      : error
        ? "No se pudieron cargar los datos"
        : "Aún no hay datos para mostrar";

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View style={styles.chartHeaderText}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.chartIcon}>{icon}</View>
      </View>

      {message ? (
        <Text style={styles.chartMessage}>{message}</Text>
      ) : (
        <>
          <View style={styles.chartBody}>
            {/* Números del eje vertical */}
            <View style={styles.axis}>
              {ticks.map((tick, i) => (
                <Text
                  key={tick}
                  style={[
                    styles.axisLabel,
                    {
                      top: TOOLTIP_SPACE + (CHART_HEIGHT / GRID_LINES) * i - 7,
                    },
                  ]}
                >
                  {tick}
                </Text>
              ))}
            </View>

            <View style={styles.plot}>
              {/* Líneas guía */}
              {ticks.map((tick, i) => (
                <View
                  key={tick}
                  style={[
                    styles.gridLine,
                    { top: TOOLTIP_SPACE + (CHART_HEIGHT / GRID_LINES) * i },
                  ]}
                />
              ))}

              {/* Barras */}
              <View style={styles.barsRow}>
                {slices.map((slice, i) => {
                  const isActive = i === active;
                  const height =
                    slice.value > 0
                      ? Math.max((slice.value / axisMax) * CHART_HEIGHT, 8)
                      : 3;
                  const percent = Math.round((slice.value / total) * 100);

                  return (
                    <Pressable
                      key={slice.label}
                      style={styles.barColumn}
                      onPress={() => setSelected(i)}
                      accessibilityRole="button"
                      accessibilityLabel={`${slice.label}: ${slice.value}`}
                    >
                      {isActive && (
                        <View style={[styles.tooltip, { bottom: height + 8 }]}>
                          <Text style={styles.tooltipValue}>{slice.value}</Text>
                          <Text style={styles.tooltipDetail}>{percent}%</Text>
                        </View>
                      )}

                      <LinearGradient
                        colors={[slice.color, "rgba(255, 255, 255, 0.06)"]}
                        style={[
                          styles.bar,
                          { height },
                          isActive && styles.barActive,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Nombres debajo de cada barra */}
          <View style={styles.labelsRow}>
            {slices.map((slice, i) => (
              <View key={slice.label} style={styles.labelColumn}>
                <Text
                  style={[
                    styles.barLabel,
                    i === active && styles.barLabelActive,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  {slice.label}
                </Text>
                <View
                  style={[
                    styles.dot,
                    i === active && { backgroundColor: "#FFFFFF" },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Total, como la barra de saldo del ejemplo */}
          <View style={styles.totalBar}>
            <Text style={styles.totalBarLabel}>Total registrados</Text>
            <View style={styles.totalBarDivider} />
            <Text style={styles.totalBarValue}>{total}</Text>
          </View>
        </>
      )}
    </View>
  );
}

export default function AdminHomeView() {
  const { session } = useApiAuth();
  const { user } = useUserById(session?.userId);
  const {
    users,
    loading: loadingUsers,
    error: usersError,
    refresh: refreshUsers,
  } = useUsers();
  const {
    properties,
    loading: loadingProperties,
    error: propertiesError,
    reload: reloadProperties,
  } = useProperties();

  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh: recarga las dos fuentes de datos a la vez
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshUsers(), reloadProperties()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshUsers, reloadProperties]);

  // Usuarios por rol
  const userSlices: Slice[] = useMemo(
    () => [
      {
        label: "Administradores",
        value: users.filter((u) => u.role === "ADMIN").length,
        color: "#8B5CF6",
        icon: "idcard" as const,
      },
      {
        label: "Clientes",
        value: users.filter((u) => u.role === "CLIENT").length,
        color: "#60A5FA",
        icon: "user" as const,
      },
    ],
    [users],
  );

  // Propiedades por estado
  const propertySlices: Slice[] = useMemo(
    () =>
      PROPERTY_STATUSES.map((s) => ({
        label: s.label,
        value: properties.filter((p) => String(p.status) === s.key).length,
        color: s.color,
        icon: s.icon,
      })),
    [properties],
  );

  // Mientras no haya datos se muestra un guion en lugar de un 0 engañoso
  const noUsers = (loadingUsers || !!usersError) && users.length === 0;
  const noProperties =
    (loadingProperties || !!propertiesError) && properties.length === 0;

  const totalUsers = noUsers ? "–" : users.length;
  const totalClients = noUsers ? "–" : userSlices[1].value;
  const totalProperties = noProperties ? "–" : properties.length;
  const availableProperties = noProperties ? "–" : propertySlices[0].value;

  const displayName = user?.fullName || "Administrador";
  const firstName = user?.name || displayName;

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FFFFFF" // iOS
          colors={["#5E35B1"]} // Android
        />
      }
    >
      {/* ENCABEZADO: saludo a la izquierda y tarjeta de espacios a la derecha */}
      <Reveal index={0}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <PressableScale
              onPress={() => router.navigate("/(admin)/profile")}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </PressableScale>

            <Text style={styles.welcome} numberOfLines={1}>
              Hola, <Text style={styles.welcomeName}>{firstName}</Text>
            </Text>
            <Text style={styles.title}>Revisa tu resumen</Text>
          </View>

          <View style={styles.totalSlot}>
            <PressableScale
              onPress={() => router.navigate("/(admin)/properties")}
            >
              <LinearGradient
                colors={["#8E6AD0", "#5E35B1", "#2E1A5C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.totalCard}
              >
                <View style={styles.totalWave} />

                <View style={styles.totalTop}>
                  <Text style={styles.totalCaption}>SIGEC</Text>
                  <AntDesign name="shop" size={22} color="#FFFFFF" />
                </View>

                <View>
                  <Text style={styles.totalValue}>{totalProperties}</Text>
                  <Text style={styles.totalLabel}>Espacios totales</Text>
                  <Text style={styles.totalDetail}>
                    {availableProperties} disponibles
                  </Text>
                </View>
              </LinearGradient>
            </PressableScale>
          </View>
        </View>
      </Reveal>

      {/* FILA RÁPIDA: botón de solicitudes y totales de usuarios */}
      <Reveal index={1}>
        <View style={styles.quickRow}>
          <PressableScale
            style={styles.requestButton}
            onPress={() => router.navigate("/(admin)/requests")}
          >
            <View style={styles.requestIcon}>
              <AntDesign name="arrow-right" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.requestText}>Solicitudes</Text>
          </PressableScale>

          <View style={styles.totalsPill}>
            <View style={styles.pillColumn}>
              <Text style={styles.pillLabel}>Usuarios</Text>
              <Text style={styles.pillValue}>{totalUsers}</Text>
            </View>
            <View style={styles.pillDivider} />
            <View style={styles.pillColumn}>
              <Text style={styles.pillLabel}>Clientes</Text>
              <Text style={styles.pillValue}>{totalClients}</Text>
            </View>
          </View>
        </View>
      </Reveal>

      {/* GESTIÓN: cuadrícula de tarjetas claras */}
      <Reveal index={2}>
        <Text style={styles.sectionTitle}>Gestión del sistema</Text>

        <View style={styles.grid}>
          {MENU_CARDS.map((card) => (
            <View key={card.title} style={styles.gridSlot}>
              <PressableScale onPress={() => router.navigate(card.route)}>
                <LinearGradient
                  colors={["#F4F0FC", "#CFC4E8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.menuCard}
                >
                  <View
                    style={[styles.menuIcon, { backgroundColor: card.color }]}
                  >
                    <AntDesign name={card.icon} size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.menuTitle} numberOfLines={1}>
                    {card.title}
                  </Text>
                  <Text style={styles.menuDescription} numberOfLines={1}>
                    {card.description}
                  </Text>
                </LinearGradient>
              </PressableScale>
            </View>
          ))}
        </View>
      </Reveal>

      {/* USUARIOS: panel claro con lista */}
      <Reveal index={3}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Usuarios</Text>
            <PressableScale onPress={() => router.navigate("/(admin)/users")}>
              <Text style={styles.panelLink}>Ver todos  ›</Text>
            </PressableScale>
          </View>

          {users.length === 0 ? (
            <Text style={styles.panelMessage}>
              {loadingUsers
                ? "Cargando usuarios..."
                : usersError
                  ? "No se pudieron cargar los usuarios"
                  : "Aún no hay usuarios registrados"}
            </Text>
          ) : (
            users.slice(0, 4).map((item) => (
              <View key={item.id} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(item.fullName || "U").charAt(0).toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.userName} numberOfLines={1}>
                  {item.fullName || "Usuario"}
                </Text>

                <View
                  style={[
                    styles.roleBadge,
                    item.role === "ADMIN" && styles.roleBadgeAdmin,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      item.role === "ADMIN" && styles.roleTextAdmin,
                    ]}
                  >
                    {item.role === "ADMIN" ? "Admin" : "Cliente"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </Reveal>

      {/* ESTADÍSTICAS */}
      <Reveal index={4}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <BarStatsCard
          title="Usuarios"
          subtitle="Distribución por rol"
          icon={<AntDesign name="team" size={20} color="#D7C9FF" />}
          slices={userSlices}
          loading={loadingUsers && users.length === 0}
          error={usersError}
        />
      </Reveal>

      <Reveal index={5}>
        <BarStatsCard
          title="Espacios"
          subtitle="Distribución por estado"
          icon={<AntDesign name="home" size={20} color="#D7C9FF" />}
          slices={propertySlices}
          loading={loadingProperties && properties.length === 0}
          error={propertiesError}
        />
      </Reveal>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  // Encabezado
  header: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    marginBottom: 20,
  },
  headerInfo: { flex: 1, alignItems: "flex-start" },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  avatarText: { color: "#FFFFFF", fontSize: 27, fontWeight: "bold" },
  welcome: { color: "#D6D0E3", fontSize: 15, marginBottom: 4 },
  welcomeName: { color: "#FFFFFF", fontWeight: "bold" },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 30,
  },

  // Tarjeta de espacios
  totalSlot: { width: 148 },
  totalCard: {
    minHeight: 190,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  totalWave: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: 62,
    left: -40,
    backgroundColor: "rgba(10, 3, 24, 0.28)",
  },
  totalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalCaption: {
    color: "#E4DCF5",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  totalValue: { color: "#FFFFFF", fontSize: 36, fontWeight: "bold" },
  totalLabel: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  totalDetail: { color: "#D6D0E3", fontSize: 12, marginTop: 5 },

  // Fila rápida
  quickRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    height: 72,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  requestIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }],
  },
  requestText: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  totalsPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
  },
  pillColumn: { flex: 1, alignItems: "center" },
  pillDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  pillLabel: { color: "#C8C2D2", fontSize: 11, marginBottom: 4 },
  pillValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },

  // Cuadrícula de gestión
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 24,
  },
  gridSlot: { width: "48%" },
  menuCard: { padding: 15, borderRadius: 22 },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  menuTitle: { color: "#1A0B2E", fontSize: 16, fontWeight: "bold" },
  menuDescription: { color: "#625775", fontSize: 11, marginTop: 5 },

  // Panel claro de usuarios
  panel: {
    backgroundColor: "#E9E4F5",
    borderRadius: 28,
    padding: 18,
    marginBottom: 28,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  panelTitle: { color: "#1A0B2E", fontSize: 19, fontWeight: "bold" },
  panelLink: { color: "#5E35B1", fontSize: 14, fontWeight: "600" },
  panelMessage: {
    color: "#625775",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 18,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5E35B1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userAvatarText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  userName: {
    flex: 1,
    color: "#1A0B2E",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(94, 53, 177, 0.12)",
  },
  roleBadgeAdmin: { backgroundColor: "#5E35B1" },
  roleText: { color: "#4527A0", fontSize: 12, fontWeight: "bold" },
  roleTextAdmin: { color: "#FFFFFF" },

  // Gráficas de barras
  chartCard: {
    padding: 18,
    marginBottom: 16,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
  },
  chartHeader: { flexDirection: "row", alignItems: "center" },
  chartHeaderText: { flex: 1 },
  chartTitle: { color: "#FFFFFF", fontSize: 19, fontWeight: "bold" },
  chartSubtitle: { color: "#C8C2D2", fontSize: 12, marginTop: 4 },
  chartIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  chartMessage: {
    color: "#C8C2D2",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 40,
  },
  chartBody: {
    flexDirection: "row",
    height: TOOLTIP_SPACE + CHART_HEIGHT,
    marginTop: 6,
  },
  axis: { width: 30 },
  axisLabel: {
    position: "absolute",
    left: 0,
    color: "#9E94B0",
    fontSize: 10,
    lineHeight: 14,
  },
  plot: { flex: 1 },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  barsRow: { flex: 1, flexDirection: "row" },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    opacity: 0.55,
  },
  barActive: {
    opacity: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  tooltip: {
    position: "absolute",
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
  },
  tooltipValue: { color: "#FFFFFF", fontSize: 14, fontWeight: "bold" },
  tooltipDetail: { color: "#D6D0E3", fontSize: 10 },
  labelsRow: { flexDirection: "row", marginLeft: 30, marginTop: 10 },
  labelColumn: { flex: 1, alignItems: "center", paddingHorizontal: 2 },
  barLabel: { color: "#9E94B0", fontSize: 11, textAlign: "center" },
  barLabelActive: { color: "#FFFFFF", fontWeight: "bold" },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: "transparent",
  },
  totalBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  totalBarLabel: { flex: 1, color: "#C8C2D2", fontSize: 13 },
  totalBarDivider: {
    width: 1,
    height: 26,
    marginRight: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  totalBarValue: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});