import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { ImageFile } from "../../domain/entities/image-file";
import { Property } from "../../domain/entities/property.entity";

type PropertyType = "LOCAL" | "OFFICE" | "WAREHOUSE";
type PropertyStatus = "AVAILABLE" | "RESERVED" | "RENTED" | "UNAVAILABLE";

const typeOptions: { label: string; value: PropertyType }[] = [
  { label: "Local", value: "LOCAL" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Bodega", value: "WAREHOUSE" },
];

const statusOptions: { label: string; value: PropertyStatus }[] = [
  { label: "Disponible", value: "AVAILABLE" },
  { label: "Reservada", value: "RESERVED" },
  { label: "Rentada", value: "RENTED" },
  { label: "No disponible", value: "UNAVAILABLE" },
];

// Datos ya validados que el formulario entrega a la pantalla.
// Los campos opcionales vacíos llegan como null.
export interface PropertyFormData {
  title: string;
  description: string | null;
  price: number;
  maintenanceCost: number | null;
  dimensions: string | null;
  floor: number | null;
  type: PropertyType;
  status: PropertyStatus;
  amenities: string | null;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface PropertyFormProps {
  initialProperty?: Property;
  submitLabel: string;
  saving: boolean;
  showStatus?: boolean;
  showPhotos?: boolean;
  onSubmit: (data: PropertyFormData, images: ImageFile[]) => Promise<void>;
}

export function PropertyForm({
  initialProperty,
  submitLabel,
  saving,
  showStatus = false,
  showPhotos = false,
  onSubmit,
}: PropertyFormProps) {
  const [title, setTitle] = useState(initialProperty?.title ?? "");
  const [description, setDescription] = useState(
    initialProperty?.description ?? ""
  );
  const [price, setPrice] = useState(
    initialProperty ? String(initialProperty.price) : ""
  );
  const [maintenanceCost, setMaintenanceCost] = useState(
    initialProperty?.maintenanceCost != null
      ? String(initialProperty.maintenanceCost)
      : ""
  );
  const [dimensions, setDimensions] = useState(initialProperty?.dimensions ?? "");
  const [floor, setFloor] = useState(
    initialProperty?.floor != null ? String(initialProperty.floor) : ""
  );
  const [type, setType] = useState<PropertyType>(
    (initialProperty?.type as PropertyType) ?? "LOCAL"
  );
  const [status, setStatus] = useState<PropertyStatus>(
    (initialProperty?.status as PropertyStatus) ?? "AVAILABLE"
  );
  const [amenities, setAmenities] = useState(initialProperty?.amenities ?? "");
  const [street, setStreet] = useState(initialProperty?.address?.street ?? "");
  const [city, setCity] = useState(initialProperty?.address?.city ?? "");
  const [state, setState] = useState(initialProperty?.address?.state ?? "");
  const [zipCode, setZipCode] = useState(initialProperty?.address?.zipCode ?? "");
  const [images, setImages] = useState<ImageFile[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.7,
    });
    if (result.canceled) return;

    const picked: ImageFile[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `foto-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    }));
    setImages((prev) => [...prev, ...picked].slice(0, 10));
  };

  const removeImage = (uri: string) => {
    setImages((prev) => prev.filter((image) => image.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim() || !street.trim() ||
      !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert(
        "Campos obligatorios",
        "Completa el título, precio y dirección de la propiedad."
      );
      return;
    }

    const numericPrice = Number(price);
    const numericMaintenance = maintenanceCost.trim()
      ? Number(maintenanceCost)
      : null;
    const numericFloor = floor.trim() ? Number(floor) : null;

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0 ||
      (numericMaintenance !== null &&
        (!Number.isFinite(numericMaintenance) || numericMaintenance < 0)) ||
      (numericFloor !== null &&
        (!Number.isInteger(numericFloor) || numericFloor < 0))
    ) {
      Alert.alert(
        "Datos inválidos",
        "Revisa el precio, mantenimiento y número de piso."
      );
      return;
    }

    await onSubmit(
      {
        title: title.trim(),
        description: description.trim() || null,
        price: numericPrice,
        maintenanceCost: numericMaintenance,
        dimensions: dimensions.trim() || null,
        floor: numericFloor,
        type,
        status,
        amenities: amenities.trim() || null,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        },
      },
      images
    );
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Información general</Text>

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Local Comercial Centro"
        placeholderTextColor="#AFA3C8"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Describe la propiedad"
        placeholderTextColor="#AFA3C8"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Tipo de propiedad *</Text>
      <View style={styles.typeContainer}>
        {typeOptions.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.typeButton,
              type === item.value && styles.typeSelected,
            ]}
            onPress={() => setType(item.value)}
          >
            <Text
              style={[
                styles.typeText,
                type === item.value && styles.typeTextSelected,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showStatus && (
        <>
          <Text style={styles.label}>Estado de la propiedad</Text>
          <View style={styles.statusContainer}>
            {statusOptions.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.typeButton,
                  styles.statusButton,
                  status === item.value && styles.typeSelected,
                ]}
                onPress={() => setStatus(item.value)}
              >
                <Text
                  style={[
                    styles.typeText,
                    status === item.value && styles.typeTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Precio mensual (MXN) *</Text>
          <TextInput
            style={styles.input}
            placeholder="8500"
            placeholderTextColor="#AFA3C8"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Mantenimiento (MXN)</Text>
          <TextInput
            style={styles.input}
            placeholder="800"
            placeholderTextColor="#AFA3C8"
            value={maintenanceCost}
            onChangeText={setMaintenanceCost}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Dimensiones</Text>
          <TextInput
            style={styles.input}
            placeholder="6 x 8 m"
            placeholderTextColor="#AFA3C8"
            value={dimensions}
            onChangeText={setDimensions}
          />
        </View>

        <View style={styles.half}>
          <Text style={styles.label}>Piso</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. 1"
            placeholderTextColor="#AFA3C8"
            value={floor}
            onChangeText={setFloor}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Amenidades</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Estacionamiento, vigilancia"
        placeholderTextColor="#AFA3C8"
        value={amenities}
        onChangeText={setAmenities}
      />

      <Text style={styles.sectionTitle}>Dirección</Text>

      <Text style={styles.label}>Calle y número *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Avenida Reforma 123"
        placeholderTextColor="#AFA3C8"
        value={street}
        onChangeText={setStreet}
      />

      <Text style={styles.label}>Ciudad *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ciudad"
        placeholderTextColor="#AFA3C8"
        value={city}
        onChangeText={setCity}
      />

      <Text style={styles.label}>Estado *</Text>
      <TextInput
        style={styles.input}
        placeholder="Estado"
        placeholderTextColor="#AFA3C8"
        value={state}
        onChangeText={setState}
      />

      <Text style={styles.label}>Código postal *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 72000"
        placeholderTextColor="#AFA3C8"
        value={zipCode}
        onChangeText={setZipCode}
        keyboardType="number-pad"
      />

      {showPhotos && (
        <>
          <Text style={styles.sectionTitle}>Fotos</Text>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={pickImages}
            activeOpacity={0.8}
          >
            <Text style={styles.photoButtonText}>+ Agregar fotos</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.previewRow}
            >
              {images.map((image) => (
                <View key={image.uri} style={styles.previewItem}>
                  <Image source={{ uri: image.uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(image.uri)}
                  >
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        activeOpacity={0.8}
        disabled={saving}
      >
        <Text style={styles.submitText}>
          {saving ? "Guardando..." : submitLabel}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>* Campos obligatorios</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 12,
  },
  label: {
    color: "#E5DDF5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
  },
  multiline: {
    minHeight: 85,
    textAlignVertical: "top",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statusButton: {
    flex: 0,
    flexGrow: 1,
    flexBasis: "45%",
  },
  typeSelected: {
    backgroundColor: "#5E35B1",
    borderColor: "#BCA7FF",
  },
  typeText: {
    color: "#D0C6E5",
    fontSize: 12,
    fontWeight: "600",
  },
  typeTextSelected: {
    color: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  note: {
    color: "#AFA3C8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 25,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  photoButtonText: {
    color: "#D0C6E5",
    fontWeight: "600",
    fontSize: 14,
  },
  previewRow: {
    marginTop: 14,
  },
  previewItem: {
    marginRight: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});