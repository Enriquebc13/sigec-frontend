import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { drawerScreenOptions } from '@/components/navigation/drawerScreenOptions';
import AntDesign from "@expo/vector-icons/AntDesign";
import { Drawer } from 'expo-router/drawer';

export default function ClientLayout() {
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={drawerScreenOptions()}
    >
      <Drawer.Screen
        name="home"
        options={{
          headerShown: true,
          title: 'Inicio',
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={typeof color === "string" ? color : "#A99CBD"} />
          ),
        }}
      />

      <Drawer.Screen
        name="properties"
        options={{
          title: 'Propiedades',
          drawerLabel: 'Propiedades',
          drawerIcon: ({ color, size }) => (
            <AntDesign name="shop" size={size} color={typeof color === "string" ? color : "#A99CBD"} />
          ),
        }}
      />

      <Drawer.Screen
        name="requests"
        options={{
          title: 'Solicitudes',
          drawerLabel: 'Solicitudes',
          drawerIcon: ({ color, size }) => (
            <AntDesign name="file-text" size={size} color={typeof color === "string" ? color : "#A99CBD"} />
          ),
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: 'Perfil',
          drawerLabel: 'Perfil',
          drawerIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={typeof color === "string" ? color : "#A99CBD"} />
          ),
        }}
      />
    </Drawer>
  );
}