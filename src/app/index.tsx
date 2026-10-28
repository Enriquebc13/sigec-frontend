import { useAuth } from '@/modules/auth/presentation/context/AuthProvider';
import { Redirect, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function IndexScreen() {
  const { user, loading, checkLogued } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5E35B1" />
      </View>
    );
  }

  const destination = checkLogued()
    ? (user?.role === 'ADMIN' ? '/(admin)/home' : '/(client)/home')
    : '/login';

  return <Redirect href={destination as Href} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A0B2E',
  },
});
