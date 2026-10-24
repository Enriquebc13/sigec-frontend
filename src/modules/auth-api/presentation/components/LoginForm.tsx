import { ApiError } from "@/core/http/api-client";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApiAuth } from "../context/ApiAuthProvider";
import { getHomeRoute } from "../utils/get-home-route";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login } = useApiAuth();

    const handleLogin = async () => {
        setSubmitting(true);
        try {
            const session = await login(email, password);
            // Cada rol va a su propio home
            router.replace(getHomeRoute(session.role));
        } catch (error) {
            console.log("Error en login:", error);
            const message =
                error instanceof ApiError && error.status === 401
                    ? "El correo o la contraseña son incorrectos"
                    : error instanceof Error
                        ? error.message
                        : "No se pudo iniciar sesión";
            Alert.alert("Error", message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Correo electrónico</Text>

            <TextInput placeholder="ejemplo@correo.com"
                placeholderTextColor="#8B88A0"
                keyboardType="email-address" // Muestra el teclado optimizado con la '@'
                autoCapitalize="none"        // Evita que la primera letra sea mayúscula
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                style={styles.containerInput} >
            </TextInput>

            <Text style={styles.label}>Contraseña</Text>
            <TextInput placeholder="Ingresa tu contraseña"
                placeholderTextColor="#8B88A0"
                autoCapitalize="none"        // Evita que la primera letra sea mayúscula
                autoCorrect={false}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.containerInput} >
            </TextInput>

            <TouchableOpacity
                style={[styles.button, submitting && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={submitting}
            >
                <Text style={styles.textButton}>
                    {submitting ? "Entrando..." : "Enviar"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerText}>¿No tienes una cuenta? Regístrate</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    formContainer: {
        marginTop: 10,
        width: 355,
        padding: 8,
        // borderWidth:2,
        // borderColor:"yellow",
        gap: 20

    },
    label: {
        fontSize: 18,
        color: "white",
    },
    containerInput: {
        width: 340,
        height: 55,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingLeft: 15,
        borderRadius: 20,
        color: "#ffff"
    },
    button: {
        width: 340,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8B5CF6",
        borderRadius: 20,
    },
    textButton: {
        color: "#ffff",
        fontSize: 17,
        fontWeight: "bold"
    },
    registerText: {
        fontSize: 15,
        textAlign: "center",
        color: "#6B7280"
    }
})