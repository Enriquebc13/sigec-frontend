import { PressableScale } from "@/components/animation/PressableScale";
import { Reveal } from "@/components/animation/Reveal";
import { useClientDrawerCounts } from "@/components/navigation/drawer-counts";
import { GradientScreen } from "@/components/ui/GradientScreen";
import { OptionCard } from "@/components/ui/OptionCard";
import { useApiAuth } from "@/modules/auth-api/presentation/context/ApiAuthProvider";
import { useUserById } from "@/modules/users/presentation/admin/hooks/use-user-by-id";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

type IconName = ComponentProps<typeof AntDesign>["name"];

// Resumen: tarjetas deslizables (como las tarjetas bancarias del ejemplo)
const summaryCards = [
  {
    key: "properties",
    label: "Propiedades",
    hint: "Explorar espacios",
    icon: "shop" as IconName,
    colors: ["#9575CD", "#5E35B1", "#311B6B"] as const,
    route: "/(client)/properties" as const,
  },
  {
    key: "requests",
    label: "Mis solicitudes",
    hint: "Ver su estado",
    icon: "file-text" as IconName,
    colors: ["#B39DDB", "#7458A8", "#2E1A4F"] as const,
    route: "/(client)/requests" as const,
  },
  {
    key: "waitlist",
    label: "Lista de espera",
    hint: "Ver mis lugares",
    icon: "clock-circle" as IconName,
    colors: ["#7E57C2", "#4527A0", "#1A0B2E"] as const,
    route: "/(client)/waitlist" as const,
  },
];

const quickActions = [
  { label: "Espacios", icon: "shop" as IconName, route: "/(client)/properties" as const },
  { label: "Solicitudes", icon: "file-text" as IconName, route: "/(client)/requests" as const },
  { label: "En espera", icon: "clock-circle" as IconName, route: "/(client)/waitlist" as const },
  { label: "Perfil", icon: "user" as IconName, route: "/(client)/profile" as const },
];

export default function ClientHomeView() {
  const { session } = useApiAuth();
  const { user } = useUserById(session?.userId);
  const { counts, refresh } = useClientDrawerCounts();
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.fullName || "Usuario";
  const firstName = user?.name || displayName;

  // Se guarda en un ref para no repetir la petición en cada render
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });

  // Actualiza los números cada vez que se vuelve al inicio
  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.resolve(refreshRef.current());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <GradientScreen
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#FFFFFF"
        />
      }
    >
 {/* ENCABEZADO: avatar, saludo y acceso al perfil */}
<Reveal index={0}>
  <View style={styles.header}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>
        {firstName.charAt(0).toUpperCase()}
      </Text>
    </View>

    <PressableScale
      style={styles.greetingButton}
      onPress={() => router.navigate("/(client)/profile")}
    >
      <Text style={styles.greeting} numberOfLines={1}>
        Hola, <Text style={styles.greetingName}>{firstName}</Text>
      </Text>

      {/* <Text style={styles.profileHint}>Ver mi perfil</Text> */}
    </PressableScale>

    <PressableScale
      style={styles.roundButton}
      onPress={() => router.navigate("/(client)/profile")}
    >
      <AntDesign name="user" size={20} color="#FFFFFF" />
    </PressableScale>
  </View>
</Reveal>

      {/* TÍTULO GRANDE */}
      <Reveal index={1}>
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Tu próximo espacio</Text>
          <Text style={styles.heroTitle}>
            comienza <Text style={styles.heroFaded}>aquí</Text>
          </Text>
        </View>
      </Reveal>

      {/* TARJETAS DESLIZABLES */}
      <Reveal index={2}>
        <Text style={styles.sectionTitle}>Mi resumen</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {summaryCards.map((card) => (
            <PressableScale
              key={card.key}
              onPress={() => router.navigate(card.route)}
            >
              <LinearGradient
                colors={card.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryCard}
              >
                {/* Brillo decorativo */}
                <View style={styles.glow} />

                <AntDesign name={card.icon} size={24} color="#FFFFFF" />

                <View>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardValue}>{counts?.[card.key] ?? "–"}</Text>
                  <Text style={styles.cardHint}>{card.hint}</Text>
                </View>
              </LinearGradient>
            </PressableScale>
          ))}
        </ScrollView>
      </Reveal>

      {/* ACCESOS RÁPIDOS */}
      <Reveal index={3}>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Accesos rápidos</Text>

          <View style={styles.actionsRow}>
            {quickActions.map((action) => (
              <View key={action.label} style={styles.actionSlot}>
                <PressableScale
                  style={styles.action}
                  onPress={() => router.navigate(action.route)}
                >
                  <View style={styles.actionIcon}>
                    <AntDesign name={action.icon} size={22} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionLabel} numberOfLines={1}>
                    {action.label}
                  </Text>
                </PressableScale>
              </View>
            ))}
          </View>
        </View>
      </Reveal>

      {/* NOVEDADES */}
      <Reveal index={4}>
        <Text style={styles.sectionTitle}>Descubre</Text>
        <OptionCard
          title="Conoce SIGEC"
          description="Consulta información y novedades del sistema"
          icon={<AntDesign name="info" size={24} color="#D7C9FF" />}
          route="/(client)/information"
        />
      </Reveal>

      <Reveal index={5}>
        <Text style={styles.footer}>
          Sistema Integral de Gestión de Espacios Comerciales
        </Text>
      </Reveal>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 21, fontWeight: "bold" },
  greeting: { flex: 1, color: "#D6D0E3", fontSize: 25, marginTop:12, },
  greetingName: { color: "#FFFFFF", fontWeight: "bold" },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { marginBottom: 28 },
  heroLabel: { color: "#D6D0E3", fontSize: 16, marginBottom: 2 },
  heroTitle: { color: "#FFFFFF", fontSize: 38, fontWeight: "bold" },
  heroFaded: { color: "rgba(255, 255, 255, 0.5)" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  // Margen negativo: las tarjetas llegan hasta el borde de la pantalla
  carousel: { marginHorizontal: -20, marginBottom: 22 },
  carouselContent: { paddingHorizontal: 20, gap: 12 },
  summaryCard: {
    width: 155,
    height: 175,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -55,
    right: -55,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  cardLabel: { color: "#E4DCF5", fontSize: 12 },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 2,
  },
  cardHint: { color: "#D6D0E3", fontSize: 11 },
  panel: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  actionsRow: { flexDirection: "row" },
  actionSlot: { flex: 1 },
  action: { alignItems: "center" },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#5E35B1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: { color: "#C8C2D2", fontSize: 12 },
  footer: {
    color: "#9E94B0",
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  greetingButton: {
  flex: 1,
  justifyContent: "center",
  // alignItems: "center",
  marginLeft: 12,
},

profileHint: {
  color: "#D7C9FF",
  fontSize: 11,
  marginTop: 6,
  textAlign: "center",

},

});