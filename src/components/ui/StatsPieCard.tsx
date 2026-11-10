import AntDesign from "@expo/vector-icons/AntDesign";
import { ComponentProps, ReactNode, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";

type IconName = ComponentProps<typeof AntDesign>["name"];

export type Slice = {
  label: string;
  value: number;
  color: string;
  icon?: IconName; // icono
};

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode; // icono
  slices: Slice[];
  loading?: boolean;
  error?: string | null;
};

const RADIUS = 85;
const INNER_RADIUS = 55;
// Color del hueco de la dona: igual al de la tarjeta para que no se note
const CARD_COLOR = "#1e143277";

// Aclara un color hexadecimal; se usa para el degradado de cada sector
const lighten = (hex: string, amount = 0.35) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${channels.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

export function StatsPieCard({ title, subtitle, icon, slices, loading, error }: Props) {
  // Sector tocado: el centro de la dona muestra su valor en lugar del total
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  // Los sectores en 0 no se dibujan, pero sí aparecen en la leyenda
  const visible = slices.filter((s) => s.value > 0);
  const selected = visible.find((s) => s.label === selectedLabel) ?? null;

  const chartData = visible.map((s) => ({
    value: s.value,
    color: s.color,
    gradientCenterColor: lighten(s.color),
    onPress: () =>
      setSelectedLabel((prev) => (prev === s.label ? null : s.label)),
  }));

  // Contenido del centro de la dona
  const centerLabel = (
    <View style={styles.center}>
      <Text style={[styles.centerValue, selected && { color: selected.color }]}>
        {selected ? selected.value : total}
      </Text>
      <Text style={styles.centerText} numberOfLines={1}>
        {selected ? selected.label : "Total"}
      </Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon && <View style={styles.headerIcon}>{icon}</View>}
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={styles.state} />
      ) : error ? (
        <Text style={[styles.state, styles.error]}>{error}</Text>
      ) : total === 0 ? (
        <Text style={[styles.state, styles.empty]}>Sin datos todavía</Text>
      ) : (
        <>
          <View style={styles.chartBox}>
            {visible.length === 1 ? (
              // Con un solo sector se dibuja un anillo completo
              <View
                style={[
                  styles.ring,
                  { borderColor: visible[0].color },
                ]}
              >
                {centerLabel}
              </View>
            ) : (
              <PieChart
                data={chartData}
                donut
                showGradient
                radius={RADIUS}
                innerRadius={INNER_RADIUS}
                innerCircleColor={CARD_COLOR}
                isAnimated
                animationDuration={800}
                focusOnPress
                toggleFocusOnPress
                centerLabelComponent={() => centerLabel}
              />
            )}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total}</Text>
            </View>

            {slices.map((s) => (
              <View key={s.label} style={styles.legendRow}>
                <View style={styles.legendIcon}>
                  {s.icon ? (
                    <AntDesign name={s.icon} size={14} color={s.color} />
                  ) : (
                    <View style={[styles.dot, { backgroundColor: s.color }]} />
                  )}
                </View>
                <Text style={styles.legendLabel}>{s.label}</Text>
                <Text style={styles.legendPercent}>
                  {Math.round((s.value / total) * 100)}%
                </Text>
                <Text style={styles.legendValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_COLOR,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(94,53,177,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#C7B5FF",
    fontSize: 12,
    marginTop: 2,
  },
  state: {
    marginVertical: 30,
    textAlign: "center",
  },
  error: {
    color: "#FCA5A5",
    fontSize: 13,
  },
  empty: {
    color: "#C8C2D2",
    fontSize: 13,
  },
  chartBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  ring: {
    width: RADIUS * 2,
    height: RADIUS * 2,
    borderRadius: RADIUS,
    borderWidth: RADIUS - INNER_RADIUS,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    maxWidth: INNER_RADIUS * 2 - 10,
  },
  centerValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },
  centerText: {
    color: "#C7B5FF",
    fontSize: 12,
    marginTop: 2,
  },
  legend: {
    marginTop: 6,
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    color: "#D6D0E3",
    fontSize: 14,
  },
  legendPercent: {
    width: 46,
    textAlign: "right",
    color: "#9E94B0",
    fontSize: 12,
  },
  legendValue: {
    width: 32,
    textAlign: "right",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});