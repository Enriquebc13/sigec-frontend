import { ApiAuthProvider } from '@/modules/auth-api/presentation/context/ApiAuthProvider';
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <ApiAuthProvider>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#5E35B1',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="login"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="welcome"
                    options={{ headerShown: false, animation: "fade", gestureEnabled: false }}
                />
                {/* Login → Home: transición con desvanecido en lugar del deslizamiento brusco */}
                <Stack.Screen
                    name="(admin)"
                    options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                    name="(client)"
                    options={{ headerShown: false, animation: "fade" }}
                />
                <Stack.Screen
                    name="register"
                    options={{
                        headerShown: true,
                        title: "Crear cuenta",
                    }}
                />

            </Stack>
        </ApiAuthProvider>
    );
}