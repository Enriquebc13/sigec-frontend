import { GradientScreen } from "@/components/ui/GradientScreen";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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
import { CreatePropertyInput } from "../../domain/entities/create-property-input";
import { ImageFile } from "../../domain/entities/image-file";
import { useCreateProperty } from "./hooks/use-create-property";

const typeOptions = [
  { label: "Local", value: "LOCAL" },
  { label: "Oficina", value: "OFFICE" },
  { label: "Bodega", value: "WAREHOUSE" },
] as const;

export default function CreatePropertyView() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [floor, setFloor] = useState("");
  const [type, setType] = useState<CreatePropertyInput["type"]>("LOCAL");
  const [amenities, setAmenities] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);

  const { create, saving } = useCreateProperty();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setMaintenanceCost("");
    setDimensions("");
    setFloor("");
    setType("LOCAL");
    setAmenities("");
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setImages([]);
  };

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

  const handleCreate = async () => {
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

    const propertyData: Omit<CreatePropertyInput, "userId"> = {
      title: title.trim(),
      description: description.trim() || undefined,
      price: numericPrice,
      maintenanceCost: numericMaintenance ?? undefined,
      dimensions: dimensions.trim() || undefined,
      floor: numericFloor ?? undefined,
      type,
      amenities: amenities.trim() || undefined,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
      },
    };

    try {
      const { failedImages } = await create(propertyData, images);
      Alert.alert(
        "Propiedad registrada",
        failedImages > 0
          ? `La propiedad se guardó, pero ${failedImages} foto(s) no se pudieron subir.`
          : "La propiedad se guardó correctamente."
      );
      resetForm();
      router.navigate("/properties");
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "No se pudo registrar la propiedad."
      );
    }
  };

  return (
    <GradientScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Registra un nuevo espacio comercial en SIGEC.
        </Text>

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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreate}
          activeOpacity={0.8}
          disabled={saving}
        >
          <Text style={styles.submitText}>
            {saving ? "Guardando..." : "Registrar propiedad"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          * Campos obligatorios
        </Text>
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 1,
    marginBottom: 24,
  },
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
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
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

