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
                    name="(admin)"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="(client)"
                    options={{ headerShown: false }}
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