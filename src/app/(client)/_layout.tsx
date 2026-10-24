import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { drawerScreenOptions } from '@/components/navigation/drawerScreenOptions';
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