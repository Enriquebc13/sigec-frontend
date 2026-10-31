import { LinearGradient } from "expo-linear-gradient"; // 1. IMPORTANTE: Importar el componente
import { Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginForm } from "./components/LoginForm";


export default function LoginView() {
    return (
        <LinearGradient
            colors={['#5E35B1', '#1A0B2E', '#000000']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gradientContainer}
        >
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content"/>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled">

                        <Text style={styles.title}>SIGEC</Text>
                        <Text style={styles.description}>Sistema Integral de Gestion de Espacios Comerciales</Text>

                        <Image
                            style={styles.logo}
                            source={require("@/assets/images/Logo SIGEC_.png")}
                        />
                        <Text style={styles.title_login}>Inicio de sesión</Text>
                        <LoginForm />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        alignItems: "center",
        padding: 5,
    },
    title: {
        fontSize: 45,
        color: "#ffffff",
        fontWeight: "bold"
    },
    description: {
        fontSize: 20,
        color: "#8B88A0",
        textAlign: "center"
    },
    title_login: {
        marginTop:20,
        fontSize: 25,
        color: "#ffffff"
    },
    logo: {
        width: 250,
        height: 250,
        marginTop: 10,
    },
    keyboardAvoidingView: {
        flex: 1,
        width: '100%',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
    },
});