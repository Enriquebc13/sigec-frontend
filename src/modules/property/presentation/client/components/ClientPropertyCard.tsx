import { useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Property } from "../../../domain/entities/property.entity";
import { CatalogAction, CatalogActionVariant } from "../catalog-action";
import { ImageViewerModal } from "./ImageViewerModal";

export const TYPE_LABELS: Record<string, string> = {
  LOCAL: "Local comercial",
  OFFICE: "Oficina",
  WAREHOUSE: "Bodega",
};

export const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservada",
  RENTED: "Rentada",
  UNAVAILABLE: "No disponible",
};

const typeIcon = (type: string) =>
  type === "LOCAL" ? "🏪" : type === "OFFICE" ? "🏢" : "📦";

type Props = {
  property: Property;
  action: CatalogAction;
  onPressAction: () => void;
};

export function ClientPropertyCard({ property, action, onPressAction }: Props) {
  // Cerrada muestra solo lo básico; abierta desglosa toda la información
  const [expanded, setExpanded] = useState(false);
  // El detalle sigue en pantalla mientras dura la animación de cierre
  const [showDetail, setShowDetail] = useState(false);
  const [detailHeight, setDetailHeight] = useState(0);
  // 0 = cerrada, 1 = abierta
  const [progress] = useState(() => new Animated.Value(0));
  // Imagen abierta en pantalla completa (null = visor cerrado)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const toggle = () => {
    const next = !expanded;
    if (next) setShowDetail(true);
    setExpanded(next);

    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false, // la altura no admite el driver nativo
    }).start(({ finished }) => {
      if (finished && !next) setShowDetail(false);
    });
  };

  const cover = property.images[0]?.url;

  const address = [property.address?.street, property.address?.city]
    .filter(Boolean)
    .join(", ");

  const statusStyle =
    property.status === "AVAILABLE"
      ? styles.available
      : property.status === "RESERVED"
        ? styles.reserved
        : property.status === "RENTED"
          ? styles.rented
          : styles.unavailable;

  return (
    <View style={styles.card}>
      {/* RESUMEN: imagen, título, tipo y estado */}
      <View style={styles.summary}>
        {/* Tocar la imagen la abre en pantalla completa */}
        <Pressable
          style={styles.thumbnail}
          onPress={() => setViewerIndex(0)}
          disabled={!cover}
          accessibilityLabel="Ver imágenes en pantalla completa"
        >
          {cover ? (
            <Image
              source={{ uri: cover }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.icon}>{typeIcon(property.type)}</Text>
          )}
          {property.images.length > 1 && (
            <Text style={styles.imageCount}>⤢ {property.images.length}</Text>
          )}
        </Pressable>

        <Pressable style={styles.info} onPress={toggle}>
          <Text style={styles.name} numberOfLines={2}>
            {property.title}
          </Text>
          <Text style={styles.type}>
            {TYPE_LABELS[property.type] ?? property.type}
          </Text>
          <Text style={[styles.status, statusStyle]}>
            {STATUS_LABELS[property.status] ?? property.status}
          </Text>
        </Pressable>
      </View>

      {/* BOTONES: ver más y me interesa, lado a lado */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.moreButton]}
          onPress={toggle}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <Text style={[styles.buttonText, styles.moreText]}>
            {expanded ? "Ver menos" : "Ver más información"}
          </Text>
          {/* La flecha gira al abrir y cerrar */}
          <Animated.Text
            style={[
              styles.moreText,
              {
                transform: [
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "180deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            ▾
          </Animated.Text>
        </Pressable>

        <Pressable
          style={[styles.button, buttonVariantStyle[action.variant]]}
          onPress={onPressAction}
          disabled={!action.interactive}
        >
          <Text style={[styles.buttonText, textVariantStyle[action.variant]]}>
            {action.label}
          </Text>
        </Pressable>
      </View>

      {/* DETALLE: se despliega y se pliega con animación */}
      {showDetail && (
        <Animated.View
          style={[
            styles.collapsible,
            {
              height: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, detailHeight],
              }),
              opacity: progress,
            },
          ]}
        >
          {/* Posición absoluta para poder medir su altura real */}
          <View
            style={styles.detail}
            onLayout={(event) =>
              setDetailHeight(event.nativeEvent.layout.height)
            }
          >
            <View style={styles.divider} />

            {property.images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gallery}
              >
                {property.images.map((image, i) => (
                  <Pressable
                    key={image.id}
                    onPress={() => setViewerIndex(i)}
                    accessibilityLabel={`Ver imagen ${i + 1}`}
                  >
                    <Image
                      source={{ uri: image.url }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {address !== "" && <Text style={styles.address}>📍 {address}</Text>}

            {property.description !== "" && (
              <Text style={styles.description}>{property.description}</Text>
            )}

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Renta mensual</Text>
              <Text style={styles.price}>
                ${property.price.toLocaleString("es-MX")} MXN
              </Text>
            </View>

            {property.maintenanceCost !== null && (
              <View style={styles.row}>
                <Text style={styles.label}>Mantenimiento</Text>
                <Text style={styles.value}>
                  ${property.maintenanceCost.toLocaleString("es-MX")} MXN
                </Text>
              </View>
            )}

            {property.dimensions && (
              <View style={styles.row}>
                <Text style={styles.label}>Dimensiones</Text>
                <Text style={styles.value}>{property.dimensions}</Text>
              </View>
            )}

            {property.floor !== null && (
              <View style={styles.row}>
                <Text style={styles.label}>Piso</Text>
                <Text style={styles.value}>{property.floor}</Text>
              </View>
            )}

            {property.amenities && (
              <>
                <Text style={[styles.label, styles.amenitiesLabel]}>
                  Servicios y amenidades
                </Text>
                <Text style={styles.amenities}>{property.amenities}</Text>
              </>
            )}
          </View>
        </Animated.View>
      )}

      {viewerIndex !== null && (
        <ImageViewerModal
          images={property.images}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  summary: { flexDirection: "row", alignItems: "center" },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(94,53,177,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  image: { width: "100%", height: "100%" },
  imageCount: {
    position: "absolute",
    right: 4,
    bottom: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  collapsible: { overflow: "hidden" },
  detail: { position: "absolute", top: 0, left: 0, right: 0 },
  gallery: { gap: 8 },
  galleryImage: { width: 150, height: 105, borderRadius: 12 },
  icon: { fontSize: 30 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },
  type: { fontSize: 12, color: "#C7B5FF", marginTop: 4 },
  status: {
    alignSelf: "flex-start",
    marginTop: 8,
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
  },
  available: { color: "#86EFAC", backgroundColor: "rgba(34,197,94,0.15)" },
  reserved: { color: "#FCD34D", backgroundColor: "rgba(234,179,8,0.15)" },
  rented: { color: "#C7B5FF", backgroundColor: "rgba(139,92,246,0.20)" },
  unavailable: { color: "#FCA5A5", backgroundColor: "rgba(239,68,68,0.15)" },
  address: { fontSize: 12, color: "#C8C2D2", marginTop: 12 },
  description: {
    fontSize: 13,
    color: "#D0C6E5",
    marginTop: 10,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  label: { fontSize: 12, color: "#AFA3C8" },
  value: { fontSize: 12, color: "#FFFFFF", textAlign: "right", flexShrink: 1 },
  price: { fontSize: 14, fontWeight: "bold", color: "#86EFAC", textAlign: "right" },
  amenitiesLabel: { marginTop: 4 },
  amenities: { fontSize: 12, color: "#FFFFFF", marginTop: 4, lineHeight: 17 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  buttonText: { fontSize: 12, fontWeight: "bold", textAlign: "center" },
  moreButton: {
    flexDirection: "row",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(199,181,255,0.45)",
  },
  moreText: { color: "#E4DAFF", flexShrink: 1 },
});

const buttonVariantStyle: Record<CatalogActionVariant, object> = {
  primary: { backgroundColor: "#7C4DFF" },
  pending: { backgroundColor: "rgba(245,158,11,0.15)" },
  done: { backgroundColor: "rgba(34,197,94,0.15)" },
  retry: { backgroundColor: "rgba(139,92,246,0.25)" },
  disabled: { backgroundColor: "rgba(255,255,255,0.08)" },
};

const textVariantStyle: Record<CatalogActionVariant, object> = {
  primary: { color: "#FFFFFF" },
  pending: { color: "#FCD34D" },
  done: { color: "#86EFAC" },
  retry: { color: "#C7B5FF" },
  disabled: { color: "#AFA3C8" },
};