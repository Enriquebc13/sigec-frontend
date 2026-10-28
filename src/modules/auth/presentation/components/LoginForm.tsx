import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthProvider";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      Alert.alert("Campos requeridos", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedUser = await login(trimmedEmail, password);
      Alert.alert("¡Bienvenido!", "Has iniciado sesión correctamente.");

      if (loggedUser.role === "ADMIN") {
        router.replace("/(admin)/home");
      } else {
        router.replace("/(client)/home");
      }
    } catch (error: any) {
      console.log("Error en login:", error);
      const msg =
        error?.message || "El correo o la contraseña son incorrectos";
      Alert.alert("Error de autenticación", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>Correo electrónico</Text>

      <TextInput
        placeholder="ejemplo@correo.com"
        placeholderTextColor="#8B88A0"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        style={styles.containerInput}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        placeholder="Ingresa tu contraseña"
        placeholderTextColor="#8B88A0"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.containerInput}
        editable={!isSubmitting}
      />

      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.textButton}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    marginTop: 10,
    width: 355,
    padding: 8,
    gap: 20,
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
    color: "#ffff",
  },
  button: {
    width: 340,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  textButton: {
    color: "#ffff",
    fontSize: 17,
    fontWeight: "bold",
  },
});
