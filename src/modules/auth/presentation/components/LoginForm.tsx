import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthProvider";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            await login(email, password);
            Alert.alert(
                '¡Bienvenido!',
                'Has iniciado sesión correctamente.',
            );
            router.replace('/home')

        } catch (error) {
            console.log("Error en login:", error);
            Alert.alert("Error", "El correo o la contraseña son incorrectos");
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

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.textButton}>Enviar</Text>
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