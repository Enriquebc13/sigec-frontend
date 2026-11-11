import { GradientScreen } from "@/components/ui/GradientScreen";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { CreatePropertyInput } from "../../domain/entities/create-property-input";
import { ImageFile } from "../../domain/entities/image-file";
import { PropertyForm, PropertyFormData } from "../components/PropertyForm";
import { useCreateProperty } from "./hooks/use-create-property";

export default function CreatePropertyView() {
  const { create, saving } = useCreateProperty();
  // Al cambiar la key, el formulario se vuelve a crear vacío.
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (data: PropertyFormData, images: ImageFile[]) => {
    const propertyData: Omit<CreatePropertyInput, "userId"> = {
      title: data.title,
      description: data.description ?? undefined,
      price: data.price,
      maintenanceCost: data.maintenanceCost ?? undefined,
      dimensions: data.dimensions ?? undefined,
      floor: data.floor ?? undefined,
      type: data.type,
      amenities: data.amenities ?? undefined,
      address: data.address,
    };

    try {
      const { failedImages } = await create(propertyData, images);
      Alert.alert(
        "Propiedad registrada",
        failedImages > 0
          ? `La propiedad se guardó, pero ${failedImages} foto(s) no se pudieron subir.`
          : "La propiedad se guardó correctamente."
      );
      setFormKey((k) => k + 1);
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

        <PropertyForm
          key={formKey}
          submitLabel="Registrar propiedad"
          saving={saving}
          showPhotos
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: "#D0C6E5",
    marginTop: 1,
    marginBottom: 24,
  },
});