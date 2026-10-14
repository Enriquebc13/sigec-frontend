import { useAuth } from '@/modules/auth/presentation/context/AuthProvider';
import { Redirect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const { loading, checkLogued } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      
    );
  }

return (
  <Redirect
    href={
        //  Cambiar ruta
            (checkLogued() ? '/(admin)/home' : '/login') as Href
    }
  />
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});