
import { Drawer } from 'expo-router/drawer';

export default function ClientLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerType: 'front',

        headerStyle: {
          backgroundColor: '#5E35B1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
         drawerStyle: { backgroundColor: "rgba(0,0,10,0.8)", width: 280 },
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#bbb",
        drawerLabelStyle: { fontSize: 20, marginTop: 10, fontWeight: "bold", padding:10 },

      }}
    >
      <Drawer.Screen
        name="home"
        options={{
          headerShown: true,
          title: 'Inicio',
          drawerLabel: 'Inicio',
        }}
      />

      <Drawer.Screen
        name="properties"
        options={{
          title: 'Propiedades',
          drawerLabel: 'Propiedades',
        }}
      />
      
      <Drawer.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          drawerLabel: 'Solicitudes',
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: 'Perfil',
          drawerLabel: 'Perfil',
        }}
      />
    </Drawer>
  );
}