import { GradientScreen } from "@/components/ui/GradientScreen";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ImageFile } from "../../domain/entities/image-file";
import { PropertyForm, PropertyFormData } from "../components/PropertyForm";
import { useEditProperty } from "./hooks/use-edit-property";

export default function EditPropertyView() {
    const { id } = useLocalSearchParams<{ id?: string | string[] }>();
    const propertyId = Array.isArray(id) ? id[0] : id;

    if (!propertyId) {
        return (
            <GradientScreen>
                <View style={styles.center}>
                    <Text style={styles.errorText}>No se indicó qué propiedad editar.</Text>
                </View>
            </GradientScreen>
        );
    }

    return <EditPropertyContent id={propertyId} />;
}

function EditPropertyContent({ id }: { id: string }) {
    const { property, loading, error, saving, update, syncImages, reload } = useEditProperty(id);

    // Sirve para reiniciar el formulario cada vez que se vuelve a esta pantalla
    const [formKey, setFormKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            reload().then(() => {
                if (active) setFormKey((k) => k + 1);
            });
            return () => {
                active = false;
            };
        }, [reload])
    );

    const handleSubmit = async (
        data: PropertyFormData,
        images: ImageFile[],
        removedImageIds: string[]
    ) => {
        try {
            await update({
                title: data.title,
                description: data.description,
                price: data.price,
                maintenanceCost: data.maintenanceCost,
                dimensions: data.dimensions,
                floor: data.floor,
                type: data.type,
                status: data.status,
                amenities: data.amenities,
                address: data.address,
            });

            const failed = await syncImages(images, removedImageIds);

            Alert.alert(
                "Propiedad actualizada",
                failed > 0
                    ? `Los datos se guardaron, pero ${failed} cambio(s) de fotos no se pudieron aplicar. Puedes intentarlo de nuevo editando la propiedad.`
                    : "Los cambios se guardaron correctamente."
            );
            router.navigate("/properties");
        } catch (e) {
            Alert.alert(
                "Error",
                e instanceof Error ? e.message : "No se pudo actualizar la propiedad."
            );
        }
    };
    if (loading) {
        return (
            <GradientScreen>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#C7B5FF" />
                </View>
            </GradientScreen>
        );
    }

    if (error || !property) {
        return (
            <GradientScreen>
                <View style={styles.center}>
                    <Text style={styles.errorText}>
                        {error ?? "No se encontró la propiedad."}
                    </Text>
                </View>
            </GradientScreen>
        );
    }

    return (
        <GradientScreen>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>
                    Modifica los datos de la propiedad.
                </Text>

                <PropertyForm
                    key={`${property.id}-${formKey}`}
                    initialProperty={property}
                    submitLabel="Guardar cambios"
                    saving={saving}
                    showStatus
                    showPhotos
                    onSubmit={handleSubmit}
                />
            </ScrollView>
        </GradientScreen>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    errorText: {
        color: "#FCA5A5",
        fontSize: 14,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#D0C6E5",
        marginTop: 1,
        marginBottom: 24,
    },
});