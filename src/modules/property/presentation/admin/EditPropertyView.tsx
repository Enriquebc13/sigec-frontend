import { GradientScreen } from "@/components/ui/GradientScreen";
import { router, useLocalSearchParams } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
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
    const { property, loading, error, saving, update } = useEditProperty(id);

    const handleSubmit = async (data: PropertyFormData) => {
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
            Alert.alert(
                "Propiedad actualizada",
                "Los cambios se guardaron correctamente."
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
                    key={property.id}
                    initialProperty={property}
                    submitLabel="Guardar cambios"
                    saving={saving}
                    showStatus
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