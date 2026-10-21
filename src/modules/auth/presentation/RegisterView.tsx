import { GradientScreen } from "@/components/ui/GradientScreen";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterView() {
  const [role, setRole] = useState<"CLIENT" | "ADMIN">("CLIENT");

  return (
    <GradientScreen>
      <View style={styles.container}>
        <Text style={styles.title}>¡Bienvenido!</Text>
        <Text style={styles.subtitle}>
          Regístrate para comenzar
        </Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu apellido"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor="#aaa"
          secureTextEntry
        />

        <Text style={styles.label}>Tipo de usuario</Text>
        <View style={styles.roles}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "CLIENT" && styles.roleSelected,
            ]}
            onPress={() => setRole("CLIENT")}
          >
            <Text style={styles.roleText}>Cliente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "ADMIN" && styles.roleSelected,
            ]}
            onPress={() => setRole("ADMIN")}
          >
            <Text style={styles.roleText}>Administrador</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </GradientScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: "3%",
    paddingTop: 25,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 25,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    marginBottom: 17,
  },
  roles: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7655ad",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  roleSelected: {
    backgroundColor: "#5E35B1",
    borderColor: "#b99aff",
  },
  roleText: {
    color: "#fff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#7E57C2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});