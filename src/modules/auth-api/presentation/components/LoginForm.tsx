import { ApiError } from "@/core/http/api-client";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useApiAuth } from "../context/ApiAuthProvider";
import { getHomeRoute } from "../utils/get-home-route";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

            <View style={styles.inputContainer}>
                <AntDesign name="mail" size={20} color="#8B88A0" />

                <TextInput
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#8B88A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                />
            </View>
            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
                <AntDesign name="lock" size={20} color="#8B88A0" />

                <TextInput
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor="#8B88A0"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                />

                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <AntDesign
                        name={showPassword ? "eye-invisible" : "eye"}
                        size={20}
                        color="#8B88A0"
                    />
                </TouchableOpacity>
            </View>

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
    },
    inputContainer: {
        width: 340,
        height: 55,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        paddingHorizontal: 15,
        borderRadius: 20,
        gap: 10,
    },

    input: {
        flex: 1,
        height: "100%",
        color: "#FFFFFF",
    },
})