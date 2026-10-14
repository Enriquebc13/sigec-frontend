import { AuthProvider } from '@/modules/auth/presentation/context/AuthProvider';
import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <AuthProvider>
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
                    options={{headerShown: false}}
                />
                <Stack.Screen
                    name="(client)"
                    options={{headerShown: false}}
                />

            </Stack>
        </AuthProvider>
    );
}