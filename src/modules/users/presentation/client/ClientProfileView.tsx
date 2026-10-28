import { Avatar } from "@/components/ui/avatar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../auth/presentation/context/AuthProvider";

export default function ClientProfileView() {
    const { user, signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/login');
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión. Inténtalo de nuevo.');
                        }
                    },
                },
            ]
        );
    };
    return (
        <LinearGradient
            colors={['#5E35B1', '#1A0B2E', '#000000']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradientContainer}
        >
            {/* <Text style={styles.title}>Bienvenido</Text> */}
            <Avatar url="https://ichef.bbci.co.uk/ace/ws/683/cpsprodpb/84ec/live/07de5f40-8057-11f1-bee8-53ce494e1abc.jpg.webp" margin={50} />
            <Text style={styles.infoUser}>{user?.email}</Text>
            <View style={styles.containerInfo}>
                <Text style={styles.infoUser}>
                    Última conexión: {user?.metadata?.lastSignInTime ?? 'No disponible'}
                </Text>
                <Text style={styles.infoUser}>
                    Fecha de creación de la cuenta: {user?.metadata?.creationTime ?? 'No disponible'}
                </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                <Text style={styles.textButton}>Cerrar Sesion</Text>
            </TouchableOpacity>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
        alignItems: "center",
        padding: 20
    },
    title: {
        fontSize: 30,
        color: "#ffff"
    },
    button: {
        marginTop: 120,
        width: 220,
        height: 45,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.09)",
        alignItems: "center",
        justifyContent: "center"
    },
    textButton: {
        color: "#ffff",
        fontSize: 17
    },
    infoUser: {
        margin: 20,
        color: "#ffff",
        fontSize: 18,
    },
    containerInfo: {
        width: 330,
        // borderColor:"white",
        // borderWidth:2,
        borderRadius: 20,
        backgroundColor: "rgba(156, 91, 91, 0.08)",
    },
})
